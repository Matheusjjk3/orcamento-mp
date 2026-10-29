"use strict";
const $=id=>document.getElementById(id);const currency=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
const rates={branco:1260,amadeirado:1470,ripado:1260,provencal:1911};let lastFurnitureValue=null;
function openTab(id){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id));}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.tab)));
$('formMoveis').addEventListener('submit',event=>{event.preventDefault();const h=Number($('altura').value),w=Number($('largura').value);if(!(h>0&&w>0))return;const value=h*w*rates[$('material').value]/1000000;lastFurnitureValue=value;$('resultadoMoveis').innerHTML=`<span>VALOR ESTIMADO</span><strong>${currency(value)}</strong><small>Medidas: ${h} × ${w} mm</small>`;$('usarNoPdf').disabled=false;});
$('usarNoPdf').addEventListener('click',()=>{if(lastFurnitureValue===null)return;$('avista').value=lastFurnitureValue.toFixed(2).replace('.',',');updateQuote();openTab('pdf');});
$('formCorte').addEventListener('submit',event=>{event.preventDefault();const len=Number($('comprimento').value),speed=Number($('velocidade').value);if(!(len>0&&speed>0))return;const min=len/speed/60,cost=min*5;$('resultadoCorte').innerHTML=`<span>CUSTO DO CORTE</span><strong>${currency(cost)}</strong><small>Tempo estimado: ${min.toFixed(1).replace('.',',')} min</small>`;});
function parseBRL(s){s=String(s).trim().replace(/\s/g,'').replace(/R\$/g,'');if(!s)return NaN;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return Number(s);}
function updateQuote(){const cash=parseBRL($('avista').value);const valid=Number.isFinite(cash)&&cash>0;const credit=valid?Math.round(cash*115)/100:0;const instalment=Math.round(credit/12*100)/100;$('mostraAvista').textContent=valid?currency(cash):'—';$('mostraPrazo').textContent=valid?currency(credit):'—';$('mostraParcelas').textContent=valid?currency(instalment):'—';return valid?{cash,credit,instalment}:null;}
$('avista').addEventListener('input',updateQuote);
function dateBR(d){return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});}
// Monta o documento com os dados digitados, mantendo as tabelas e regras originais.
function fillProposal(q){
 const now=new Date(),until=new Date(now.getFullYear(),now.getMonth(),now.getDate()+7);
 $('docData').textContent=dateBR(now);$('docValidade').textContent=dateBR(until);
 $('docCliente').textContent=$('cliente').value.trim();
 $('docProjeto').textContent=$('projeto').value.trim();
 $('docDescricao').textContent=$('descricao').value.trim();
 $('docPrazo').textContent=$('prazo').value+' dias úteis';
 $('docAvista').textContent=currency(q.cash);
 $('docPrazoTotal').textContent=currency(q.credit);
 $('docParcela').textContent=currency(q.instalment);
}
function filenamePiece(s){return String(s).trim().replace(/[\\/:*?"<>|\x00-\x1f]/g,'').replace(/\s+/g,' ').replace(/[. ]+$/g,'').slice(0,80)||'Sem nome';}
let generating=false;
$('formPdf').addEventListener('submit',async event=>{
 event.preventDefault();if(generating)return;
 const q=updateQuote();if(!q){alert('Preencha um valor à vista válido.');return;}
 fillProposal(q);
 const filename=filenamePiece($('cliente').value)+' ('+filenamePiece($('projeto').value)+').pdf';
 const status=$('pdfStatus'),button=$('btnGerarPdf'),area=$('printArea');
 if(typeof window.html2canvas!=='function'||!window.jspdf?.jsPDF){
  status.textContent='Não foi possível carregar a ferramenta de PDF. Conecte o celular à internet e atualize o site.';
  return;
 }
 generating=true;button.disabled=true;button.textContent='Preparando PDF…';status.textContent='Gerando '+filename;
 try{
  area.classList.add('pdf-export');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const canvas=await window.html2canvas(area,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:1100});
  if(!canvas.width||!canvas.height)throw new Error('Não foi possível montar o orçamento.');
  const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  const marginX=7,marginY=5,usableW=210-2*marginX,usableH=297-2*marginY;
  // Ajusta largura e altura à área útil: sempre uma única folha A4.
  const ratio=Math.min(usableW/canvas.width,usableH/canvas.height);
  const w=canvas.width*ratio,h=canvas.height*ratio;
  pdf.addImage(canvas.toDataURL('image/jpeg',0.94),'JPEG',marginX,marginY,w,h,undefined,'FAST');
  pdf.save(filename);
  status.textContent='PDF gerado: '+filename+' — caso não apareça, confira a pasta Downloads.';
 }catch(error){console.error(error);status.textContent='Erro ao gerar o PDF. Verifique sua conexão e tente novamente.';}
 finally{area.classList.remove('pdf-export');generating=false;button.disabled=false;button.textContent='Gerar proposta em PDF';}
});
updateQuote();
