/* Offline, dependency-free A4 PDF report builder. Uses the PDF WinAnsi core font. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SupplierPDF = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CP1252 = { 0x20ac:0x80,0x201a:0x82,0x0192:0x83,0x201e:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02c6:0x88,0x2030:0x89,0x0160:0x8a,0x2039:0x8b,0x0152:0x8c,0x017d:0x8e,0x2018:0x91,0x2019:0x92,0x201c:0x93,0x201d:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02dc:0x98,0x2122:0x99,0x0161:0x9a,0x203a:0x9b,0x0153:0x9c,0x017e:0x9e,0x0178:0x9f };
  const trim = value => String(value ?? '').trim();
  const date = value => { if(!value)return ''; const d=new Date(String(value).length===10?`${value}T00:00:00`:value); return Number.isNaN(+d)?String(value):d.toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'}); };
  function pushValue(out,label,value){const v=trim(value);if(v)out.push({kind:'text',text:`${label}: ${v}`});}
  function makeReport(data){
    const {supplier:s={},contacts=[],visits=[],evaluation:e={},commonSections=[],criteria=[]}=data||{};
    const out=[];
    out.push({kind:'title',text:'Informe individual de proveedor'});
    out.push({kind:'subtitle',text:trim(s.name)||'Proveedor sin nombre'});
    pushValue(out,'Identificador',s.code);pushValue(out,'Fecha de generación',date(new Date().toISOString()));
    out.push({kind:'section',text:'Datos generales'});
    pushValue(out,'Empresa',s.legalName);pushValue(out,'Ubicación',[s.city,s.region,s.country].filter(Boolean).join(', '));
    pushValue(out,'Especialidades',(s.specialties||[]).join(', '));pushValue(out,'Estado',s.status);pushValue(out,'Página web',s.website);
    pushValue(out,'Dirección',s.address);pushValue(out,'Fecha de alta',date(s.createdAt));
    const contactLines=[];
    if(s.contactName)contactLines.push([s.contactName,s.contactRole,s.contactEmail,s.contactPhone,s.contactLanguage].filter(Boolean).join(' · '));
    for(const c of contacts){const line=[c.name,c.role,c.email,c.phone,c.language].filter(Boolean).join(' · ');if(line)contactLines.push(line);}
    if(contactLines.length){out.push({kind:'label',text:'Contactos'});contactLines.forEach(x=>out.push({kind:'bullet',text:x}));}
    pushValue(out,'Observaciones generales',s.notes);

    const orderedVisits=[...visits].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    if(orderedVisits.length){out.push({kind:'section',text:'Visitas y reuniones'});orderedVisits.forEach((v,i)=>{const facts=[date(v.date),v.time].filter(Boolean).join(' · ');out.push({kind:'label',text:`Visita ${i+1}${facts?` · ${facts}`:''}`});pushValue(out,'Lugar',v.place);pushValue(out,'Participantes SP-Berner',v.ourParticipants);pushValue(out,'Participantes del proveedor',v.theirParticipants);pushValue(out,'Objetivo',v.objective);pushValue(out,'Notas',v.summary);pushValue(out,'Acuerdos y próximos pasos',v.agreements);});}

    const common=[];
    for(const [section,questions] of commonSections){const items=[];for(const [question] of questions){const value=trim(e.answers?.[question]);if(value)items.push({label:question,value});}if(items.length)common.push({section,items});}
    const tech=Object.entries(e.tech||{}).map(([section,answers])=>({section,items:Object.entries(answers||{}).filter(([,v])=>trim(v)).map(([label,value])=>({label,value}))})).filter(x=>x.items.length);
    const scoreItems=criteria.map(([name,defaultWeight],i)=>({name,weight:Number(e.weights?.[i]??defaultWeight)||0,value:Number(e.scores?.[i])})).filter(x=>x.value>=1&&x.value<=5);
    const totalWeight=scoreItems.reduce((n,x)=>n+x.weight,0);const allWeight=(Array.isArray(e.weights)&&e.weights.length?e.weights:criteria.map(x=>x[1])).reduce((n,w)=>n+(Number(w)||0),0);const weighted=totalWeight?scoreItems.reduce((n,x)=>n+x.value*x.weight,0)/totalWeight:null;
    const requirementNames=['Acepta estándares y componentes especificados','Entrega programas fuente y documentación editable','Cumple requisitos de seguridad aplicables en Europa','Da soporte durante la instalación en Europa','Facilita referencias de proyectos similares'];
    const requirements=(e.requirements||[]).map((r,i)=>({label:requirementNames[i]||`Requisito ${i+1}`,status:trim(r?.status),note:trim(r?.note)})).filter(x=>x.status||x.note);
    if(common.length||tech.length||scoreItems.length||requirements.length||trim(e.comments)||trim(e.engineerOpinion)){out.push({kind:'section',text:'Evaluación técnica'});}
    common.forEach(group=>{out.push({kind:'label',text:group.section});group.items.forEach(x=>out.push({kind:'text',text:`${x.label}: ${x.value}`}));});
    tech.forEach(group=>{out.push({kind:'label',text:group.section});group.items.forEach(x=>out.push({kind:'text',text:`${x.label}: ${x.value}`}));});
    if(scoreItems.length){out.push({kind:'label',text:'Puntuaciones y ponderaciones'});scoreItems.forEach(x=>out.push({kind:'text',text:`${x.name}: ${x.value}/5 · peso ${x.weight}%`}));out.push({kind:'highlight',text:`Resultado ponderado: ${weighted.toFixed(2)} / 5 (${Math.round(weighted*20)}%) · cobertura ${allWeight?Math.round(totalWeight/allWeight*100):0}%`});}
    if(requirements.length){out.push({kind:'label',text:'Requisitos obligatorios'});requirements.forEach(x=>out.push({kind:'text',text:`${x.label}: ${x.status||'Pendiente'}${x.note?` · ${x.note}`:''}`}));}
    pushValue(out,'Observaciones de evaluación',e.comments);
    pushValue(out,'Opinión del ingeniero',e.engineerOpinion);

    const commercial=e.commercial||{};const commercialFields=[['Precio',commercial.price],['Moneda',commercial.currency],['Alcance y desglose',commercial.costBreakdown],['Plazo de entrega',commercial.leadTime],['Condiciones de pago',commercial.paymentTerms],['Incoterm',commercial.incoterm],['Garantía',commercial.warranty],['Costes adicionales',commercial.extraCosts],['Observaciones comerciales',commercial.comments]];
    const commercialItems=commercialFields.filter(([,v])=>trim(v));if(commercialItems.length){out.push({kind:'section',text:'Información comercial'});commercialItems.forEach(([label,value])=>pushValue(out,label,value));}
    return out;
  }
  function winAnsiHex(text){let hex='';for(const ch of String(text)){const cp=ch.codePointAt(0);const byte=cp<=0x7f||cp>=0xa0&&cp<=0xff?cp:CP1252[cp]??0x3f;hex+=byte.toString(16).padStart(2,'0');}return hex.toUpperCase();}
  function wrap(text,max){const words=String(text).split(/\s+/);const lines=[];let line='';for(let word of words){if(word.length>max){if(line){lines.push(line);line='';}while(word.length>max){lines.push(word.slice(0,max));word=word.slice(max);}if(word)line=word;continue;}if(!line){line=word;continue;}if((line+' '+word).length>max){lines.push(line);line=word;}else line+=' '+word;}if(line)lines.push(line);return lines.length?lines:[''];}
  function paginate(items){const pages=[[]];let y=754;const next=()=>{pages.push([]);y=754;};for(const item of items){if(item.kind==='section'){if(y<100)next();pages[pages.length-1].push({kind:'section',text:item.text,y});y-=27;continue;}const max=item.kind==='title'?52:item.kind==='subtitle'?65:104;const lines=wrap(item.text,max);for(let i=0;i<lines.length;i++){if(y<62)next();pages[pages.length-1].push({kind:i===0?item.kind:'continuation',text:lines[i],y});y-=item.kind==='title'?24:item.kind==='subtitle'?20:item.kind==='label'?17:14;}}return pages;}
  function buildPdf(data){
    const pages=paginate(makeReport(data));const objects=[];
    objects[1]='<< /Type /Catalog /Pages 2 0 R >>';
    const pageIds=pages.map((_,i)=>`${5+i*2} 0 R`).join(' ');objects[2]=`<< /Type /Pages /Kids [${pageIds}] /Count ${pages.length} >>`;
    objects[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';objects[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    pages.forEach((lines,i)=>{const contentId=6+i*2,pageId=5+i*2;let stream='0.071 0.231 0.212 rg 0 786 595 56 re f\n1 1 1 rg\n';stream+='BT /F2 12 Tf 48 808 Td <53502D4265726E6572> Tj ET\n';stream+=`BT /F1 8 Tf 48 794 Td <494E464F524D452044452050524F564545444F524553> Tj ET\n0 0 0 rg\n`;for(const line of lines){if(line.kind==='section'){stream+='0.071 0.231 0.212 rg\n';stream+=`BT /F2 12 Tf 48 ${line.y} Td <${winAnsiHex(line.text)}> Tj ET\n`;stream+=`0.75 0.81 0.79 RG 48 ${line.y-5} m 547 ${line.y-5} l S\n`;stream+='0 0 0 rg\n';}else if(line.kind==='title'){stream+=`BT /F2 19 Tf 48 ${line.y} Td <${winAnsiHex(line.text)}> Tj ET\n`;}else if(line.kind==='subtitle'){stream+=`BT /F2 13 Tf 48 ${line.y} Td <${winAnsiHex(line.text)}> Tj ET\n`;}else if(line.kind==='label'){stream+=`BT /F2 9 Tf 48 ${line.y} Td <${winAnsiHex(line.text)}> Tj ET\n`;}else if(line.kind==='highlight'){stream+='0.91 0.95 0.93 rg 48 '+(line.y-4)+' 499 17 re f\n';stream+=`0.071 0.231 0.212 rg BT /F2 9 Tf 54 ${line.y} Td <${winAnsiHex(line.text)}> Tj ET\n0 0 0 rg\n`;}else{stream+=`BT /F1 9 Tf ${line.kind==='bullet'?58:48} ${line.y} Td <${winAnsiHex(line.kind==='bullet'?`- ${line.text}`:line.text)}> Tj ET\n`;}}
      stream+='0.75 0.81 0.79 RG 48 38 m 547 38 l S\n';stream+=`BT /F1 8 Tf 48 24 Td <53502D4265726E6572207C20496E666F726D6520696E646976696475616C> Tj ET\n`;stream+=`BT /F1 8 Tf 510 24 Td <${winAnsiHex(`Página ${i+1} de ${pages.length}`)}> Tj ET\n`;
      objects[contentId]=`<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
      objects[pageId]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    });
    let pdf='%PDF-1.4\n%SPB\n';const offsets=[0];for(let i=1;i<objects.length;i++){offsets[i]=pdf.length;pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;}const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;for(let i=1;i<objects.length;i++)pdf+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new TextEncoder().encode(pdf);
  }
  return { makeReport, buildPdf };
});
