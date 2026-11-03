'use strict';
for(const id of ['ambient-video','timer-video']){
 const video=document.getElementById(id);if(!video)continue;
 video.muted=true;video.addEventListener('error',()=>{video.hidden=true;});
 video.play().catch(()=>{ /* Keep the underlying background if autoplay is unavailable. */ });
}
