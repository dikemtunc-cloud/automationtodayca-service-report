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
 o.equipment=[...document.querySelectorAll(".equipment")].map(x=>Object.fromEntries(new FormData(x).entries()));
 o.parts=[...document.querySelectorAll(".part-row")].map(x=>Object.fromEntries(new FormData(x).entries())).filter(x=>x.partNo||x.partDesc||x.qty);
 o.signature=hasSig?canvas.toDataURL("image/png"):"";o.generatedAt=new Date().toISOString();return o;
}
$("#serviceForm").addEventListener("submit",e=>{
 e.preventDefault();if(!hasSig){alert("Customer signature is required.");return}
 const o=collect();localStorage.setItem("atd_last_report",JSON.stringify(o));
 counter=Math.min(counter+1,999);localStorage.setItem("atd_service_counter",String(counter));
 $("#serviceForm").classList.add("hidden");$("#review").classList.remove("hidden");
 $("#reviewContent").innerHTML=`<pre>${escapeHtml(JSON.stringify(o,null,2))}</pre><p><strong>Next Service Report:</strong> ${reportNo()}</p>`;
 window.scrollTo({top:0,behavior:"smooth"});
});
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function downloadData(){const o=localStorage.getItem("atd_last_report"),b=new Blob([o],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=$("#reportNo").textContent+".json";a.click();}
