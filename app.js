const $=s=>document.querySelector(s);
let counter=Number(localStorage.getItem("atd_service_counter")||"1");
const reportNo=()=>`SR_ATD_22AD0005${String(counter).padStart(3,"0")}`;
$("#reportNo").textContent=reportNo(); $("#reportInput").value=reportNo();

const now=new Date(), localDate=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
document.querySelector('[name="serviceDate"]').value=localDate;
function updateApprovalTime(){const n=new Date();$("#approvalTime").textContent=n.toLocaleString("en-CA",{dateStyle:"medium",timeStyle:"short"});}
updateApprovalTime(); setInterval(updateApprovalTime,30000);

document.querySelectorAll(".type").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".type").forEach(x=>x.classList.remove("active"));b.classList.add("active");
 document.querySelector('[name="serviceType"]').value=b.dataset.value;
}));
const statusIcons={
 "Completed":"✓",
 "Unable to Complete":"×",
 "Follow-up Required":"◷",
 "Completed – Further Work Required":"🔧"
};
document.querySelectorAll(".status").forEach(b=>{
 const label=b.textContent.trim();
 b.innerHTML=`<span class="status-icon">${statusIcons[b.dataset.value]||"●"}</span> ${label.replace(/^●\\s*/,"").replace(/^◷\\s*/,"")}`;
 b.addEventListener("click",()=>{
   document.querySelectorAll(".status").forEach(x=>x.classList.remove("active"));
   b.classList.add("active");
   document.querySelector('[name="result"]').value=b.dataset.value;
 });
});

function addEquipment(){
 const w=document.createElement("div");w.className="repeat equipment";
 w.innerHTML=`<div class="grid six">
<label>Equipment / Machine<input name="equipment" placeholder="e.g. Temperature Controller"></label>
<label>Manufacturer<input name="manufacturer" placeholder="e.g. JUMO"></label>
<label>Model<input name="model" placeholder="e.g. dTRON 304"></label>
<label>Serial Number<input name="serial" placeholder="e.g. 12345678"></label>
<label>Part Number<input name="partNumber" placeholder="e.g. 703044/..."></label>
<label>Location / Tag<input name="location" placeholder="e.g. Line 2 – Oven #3"></label>
</div><button type="button" class="remove" onclick="removeRow(this)">🗑</button>`;
 $("#equipmentList").appendChild(w);
}
function addPart(){
 const r=document.createElement("div");r.className="part-row";
 r.innerHTML=`<input placeholder="Part No." name="partNo"><input placeholder="Description" name="partDesc"><input placeholder="Qty" name="qty" type="number" min="0" step="1"><button type="button" onclick="removeRow(this)">×</button>`;
 $("#partsList").appendChild(r);
}
function removeRow(btn){const row=btn.closest(".repeat,.part-row");if(row&&row.parentElement.children.length>1)row.remove();}

