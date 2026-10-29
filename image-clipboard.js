'use strict';
function chineseImageText(value){return value.split(/\r?\n/).filter(line=>/\p{Script=Han}/u.test(line)).map(line=>line.replace(/[^\p{Script=Han}\p{N}\p{P}\s]/gu,'').replace(/(?<=\p{Script=Han})[ \t]+(?=\p{Script=Han})/gu,'').trim()).filter(Boolean).join('\n');}
if(typeof module!=='undefined')module.exports={chineseImageText};
if(typeof document!=='undefined'){
const dialog=document.getElementById('image-dialog'),status=document.getElementById('image-status'),input=document.getElementById('image-file');
let worker=null,busy=false,generation=0,library;
function loadOCR(){if(window.Tesseract)return Promise.resolve();if(!library)library=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>{script.remove();library=null;reject(Error('Could not load image reading. Check your connection and try again.'));};document.head.append(script);});return library;}
async function readImage(file){
 if(busy)return;
 if(!file||!/^image\/(png|jpeg|webp|gif|bmp)$/i.test(file.type)){status.textContent='Choose a PNG, JPG, WebP, GIF or BMP image.';return;}
 if(file.size>20*1024*1024){status.textContent='This image is too large. Use an image smaller than 20 MB.';return;}
 busy=true;const job=++generation;dialog.setAttribute('aria-busy','true');status.textContent='Loading Chinese image reader… The first image can take a little longer.';input.disabled=true;
 const timeout=setTimeout(()=>{if(job===generation){cancel();status.textContent='Image reading took too long. Check your connection or try a smaller image.';}},120000);
 try{
  await loadOCR();if(job!==generation)return;
  const created=await Tesseract.createWorker(['chi_sim','chi_tra'],1,{logger:event=>{if(job===generation&&event.status==='recognizing text')status.textContent=`Reading Chinese text… ${Math.round(event.progress*100)}%`;}});
  if(job!==generation){await created.terminate();return;}worker=created;
  const result=await worker.recognize(file);if(job!==generation)return;
  const extracted=chineseImageText(result.data.text);
  if(!extracted){status.textContent='No Chinese text found. Try a clearer image with larger text.';return;}
  flush();changed(text.trim()?text.replace(/\s+$/,'')+'\n'+extracted:extracted);dialog.close();editor.focus();notify('Chinese text added from image. Check the result for recognition mistakes.');
 }catch(error){if(job===generation)status.textContent=error.message?.startsWith('Could not load')?error.message:'Could not read this image. Try a clear PNG or JPG image.';}
 finally{clearTimeout(timeout);if(job===generation){const active=worker;worker=null;busy=false;input.disabled=false;dialog.removeAttribute('aria-busy');if(active)await active.terminate();}}
}
function cancel(){generation++;busy=false;input.disabled=false;dialog.removeAttribute('aria-busy');if(worker){worker.terminate().catch(()=>{});worker=null;}}
document.getElementById('image').onclick=()=>{status.textContent='Paste an image with Ctrl+V (⌘V on Mac), or drag it into this window.';input.value='';dialog.showModal();};
document.getElementById('image-close').onclick=()=>dialog.close();dialog.addEventListener('close',cancel);
input.addEventListener('change',()=>readImage(input.files[0]));
dialog.addEventListener('paste',event=>{event.preventDefault();const file=Array.from(event.clipboardData.items).find(item=>item.type.startsWith('image/'))?.getAsFile();if(file)readImage(file);else status.textContent='No image found on the clipboard. Copy an image, then paste here.';});
dialog.addEventListener('dragover',event=>{event.preventDefault();dialog.classList.add('drag-over');});dialog.addEventListener('dragleave',()=>dialog.classList.remove('drag-over'));dialog.addEventListener('drop',event=>{event.preventDefault();dialog.classList.remove('drag-over');readImage(event.dataTransfer.files[0]);});
}
