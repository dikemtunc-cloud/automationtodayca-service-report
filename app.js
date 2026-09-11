const $=s=>document.querySelector(s);
let counter=Number(localStorage.getItem("atd_service_counter")||"1");
const DELIVERY_CONFIG = {
  url: "https://script.google.com/macros/s/AKfycbyHSbleHz_s9EQR2ygDsty05QkRBsSK3aIocfO8PiiFykhYILlFsXDkRWyGPE5TS4Iw/exec",
  token: "PUT_YOUR_NEW_ATD_SECRET_HERE"
};

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
function renderReview(o,finalized=false){
 const eqRows=(o.equipment||[]).map(e=>`<tr><td>${escapeHtml(e.equipment||"—")}</td><td>${escapeHtml(e.manufacturer||"—")}</td><td>${escapeHtml(e.model||"—")}</td><td>${escapeHtml(e.serial||"—")}</td></tr>`).join("");
 const partRows=(o.parts||[]).map(p=>`<tr><td>${escapeHtml(p.partNo||"—")}</td><td>${escapeHtml(p.partDesc||"—")}</td><td>${escapeHtml(p.qty||"—")}</td></tr>`).join("");
 const statusClass={"Completed":"review-completed","Unable to Complete":"review-unable","Follow-up Required":"review-followup","Completed – Further Work Required":"review-further"}[o.result]||"review-completed";
 const acceptance=finalized
   ? `<div class="review-acceptance confirmed">✓ Customer acceptance has been confirmed for this Service Report.</div>`
   : `<div class="review-acceptance pending">Please review all information carefully. Use <strong>EDIT REPORT</strong> if anything needs to be corrected. Final acceptance is completed only after <strong>SUBMIT &amp; CONFIRM</strong>.</div>`;
 const actions=finalized
   ? `<div class="review-actions"><button type="button" id="editReport" class="secondary-btn">EDIT REPORT</button><button type="button" id="generateCustomerPdf" class="primary-btn">GENERATE CUSTOMER PDF</button><button type="button" id="printReview" class="secondary-btn">PRINT REVIEW</button></div>`
   : `<div class="review-actions"><button type="button" id="editReport" class="secondary-btn">EDIT REPORT</button><button type="button" id="submitConfirm" class="primary-btn">SUBMIT &amp; CONFIRM</button></div>`;
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
 ${acceptance}
 ${actions}
 <p class="next-report">Next Service Report: <strong>${reportNo()}</strong></p>`;

 $("#editReport").addEventListener("click",()=>{
   $("#review").classList.add("hidden");
   $("#serviceForm").style.display="";
   const legacyActions=document.querySelector(".footer-actions");
   if(legacyActions) legacyActions.style.display="flex";
   window.scrollTo({top:0,behavior:"smooth"});
 });
 if(finalized){
   $("#generateCustomerPdf").addEventListener("click",generatePDF);
   $("#printReview").addEventListener("click",()=>window.print());
 }else{
   $("#submitConfirm").addEventListener("click",()=>{
     const latest=collect();
     localStorage.setItem("atd_last_report",JSON.stringify(latest));
     counter=Math.min(counter+1,999);
     localStorage.setItem("atd_service_counter",String(counter));
     latest.finalizedAt=new Date().toISOString();
     localStorage.setItem("atd_last_report",JSON.stringify(latest));
     renderReview(latest,true);
     window.scrollTo({top:0,behavior:"smooth"});
   });
 }
}

$("#serviceForm").addEventListener("submit",e=>{
 e.preventDefault();
 const form=$("#serviceForm");
 if(!form.checkValidity()){form.reportValidity();return}
 if(!hasSig){alert("Customer signature is required.");return}
 const o=collect();
 // This is a review/draft stage. Do not increment the report number or record final acceptance yet.
 localStorage.setItem("atd_pending_report",JSON.stringify(o));
 form.style.display="none";
 const legacyActions=document.querySelector(".footer-actions");
 if(legacyActions) legacyActions.style.display="none";
 $("#review").classList.remove("hidden");
 renderReview(o,false);
 window.scrollTo({top:0,behavior:"smooth"});
});
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function generatePDF(){
 try{
  const o=JSON.parse(localStorage.getItem("atd_last_report")||"null");
  if(!o){alert("No completed service report is available.");return}
  if(!window.jspdf || !window.jspdf.jsPDF){
    alert("PDF engine is not loaded. Please refresh the page and try again.");return;
  }

  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"letter"});
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight(), M=14;
  const navy=[15,43,91], yellow=[255,223,34];
  const logo=new Image(); logo.src="atd-logo.png";
  await new Promise(resolve=>{logo.onload=resolve;logo.onerror=resolve});

  function textLines(text,w,size=8){doc.setFontSize(size);return doc.splitTextToSize(String(text||"—"),w)}
  function ensure(y,need=18){if(y+need>H-18){doc.addPage();return 16}return y}
  function section(title,y){
    y=ensure(y,14); doc.setFillColor(...yellow);doc.setDrawColor(229,207,28);doc.roundedRect(M,y,W-2*M,8,1.5,1.5,"FD");
    doc.setTextColor(25,35,50);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text(title,M+4,y+5.3);return y+12;
  }
  function field(x,y,w,label,value,fill=false,h=13){
    doc.setFillColor(fill?255:255,fill?248:255,fill?191:255);doc.setDrawColor(205,213,222);doc.roundedRect(x,y,w,h,1,1,fill?"FD":"S");
    doc.setFont("helvetica","bold");doc.setFontSize(6.8);doc.setTextColor(65,76,90);doc.text(label.toUpperCase(),x+3,y+4);
    doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(25,35,50);doc.text(textLines(value,w-6,8.5).slice(0,2),x+3,y+9);
  }
  function table(headers,rows,widths,y){
    const total=widths.reduce((a,b)=>a+b,0), rowH=7;
    y=ensure(y,20);
    doc.setFillColor(244,247,250);doc.setDrawColor(205,213,222);doc.rect(M,y,total,rowH,"FD");
    let x=M;doc.setFont("helvetica","bold");doc.setFontSize(6.5);doc.setTextColor(45,60,80);
    headers.forEach((h,i)=>{doc.text(String(h),x+2,y+4.6);x+=widths[i]});
    y+=rowH;doc.setFont("helvetica","normal");doc.setFontSize(7.2);doc.setTextColor(30,40,55);
    const safeRows=rows.length?rows:[["—"]];
    safeRows.forEach(row=>{
      const lineCounts=row.map((v,i)=>textLines(v,widths[i]-4,7.2).length);
      const rh=Math.max(7,Math.min(22,Math.max(...lineCounts)*3.8+3));
      if(y+rh>H-18){
        doc.addPage();y=16;doc.setFillColor(244,247,250);doc.rect(M,y,total,rowH,"FD");
        doc.setFont("helvetica","bold");doc.setFontSize(6.5);x=M;
        headers.forEach((h,i)=>{doc.text(String(h),x+2,y+4.6);x+=widths[i]});
        y+=rowH;doc.setFont("helvetica","normal");doc.setFontSize(7.2)
      }
      doc.setDrawColor(205,213,222);doc.rect(M,y,total,rh,"S");x=M;
      row.forEach((v,i)=>{doc.rect(x,y,widths[i],rh,"S");doc.text(textLines(v,widths[i]-4,7.2).slice(0,5),x+2,y+4);x+=widths[i]});
      y+=rh;
    });
    return y;
  }

  if(logo.complete && logo.naturalWidth){
    const ratio=logo.naturalHeight/logo.naturalWidth,lw=48,lh=Math.min(lw*ratio,18);
    doc.addImage(logo,"PNG",M,7,lw,lh)
  }
  doc.setFont("helvetica","bold");doc.setFontSize(19);doc.setTextColor(...navy);doc.text("SERVICE REPORT",W/2,15,{align:"center"});
  doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(80,94,112);doc.text("Field Service Report & Customer Acceptance",W/2,20,{align:"center"});
  doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("CUSTOMER COPY",W/2,24,{align:"center"});
  doc.setFillColor(255,248,191);doc.setDrawColor(229,207,28);doc.roundedRect(W-72,7,58,16,2,2,"FD");
  doc.setTextColor(50,58,68);doc.setFontSize(6.5);doc.text("SERVICE REPORT NO.",W-69,12.5);doc.setFont("courier","bold");doc.setFontSize(8);doc.text(o.reportNo,W-69,19);

  let y=29;
  y=section("1. CUSTOMER INFORMATION",y);
  field(M,y,58,"Company Name",o.company,true);field(M+61,y,58,"Contact Person",o.contact);field(M+122,y,62,"Email",o.email);y+=16;
  field(M,y,58,"Phone",o.phone);field(M+61,y,88,"Service Address",o.address);field(M+152,y,32,"City",o.city);y+=16;
  field(M,y,58,"Province",o.province);field(M+61,y,58,"Postal Code",o.postal);y+=19;

  y=section("2. SERVICE INFORMATION",y);
  field(M,y,43,"Service Date",o.serviceDate,true);field(M+46,y,48,"Technician",o.technician);field(M+97,y,38,"PO Number",o.po);field(M+138,y,46,"Work Order",o.workOrder);y+=16;
  field(M,y,184,"Service Type",o.serviceType);y+=19;

  y=section("3. EQUIPMENT INFORMATION",y);
  const eqRows=(o.equipment||[]).map(e=>[e.equipment||"—",e.manufacturer||"—",e.model||"—",e.serial||"—",e.partNumber||"—",e.location||"—"]);
  y=table(["Equipment / Machine","Manufacturer","Model","Serial Number","Part Number","Location / Tag"],eqRows,[38,29,28,30,30,29],y)+7;

  y=section("4. WORK PERFORMED & MATERIALS",y);
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("WORK PERFORMED",M,y+3);
  const workLines=textLines(o.work||"—",W-2*M-6,8.5),workH=Math.max(20,Math.min(48,workLines.length*4+8));
  doc.setDrawColor(205,213,222);doc.roundedRect(M,y+6,W-2*M,workH,1,1,"S");doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(25,35,50);doc.text(workLines.slice(0,10),M+3,y+11);y+=workH+8;
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("PARTS / MATERIALS USED",M,y+3);
  const partRows=(o.parts||[]).map(p=>[p.partNo||"—",p.partDesc||"—",p.qty||"—"]);y=table(["Part Number","Description","Qty"],partRows,[48,111,25],y+6)+8;

  y=ensure(y,42);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("SERVICE RESULT / STATUS",M,y+3);
  const status=o.result||"Completed";let bg=[233,248,239],edge=[0,166,81],fg=[17,107,58];
  if(status==="Unable to Complete"){bg=[255,240,241];edge=[237,28,36];fg=[163,22,28]}
  else if(status==="Follow-up Required"){bg=[234,244,255];edge=[0,114,206];fg=[7,84,154]}
  else if(status==="Completed – Further Work Required"){bg=[240,249,223];edge=[164,210,51];fg=[79,110,11]}
  doc.setFillColor(...bg);doc.setDrawColor(...edge);doc.roundedRect(M,y+6,W-2*M,13,2,2,"FD");doc.setTextColor(...fg);doc.setFontSize(10);doc.text(status,M+5,y+14);y+=25;
  field(M,y,89,"Technician Notes",o.techNotes);field(M+95,y,89,"Customer Comments",o.customerComments);y+=29;

  y=section("5. CUSTOMER APPROVAL",y);field(M,y,62,"Customer Name",o.customerName,true);field(M+67,y,117,"Approval / Record","Customer acceptance confirmed");y+=18;
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(55,68,84);doc.text("CUSTOMER SIGNATURE",M,y+3);doc.setDrawColor(140,155,170);doc.roundedRect(M,y+6,90,38,1.5,1.5,"S");
  if(o.signature){try{doc.addImage(o.signature,"PNG",M+3,y+9,84,31)}catch(e){}}
  doc.setFillColor(242,246,249);doc.setDrawColor(210,218,226);doc.roundedRect(M+96,y+6,88,38,1.5,1.5,"FD");doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(65,78,95);doc.text(textLines("I acknowledge that the services described above have been performed and that this Service Report accurately records the work completed.",80,7.5),M+100,y+12);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.text("Approval recorded:",M+100,y+38);doc.setFont("helvetica","normal");doc.text(new Date(o.generatedAt||Date.now()).toLocaleString("en-CA"),M+123,y+38);
  doc.setDrawColor(...navy);doc.line(M,H-14,W-M,H-14);doc.setFont("helvetica","bold");doc.setFontSize(7);doc.setTextColor(...navy);doc.text("AUTOMATIONTODAYCA",M,H-9);doc.setFont("helvetica","normal");doc.setTextColor(100,112,128);doc.text("Customer Copy • Field Service Report",W-M,H-9,{align:"right"});

  // Create the PDF as a data URI so the same PDF can be sent to Apps Script.
  const pdfDataUri = doc.output("datauristring");
  const pdfBase64 = pdfDataUri.split(",")[1];
  const filename = `${o.reportNo}.pdf`;

  const payload = {
    token: DELIVERY_CONFIG.token,
    reportNo: o.reportNo,
    company: o.company || "",
    customerEmail: o.email || "",
    filename: filename,
    pdfBase64: pdfBase64
  };

  let deliveryOk = false;

  try {
    const response = await fetch(DELIVERY_CONFIG.url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    // Apps Script can return JSON after the web-app redirect.
    // If readable, verify the backend response.
    if (response.ok) {
      const result = await response.json().catch(()=>null);
      deliveryOk = !!(result && result.ok === true);
    }
  } catch (deliveryError) {
    console.error("Google Drive/Gmail delivery error:", deliveryError);
  }

  // Always keep a local Customer Copy download.
  doc.save(filename);

  if (deliveryOk) {
    alert(
      `Service Report ${o.reportNo} completed successfully.\n\n` +
      `Customer PDF was sent to Google Drive and email.`
    );
  } else {
    alert(
      `Service Report ${o.reportNo} PDF was created and downloaded.\n\n` +
      `Automatic Google Drive/email delivery could not be confirmed. ` +
      `Please check the Apps Script execution log before sending the report again.`
    );
  }

 }catch(err){
  console.error("Customer PDF generation failed:",err);
  alert("Customer PDF could not be generated. Please refresh the page and try again.");
}
}
function downloadData(){generatePDF();}