const canvas=$("#signature"),ctx=canvas.getContext("2d");let drawing=false,hasSig=false;
function pos(e){const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return[(p.clientX-r.left)*canvas.width/r.width,(p.clientY-r.top)*canvas.height/r.height]}
function start(e){e.preventDefault();drawing=true;hasSig=true;const[x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y)}
function move(e){if(!drawing)return;e.preventDefault();const[x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke()}
function end(){drawing=false}
ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";
["mousedown","mousemove","mouseup","mouseleave"].forEach(ev=>canvas.addEventListener(ev,{mousedown:start,mousemove:move,mouseup:end,mouseleave:end}[ev]));
canvas.addEventListener("touchstart",start,{passive:false});canvas.addEventListener("touchmove",move,{passive:false});canvas.addEventListener("touchend",end);
function clearSignature(){ctx.clearRect(0,0,canvas.width,canvas.height);hasSig=false}

function collect(){
 const fd=new FormData($("#serviceForm")),o=Object.fromEntries(fd.entries());
 o.reportNo=reportNo();
 const readInputs=el=>Object.fromEntries([...el.querySelectorAll("input,select,textarea")].filter(i=>i.name).map(i=>[i.name,i.value]));
 o.equipment=[...document.querySelectorAll(".equipment")].map(readInputs);
 o.parts=[...document.querySelectorAll(".part-row")].map(readInputs).filter(x=>x.partNo||x.partDesc||x.qty);
 o.signature=hasSig?canvas.toDataURL("image/png"):"";o.generatedAt=new Date().toISOString();return o;
}
$("#serviceForm").addEventListener("submit",e=>{
 e.preventDefault();
 const form=$("#serviceForm");
 if(!form.checkValidity()){form.reportValidity();return}
 if(!hasSig){alert("Customer signature is required.");return}
 const o=collect();localStorage.setItem("atd_last_report",JSON.stringify(o));
 counter=Math.min(counter+1,999);localStorage.setItem("atd_service_counter",String(counter));
 form.classList.add("hidden");$(".footer-actions").classList.add("hidden");$("#review").classList.remove("hidden");
 const eqRows=(o.equipment||[]).map(e=>`<tr><td>${escapeHtml(e.equipment||"—")}</td><td>${escapeHtml(e.manufacturer||"—")}</td><td>${escapeHtml(e.model||"—")}</td><td>${escapeHtml(e.serial||"—")}</td></tr>`).join("");
 const partRows=(o.parts||[]).map(p=>`<tr><td>${escapeHtml(p.partNo||"—")}</td><td>${escapeHtml(p.partDesc||"—")}</td><td>${escapeHtml(p.qty||"—")}</td></tr>`).join("");
 const statusClass={"Completed":"review-completed","Unable to Complete":"review-unable","Follow-up Required":"review-followup","Completed – Further Work Required":"review-further"}[o.result]||"review-completed";
 $("#reviewContent").innerHTML=`
 <div class="review-header"><div><div class="review-kicker">CUSTOMER REVIEW</div><h2>${escapeHtml(o.reportNo)}</h2></div><div class="review-status ${statusClass}">${escapeHtml(o.result||"Completed")}</div></div>
 <div class="review-grid">
   <div><span>Customer</span><strong>${escapeHtml(o.company||"—")}</strong></div>
   <div><span>Contact Person</span><strong>${escapeHtml(o.contact||"—")}</strong></div>
   <div><span>Service Date</span><strong>${escapeHtml(o.serviceDate||"—")}</strong></div>
   <div><span>Technician</span><strong>${escapeHtml(o.technician||"—")}</strong></div>
   <div><span>PO Number</span><strong>${escapeHtml(o.po||"—")}</strong></div>
   <div><span>Customer Work Order</span><strong>${escapeHtml(o.workOrder||"—")}</strong></div>
 </div>
 <div class="review-section"><h3>Equipment</h3><table><thead><tr><th>Equipment / Machine</th><th>Manufacturer</th><th>Model</th><th>Serial Number</th></tr></thead><tbody>${eqRows||'<tr><td colspan="4">No equipment recorded.</td></tr>'}</tbody></table></div>
 <div class="review-section"><h3>Work Performed</h3><div class="review-text">${escapeHtml(o.work||"—")}</div></div>
 <div class="review-section"><h3>Parts / Materials Used</h3><table><thead><tr><th>Part Number</th><th>Description</th><th>Qty</th></tr></thead><tbody>${partRows||'<tr><td colspan="3">No parts or materials recorded.</td></tr>'}</tbody></table></div>
 <div class="review-grid">
   <div><span>Technician Notes</span><strong>${escapeHtml(o.techNotes||"—")}</strong></div>
   <div><span>Customer Comments</span><strong>${escapeHtml(o.customerComments||"—")}</strong></div>
   <div><span>Customer Name</span><strong>${escapeHtml(o.customerName||"—")}</strong></div>
   <div><span>Signature</span><strong class="signed">✓ Signature captured</strong></div>
 </div>
 <div class="review-acceptance">Customer acceptance has been recorded for this Service Report.</div>
 <div class="review-actions"><button type="button" id="generateCustomerPdf" class="primary-btn">GENERATE CUSTOMER PDF</button><button type="button" id="printReview" class="secondary-btn">PRINT REVIEW</button></div>
 <p class="next-report">Next Service Report: <strong>${reportNo()}</strong></p>`;
 $("#generateCustomerPdf").addEventListener("click",generatePDF);
 $("#printReview").addEventListener("click",()=>window.print());

 window.scrollTo({top:0,behavior:"smooth"});
});
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function generatePDF(){
 try{
  const o=JSON.parse(localStorage.getItem("atd_last_report")||"null");
  if(!o){alert("No completed service report is available.");return}

  if(!window.jspdf || !window.jspdf.jsPDF){
    alert("PDF engine is not loaded. Please refresh the page and try again.");
    return;
  }
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"letter"});
  const W=doc.internal.pageSize.getWidth();
  const M=14;
  const logo=new Image();
  logo.src="atd-logo.png";
  await new Promise(resolve=>{logo.onload=resolve;logo.onerror=resolve});

  // ATD-inspired brand colors.
  const navy=[15,43,91], yellow=[255,223,34], green=[0,166,81];
  const lightGreen=[228,244,194], lightRed=[255,218,221], lightBlue=[217,235,255];

  function section(title,y){
    doc.setFillColor(...yellow);doc.roundedRect(M,y,W-2*M,8,1.5,1.5,"F");
    doc.setTextColor(25,35,50);doc.setFont("helvetica","bold");doc.setFontSize(10);
    doc.text(title,M+4,y+5.3);return y+12;
  }
  function field(x,y,w,label,value,fill=false){
    if(fill){doc.setFillColor(255,248,191);doc.roundedRect(x,y,w,13,1,"F")}
    doc.setDrawColor(205,213,222);doc.roundedRect(x,y,w,13,1,"S");
    doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(65,76,90);doc.text(label.toUpperCase(),x+3,y+4);
    doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(25,35,50);
    const lines=doc.splitTextToSize(String(value||"—"),w-6);doc.text(lines.slice(0,2),x+3,y+9);
  }
  function ensure(y,need=20){if(y+need>270){doc.addPage();return 16}return y}

  if(logo.complete && logo.naturalWidth){
    const ratio=logo.naturalHeight/logo.naturalWidth;
    const lw=53,lh=lw*ratio;
    doc.addImage(logo,"PNG",M,8,lw,Math.min(lh,20),"ATDLOGO");
  }
  doc.setFont("helvetica","bold");doc.setFontSize(19);doc.setTextColor(...navy);
  doc.text("SERVICE REPORT",W/2,15,{align:"center"});
  doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(90,102,118);doc.text("CUSTOMER COPY",W/2,24,{align:"center"});
  doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(80,94,112);
  doc.text("Field Service Report & Customer Acceptance",W/2,20,{align:"center"});

  doc.setFillColor(255,248,191);doc.setDrawColor(229,207,28);
  doc.roundedRect(W-72,8,58,15,2,2,"FD");
  doc.setFont("helvetica","bold");doc.setFontSize(6.5);doc.setTextColor(50,58,68);
  doc.text("SERVICE REPORT NO.",W-69,13);
  doc.setFont("courier","bold");doc.setFontSize(8);doc.text(o.reportNo,W-69,18.5);

  let y=29;
  y=section("1. CUSTOMER INFORMATION",y);
  field(M,y,58,"Company Name",o.company,true);
  field(M+61,y,58,"Contact Person",o.contact);
  field(M+122,y,62,"Email",o.email);
  y+=16;
  field(M,y,58,"Phone",o.phone);
  field(M+61,y,88,"Service Address",o.address);
  field(M+152,y,32,"City",o.city);
  y+=16;
  field(M,y,58,"Province",o.province);
  field(M+61,y,58,"Postal Code",o.postal);
  y+=19;

  y=section("2. SERVICE INFORMATION",y);
  field(M,y,43,"Service Date",o.serviceDate,true);
  field(M+46,y,48,"Technician",o.technician);
  field(M+97,y,38,"PO Number",o.po);
  field(M+138,y,46,"Work Order",o.workOrder);
  y+=16;
  field(M,y,184,"Service Type",o.serviceType);
  y+=19;

  y=section("3. EQUIPMENT INFORMATION",y);
  const eqRows=(o.equipment||[]).map(e=>[
    e.equipment||"—",e.manufacturer||"—",e.model||"—",e.serial||"—",e.partNumber||"—",e.location||"—"
  ]);
  doc.autoTable({
    startY:y,margin:{left:M,right:M},head:[["Equipment / Machine","Manufacturer","Model","Serial Number","Part Number","Location / Tag"]],
    body:eqRows.length?eqRows:[["—","—","—","—","—","—"]],
    theme:"grid",styles:{font:"helvetica",fontSize:7,cellPadding:2.2,textColor:[30,40,55],lineColor:[205,213,222],lineWidth:.2},
    headStyles:{fillColor:[244,247,250],textColor:[45,60,80],fontStyle:"bold",fontSize:6.8},
    columnStyles:{0:{cellWidth:38},1:{cellWidth:29},2:{cellWidth:28},3:{cellWidth:30},4:{cellWidth:30},5:{cellWidth:29}}
  });
  y=doc.lastAutoTable.finalY+7;

  y=ensure(y,45); y=section("4. WORK PERFORMED & MATERIALS",y);
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("WORK PERFORMED",M,y+3);
  doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(25,35,50);
  const workLines=doc.splitTextToSize(o.work||"—",W-2*M-2);
  let workH=Math.max(20,Math.min(48,workLines.length*4+8));
  doc.setDrawColor(205,213,222);doc.roundedRect(M,y+6,W-2*M,workH,1,1,"S");
  doc.text(workLines.slice(0,10),M+3,y+11);
  y+=workH+8;

  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("PARTS / MATERIALS USED",M,y+3);
  const partRows=(o.parts||[]).map(p=>[p.partNo||"—",p.partDesc||"—",p.qty||"—"]);
  doc.autoTable({
    startY:y+6,margin:{left:M,right:M},head:[["Part Number","Description","Qty"]],body:partRows.length?partRows:[["—","No parts / materials recorded","—"]],
    theme:"grid",styles:{font:"helvetica",fontSize:8,cellPadding:2.2,textColor:[30,40,55],lineColor:[205,213,222],lineWidth:.2},
    headStyles:{fillColor:[244,247,250],textColor:[45,60,80],fontStyle:"bold"},
    columnStyles:{0:{cellWidth:48},1:{cellWidth:111},2:{cellWidth:25}}
  });
  y=doc.lastAutoTable.finalY+8;

  y=ensure(y,35);
  // Service status — semantic color, no red frame around the whole block.
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("SERVICE RESULT / STATUS",M,y+3);
  const status=o.result||"Completed";
  let bg=[255,248,191], edge=[200,180,30], fg=[60,60,40];
  if(status==="Completed"){bg=[233,248,239];edge=[0,166,81];fg=[17,107,58]}
  else if(status==="Unable to Complete"){bg=[255,240,241];edge=[237,28,36];fg=[163,22,28]}
  else if(status==="Follow-up Required"){bg=[234,244,255];edge=[0,114,206];fg=[7,84,154]}
  else if(status==="Completed – Further Work Required"){bg=[240,249,223];edge=[164,210,51];fg=[79,110,11]}
  doc.setFillColor(...bg);doc.setDrawColor(...edge);doc.roundedRect(M,y+6,W-2*M,13,2,2,"FD");
  doc.setTextColor(...fg);doc.setFontSize(10);doc.text(status,M+5,y+14);
  y+=25;

  field(M,y,89,"Technician Notes",o.techNotes);
  field(M+95,y,89,"Customer Comments",o.customerComments);
  y+=29;

  y=ensure(y,55); y=section("5. CUSTOMER APPROVAL",y);
  field(M,y,62,"Customer Name",o.customerName,true);
  field(M+67,y,117,"Approval / Record", "Customer acceptance confirmed");
  y+=18;

  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("CUSTOMER SIGNATURE",M,y+3);
  doc.setDrawColor(140,155,170);doc.roundedRect(M,y+6,90,38,1.5,1.5,"S");
  if(o.signature){
    try{doc.addImage(o.signature,"PNG",M+3,y+9,84,31,"SIGNATURE")}
    catch(e){}
  }
  doc.setFillColor(242,246,249);doc.setDrawColor(210,218,226);doc.roundedRect(M+96,y+6,88,38,1.5,1.5,"FD");
  doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(65,78,95);
  const ack="I acknowledge that the services described above have been performed and that this Service Report accurately records the work completed.";
  doc.text(doc.splitTextToSize(ack,80),M+100,y+12);
  doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("Approval recorded:",M+100,y+38);
  doc.setFont("helvetica","normal");doc.text(new Date(o.generatedAt||Date.now()).toLocaleString("en-CA"),M+123,y+38);

  doc.setDrawColor(...navy);doc.line(M,276,W-M,276);
  doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(...navy);
  doc.text("AUTOMATIONTODAYCA",M,281);
  doc.setFont("helvetica","normal");doc.setTextColor(100,112,128);
  doc.text("Customer Copy • Field Service Report",W-M,281,{align:"right"});

  doc.save(`${o.reportNo}.pdf`);
 }catch(err){
   console.error("Customer PDF generation failed:",err);
   alert("Customer PDF could not be generated. Please refresh the page and try again.");
 }
}
function downloadData(){generatePDF();}
