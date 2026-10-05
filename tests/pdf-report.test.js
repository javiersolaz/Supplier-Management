const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPdf, makeReport } = require('../pdf-report.js');
const { toVisit, weights } = require('../data-migration.js');
const criteria=['Capacidad de ingeniería','Personalización','Calidad y componentes','Metodología y gestión','Plazos y capacidad productiva','Software y licencias','Servicio posventa y soporte','Condiciones comerciales','Experiencia y referencias'];

test('reports general company data and independent visit details', () => {
  const pdf=Buffer.from(buildPdf({supplier:{code:'SP-01',name:'Fábrica Ágil',country:'China',city:'Suzhou',specialties:['AGV / AMR','Robótica personalizada'],notes:'Fabricante con ingeniería propia.'},contacts:[{name:'Li Wei',role:'Sales'}],criteria,commonSections:['Empresa y capacidades'],visits:[{date:'2026-09-02',place:'Suzhou',ourParticipants:'Ana',theirParticipants:'Li Wei',contactNames:['Li Wei'],summary:'Visita inicial',generalEvaluation:{answers:{'Número de empleados':'240'},scores:{0:4,2:5},weights:[18,10,14,12,12,8,10,8,8],criterionNames:criteria,sectionComments:{0:'Equipo estable'},criterionComments:{0:'No debe aparecer como comentario por criterio'},requirements:[{status:'Cumple',note:'Documentación disponible'}],commercial:{price:'125000',currency:'EUR',scope:'Línea de referencia',paymentTerms:'30/70',incoterm:'FCA',leadTime:'5 meses',warranty:'2 años',other:'Precios orientativos',comments:'Revisar alcance'},engineerOpinion:'Buena capacidad general.'}},{date:'2026-09-15',place:'Shanghai',summary:'Segunda visita',generalEvaluation:{scores:{1:3},weights:[18,10,14,12,12,8,10,8,8],criterionNames:criteria,engineerOpinion:'Pendiente de nuevas referencias.'}}]})).toString('latin1');
  assert.ok(pdf.startsWith('%PDF-1.4'));assert.ok(pdf.endsWith('%%EOF'));
  for(const value of ['Fábrica Ágil','Fabricante con ingeniería propia.','AGV / AMR','Visita 1','Visita 2','Número de empleados: 240','Capacidad de ingeniería: 4/5','Empresa y capacidades: Equipo estable','Documentación disponible','125000','FCA','Buena capacidad general.','Pendiente de nuevas referencias.'])assert.ok(pdf.includes(Buffer.from(value,'latin1').toString('hex').toUpperCase()),`missing ${value}`);
  assert.ok(!pdf.includes('Evaluación técnica'));assert.ok(!pdf.includes(Buffer.from('No debe aparecer como comentario por criterio','latin1').toString('hex').toUpperCase()));
});

test('omits empty optional visit sections and excludes legacy project-specific fields',()=>{
  const report=makeReport({supplier:{name:'Proveedor breve'},visits:[{date:'2026-09-01',generalEvaluation:{legacyTechnical:{'Paletizado':{Cadencia:'120 cajas/min'}},scores:{},requirements:[],commercial:{}}}]});
  assert.ok(!report.some(x=>/Paletizado|Cadencia|Evaluación técnica/.test(x.text)));
  assert.ok(!report.some(x=>x.text.includes('Información comercial de esta visita')));
});

test('paginates long visit records into valid pages',()=>{
  const text=Array.from({length:110},(_,i)=>`Observación ${i+1}: ${'detalle general '.repeat(13)}`).join('\n');
  const pdf=Buffer.from(buildPdf({supplier:{name:'Informe extenso'},visits:[{date:'2026-09-01',summary:text}],criteria})).toString('latin1');
  const count=Number(pdf.match(/\/Count (\d+)/)?.[1]||0);assert.ok(count>1);assert.equal((pdf.match(/BT \/F1 8 Tf 510 24 Td <[0-9A-F]+> Tj ET/g)||[]).length,count);assert.ok(pdf.includes('xref\n'));
});

test('migrates a supplier evaluation into the most recent visit and keeps old technical data archived',()=>{
  const old={id:'eval-1',supplierId:'supplier-1',answers:{'Ingeniería propia':'Sí'},scores:{0:5,1:4,2:3},weights:[25,20,15,15,10,5,10],tech:{'Paletizado':{Cadencia:'120/min'}},requirements:[{status:'Cumple'}],commercial:{currency:'EUR'},engineerOpinion:'Buen proveedor',updatedAt:'2026-09-20T10:00:00Z'};
  const visits=[{id:'visit-old',supplierId:'supplier-1',date:'2026-09-10'},{id:'visit-new',supplierId:'supplier-1',date:'2026-09-19'}];
  const migrated=toVisit(old,visits,criteria.map((name,i)=>[name,[18,10,14,12,12,8,10,8,8][i]]));
  assert.equal(migrated.id,'visit-new');assert.equal(old.tech.Paletizado.Cadencia,'120/min');assert.equal(migrated.generalEvaluation.answers['Ingeniería propia'],'Sí');assert.deepEqual(migrated.generalEvaluation.scores,{0:4,2:3});
});

test('creates a historic visit when an old evaluation has no visit',()=>{
  const old={id:'eval-orphan',supplierId:'supplier-2',answers:{'Certificaciones e idiomas':'ISO 9001'},updatedAt:'2026-09-01T12:00:00Z'};
  const migrated=toVisit(old,[],criteria.map(name=>[name,10]));
  assert.equal(migrated.supplierId,'supplier-2');assert.equal(migrated.date,'2026-09-01');assert.equal(migrated.summary,'Evaluación anterior migrada');assert.equal(migrated.generalEvaluation.answers['Certificaciones e idiomas'],'ISO 9001');
});


test('migrates configurable legacy weights to the new criteria and retains a 100 percent total',()=>{const result=weights([25,20,15,15,10,5,10],criteria.map(name=>[name,10]));assert.equal(result.length,9);assert.equal(result.reduce((a,b)=>a+b,0),100);});
