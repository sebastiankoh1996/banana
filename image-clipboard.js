'use strict';
function chineseImageText(value){return value.replace(/\r\n?/g,'\n').split('\n').map(line=>{if(!line.trim())return '';if(!/\p{Script=Han}/u.test(line))return null;return line.replace(/[^\p{Script=Han}\p{N}\p{P}\s]/gu,'').replace(/[ \t\u3000]+/g,' ').replace(/(?<=\p{Script=Han}) +(?=\p{Script=Han})/gu,'').replace(/ *([，。！？；：、）】》]) */g,'$1').replace(/([（【《]) */g,'$1').trim();}).filter(line=>line!==null).join('\n').replace(/\n{3,}/g,'\n\n').trim();}
function flowingImageText(value){return value.split(/\n\s*\n/).map(paragraph=>paragraph.split('\n').reduce((result,line)=>{if(!result)return line;return result+(/^(?:[•·\-]|[0-9一二三四五六七八九十]+[、.．）)]|[（(][0-9一二三四五六七八九十]+[）)])/u.test(line)?'\n':'')+line;},'')).join('\n\n');}
if(typeof module!=='undefined')module.exports={chineseImageText,flowingImageText};
if(typeof document!=='undefined'){
const dialog=document.getElementById('image-dialog'),status=document.getElementById('image-status'),input=document.getElementById('image-file');
let worker=null,busy=false,generation=0,library,drafts={},mode='flowing';
const review=document.getElementById('image-review'),preview=document.getElementById('image-preview'),format=document.getElementById('image-format');
function loadOCR(){if(window.Tesseract)return Promise.resolve();if(!library)library=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>{script.remove();library=null;reject(Error('Could not load image reading. Check your connection and try again.'));};document.head.append(script);});return library;}
async function readImage(file){
 if(busy)return;
 if(!file||!/^image\/(png|jpeg|webp|gif|bmp)$/i.test(file.type)){status.textContent='Choose a PNG, JPG, WebP, GIF or BMP image.';return;}
 if(file.size>20*1024*1024){status.textContent='This image is too large. Use an image smaller than 20 MB.';return;}
 review.hidden=true;busy=true;const job=++generation;dialog.setAttribute('aria-busy','true');status.textContent='Loading Chinese image reader… The first image can take a little longer.';input.disabled=true;
 const timeout=setTimeout(()=>{if(job===generation){cancel();status.textContent='Image reading took too long. Check your connection or try a smaller image.';}},120000);
 try{
  await loadOCR();if(job!==generation)return;
  const created=await Tesseract.createWorker(['chi_sim','chi_tra'],1,{logger:event=>{if(job===generation&&event.status==='recognizing text')status.textContent=`Reading Chinese text… ${Math.round(event.progress*100)}%`;}});
  if(job!==generation){await created.terminate();return;}worker=created;
  const result=await worker.recognize(file);if(job!==generation)return;
  const extracted=chineseImageText(result.data.text);
  if(!extracted){status.textContent='No Chinese text found. Try a clearer image with larger text.';return;}
  drafts={flowing:flowingImageText(extracted),lines:extracted};mode='flowing';format.value=mode;preview.value=drafts[mode];review.hidden=false;status.textContent='Review the extracted text. You can edit it before adding it.';preview.focus();
 }catch(error){if(job===generation)status.textContent=error.message?.startsWith('Could not load')?error.message:'Could not read this image. Try a clear PNG or JPG image.';}
 finally{clearTimeout(timeout);if(job===generation){const active=worker;worker=null;busy=false;input.disabled=false;dialog.removeAttribute('aria-busy');if(active)await active.terminate();}}
}
function cancel(){generation++;busy=false;input.disabled=false;dialog.removeAttribute('aria-busy');if(worker){worker.terminate().catch(()=>{});worker=null;}}
document.getElementById('image').onclick=()=>{review.hidden=true;drafts={};status.textContent='Paste an image with Ctrl+V (⌘V on Mac), or drag it into this window.';input.value='';dialog.showModal();};
document.getElementById('image-close').onclick=()=>dialog.close();dialog.addEventListener('close',cancel);
format.addEventListener('change',()=>{drafts[mode]=preview.value;mode=format.value;preview.value=drafts[mode];});
document.getElementById('image-insert').onclick=()=>{const value=preview.value.trim();if(!value){status.textContent='Add some text to the preview first.';preview.focus();return;}flush();changed(text.trim()?text.replace(/\s+$/,'')+'\n\n'+value:value);dialog.close();editor.focus();notify('Reviewed text added from image.');};
input.addEventListener('change',()=>readImage(input.files[0]));
dialog.addEventListener('paste',event=>{if(event.target===preview)return;event.preventDefault();const file=Array.from(event.clipboardData.items).find(item=>item.type.startsWith('image/'))?.getAsFile();if(file)readImage(file);else status.textContent='No image found on the clipboard. Copy an image, then paste here.';});
dialog.addEventListener('dragover',event=>{event.preventDefault();dialog.classList.add('drag-over');});dialog.addEventListener('dragleave',()=>dialog.classList.remove('drag-over'));dialog.addEventListener('drop',event=>{event.preventDefault();dialog.classList.remove('drag-over');readImage(event.dataTransfer.files[0]);});
}
