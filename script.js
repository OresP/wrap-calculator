const fields=[document.getElementById("crew"),document.getElementById("lunchIn"),document.getElementById("lunchOut"),document.getElementById("wrap")];
const totalValue=document.getElementById("totalValue"),lunchValue=document.getElementById("lunchValue"),workedValue=document.getElementById("workedValue"),result=document.getElementById("result"),errorDialog=document.getElementById("errorDialog"),errorMessage=document.getElementById("errorMessage"),errorOk=document.getElementById("errorOk");
function parseFilmTime(value){value=value.trim().replace(":","");if(!/^\d{4}$/.test(value))throw new Error("Enter time as 4 digits.");const hours=Number(value.slice(0,2)),minutes=Number(value.slice(2));if(minutes>59)throw new Error("Minutes must be between 00 and 59.");return hours*60+minutes}
function formatDuration(totalMinutes){
  const hours=Math.floor(totalMinutes/60),minutes=totalMinutes%60;
  const hourText=hours===1?"1 hour":`${hours} hours`;
  const minuteText=minutes===1?"1 minute":`${minutes} minutes`;
  if(hours===0)return minuteText;
  if(minutes===0)return hourText;
  return `${hourText} ${minuteText}`;
}
async function copyResult(element){
  const text=element.textContent;
  try{
    await navigator.clipboard.writeText(text);
  }catch{
    const area=document.createElement("textarea");
    area.value=text; area.style.position="fixed"; area.style.opacity="0";
    document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
  }
  const original=element.dataset.original||text;
  element.textContent="Copied!";
  setTimeout(()=>element.textContent=original,1000);
}
function showError(message){errorMessage.textContent=message;errorDialog.hidden=false;errorOk.focus()}
function calculate(){try{let crew=parseFilmTime(fields[0].value),lunchIn=parseFilmTime(fields[1].value),lunchOut=parseFilmTime(fields[2].value),wrap=parseFilmTime(fields[3].value);const times=[crew,lunchIn,lunchOut,wrap],adjusted=[times[0]];for(let i=1;i<times.length;i++){let t=times[i];while(t<adjusted[i-1])t+=1440;adjusted.push(t)}[crew,lunchIn,lunchOut,wrap]=adjusted;const totalDay=wrap-crew,lunch=lunchOut-lunchIn,worked=totalDay-lunch;if(lunch<=0)throw new Error("Lunch Out must be after Lunch In.");if(totalDay<=0)throw new Error("Wrap must be after Crew Call.");if(worked<0)throw new Error("The calculated worked time cannot be negative.");totalValue.textContent=formatDuration(totalDay);lunchValue.textContent=formatDuration(lunch);workedValue.textContent=formatDuration(worked);[totalValue,lunchValue,workedValue].forEach(el=>el.dataset.original=el.textContent);result.classList.add("success")}catch(error){showError(error.message)}}
function clearFields(){fields.forEach(f=>f.value="");totalValue.textContent="—";lunchValue.textContent="—";workedValue.textContent="—";result.classList.remove("success");fields[0].focus()}
fields.forEach((field,index)=>{field.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();index<fields.length-1?fields[index+1].focus():calculate()}});field.addEventListener("input",()=>field.value=field.value.replace(/[^0-9:]/g,"").slice(0,5))});
document.getElementById("calculate").addEventListener("click",calculate);document.getElementById("clear").addEventListener("click",clearFields);[totalValue,lunchValue,workedValue].forEach(el=>el.addEventListener("click",()=>{if(el.textContent!=="—")copyResult(el)}));errorOk.addEventListener("click",()=>errorDialog.hidden=true);document.addEventListener("keydown",e=>{if(e.ctrlKey&&e.key==="Enter"){e.preventDefault();calculate()}if(e.key==="Escape")errorDialog.hidden=true});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));fields[0].focus();
