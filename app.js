const $=s=>document.querySelector(s);
let counter=Number(localStorage.getItem("atd_service_counter")||"1");
function reportNumber(n){return "SR_ATD_22AD0005"+String(n).padStart(3,"0")}
$("#reportNo").textContent=reportNumber(counter);
const d=new Date(); const local=new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
document.querySelector('[name="serviceDate"]').value=local;

function addEquipment(){
 const wrap=document.createElement("div"); wrap.className="repeat equipment";
 wrap.innerHTML=`<div class="grid">
<label>Equipment / Machine<input name="equipment"></label><label>Manufacturer<input name="manufacturer"></label>
<label>Model<input name="model"></label><label>Serial Number<input name="serial"></label>
<label>Part Number<input name="partNumber"></label><label>Equipment Tag / Location<input name="location"></label>
</div><button type="button" class="remove" onclick="removeRow(this)">Remove</button>`;
$("#equipmentList").appendChild(wrap)
}
function addPart(){
 const r=document.createElement("div"); r.className="part-row";
 r.innerHTML=`<input placeholder="Part No." name="partNo"><input placeholder="Description" name="partDesc"><input placeholder="Qty" name="qty" type="number" min="0" step="1"><button type="button" class="icon" onclick="removeRow(this)">×</button>`;
$("#partsList").appendChild(r)
}
function removeRow(btn){const row=btn.closest(".repeat,.part-row"); if(row && row.parentElement.children.length>1) row.remove()}

const canvas=$("#signature"),ctx=canvas.getContext("2d"); let drawing=false,hasSig=false;
function pos(e){const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return[(p.clientX-r.left)*canvas.width/r.width,(p.clientY-r.top)*canvas.height/r.height]}
function start(e){e.preventDefault();drawing=true;hasSig=true;const [x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y)}
function move(e){if(!drawing)return;e.preventDefault();const[x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke()}
function end(){drawing=false}
ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";
canvas.addEventListener("mousedown",start);canvas.addEventListener("mousemove",move);canvas.addEventListener("mouseup",end);canvas.addEventListener("mouseleave",end);
canvas.addEventListener("touchstart",start,{passive:false});canvas.addEventListener("touchmove",move,{passive:false});canvas.addEventListener("touchend",end);
function clearSignature(){ctx.clearRect(0,0,canvas.width,canvas.height);hasSig=false}

function collect(){
 const fd=new FormData($("#serviceForm")); const o=Object.fromEntries(fd.entries());
 o.reportNo=$("#reportNo").textContent;
 o.equipment=[...document.querySelectorAll(".equipment")].map(x=>Object.fromEntries(new FormData(x).entries()));
 o.parts=[...document.querySelectorAll(".part-row")].map(x=>Object.fromEntries(new FormData(x).entries())).filter(x=>x.partNo||x.partDesc||x.qty);
 o.signature=hasSig?canvas.toDataURL("image/png"):"";
 o.generatedAt=new Date().toISOString();
 return o
}
$("#serviceForm").addEventListener("submit",e=>{
 e.preventDefault(); if(!hasSig){alert("Customer signature is required.");return}
 const o=collect(); localStorage.setItem("atd_last_report",JSON.stringify(o));
 counter++; localStorage.setItem("atd_service_counter",String(counter));
 $("#serviceForm").classList.add("hidden");$("#review").classList.remove("hidden");
 $("#reviewContent").innerHTML=`<pre>${escapeHtml(JSON.stringify(o,null,2))}</pre><p><strong>Next Service Report:</strong> ${reportNumber(counter)}</p>`;
 window.scrollTo({top:0,behavior:"smooth"});
});
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function downloadData(){
 const o=localStorage.getItem("atd_last_report"); const blob=new Blob([o],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=$("#reportNo").textContent+".json";a.click();
}