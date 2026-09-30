const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPdf, makeReport } = require('../pdf-report.js');

const criteria = [['Capacidad técnica', 60], ['Postventa', 40]];
const commonSections = [['General', [['Actividad', 'text'], ['Ingeniería propia', 'choice']]]];

test('creates a valid offline PDF with supplier, evaluation and several visits', () => {
  const input = {
    supplier: { code:'CF26-AGV-001',name:'Fábrica Ágil',country:'China',city:'Suzhou',specialties:['AGV / AMR'],createdAt:'2026-09-01T10:00:00Z' },
    contacts: [{name:'Li Wei',role:'Sales',email:'li@example.test'}],
    visits: [
      {date:'2026-09-02',place:'Suzhou',objective:'Primera reunión',summary:'Línea automática'},
      {date:'2026-09-05',place:'Shanghai',summary:'Prueba de muestras'}
    ],
    evaluation: {answers:{Actividad:'Automatización'},scores:{0:4,1:5},weights:[60,40],engineerOpinion:'Buena capacidad técnica.',commercial:{currency:'EUR',price:'125000',incoterm:'FCA'}},
    commonSections, criteria
  };
  const pdf = buildPdf(input);
  const raw = Buffer.from(pdf).toString('latin1');
  assert.ok(raw.startsWith('%PDF-1.4'));
  assert.ok(raw.endsWith('%%EOF'));
  assert.match(raw,/\/Count 1\b/);
  assert.ok(raw.includes('46E1627269636120C167696C')); // Fábrica Ágil encoded as WinAnsi hex
  assert.ok(raw.includes('5072696D657261207265756E69F36E')); // Primera reunión
  assert.ok(raw.includes('507275656261206465206D75657374726173')); // Prueba de muestras
  assert.ok(raw.includes('526573756C7461646F20706F6E64657261646F')); // weighted result label
});

test('omits empty optional sections and preserves engineer wording', () => {
  const input = {
    supplier: {name:'Proveedor breve'}, contacts:[], visits:[],
    evaluation:{engineerOpinion:'No homologar todavía: falta validar FAT.'},
    commonSections, criteria
  };
  const report = makeReport(input);
  const sections = report.filter(x=>x.kind==='section').map(x=>x.text);
  assert.deepEqual(sections,['Datos generales','Evaluación técnica']);
  assert.ok(report.some(x=>x.text==='Opinión del ingeniero: No homologar todavía: falta validar FAT.'));
  assert.ok(!report.some(x=>x.text==='Información comercial'));
});

test('paginates long records and writes page numbers without splitting the PDF structure', () => {
  const reportText = Array.from({length:110},(_,i)=>`Observación ${i+1}: ${'detalle técnico '.repeat(13)}`).join('\n');
  const pdf = Buffer.from(buildPdf({supplier:{name:'Informe extenso'},visits:[{date:'2026-09-01',summary:reportText}],evaluation:{},commonSections,criteria})).toString('latin1');
  const pageCount = Number(pdf.match(/\/Count (\d+)/)?.[1]||0);
  assert.ok(pageCount>1);
  assert.equal((pdf.match(/BT \/F1 8 Tf 510 24 Td <[0-9A-F]+> Tj ET/g)||[]).length,pageCount);
  assert.ok(pdf.includes('xref\n'));
});
