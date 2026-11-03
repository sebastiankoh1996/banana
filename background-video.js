'use strict';
(()=>{const video=document.getElementById('ambient-video');
video.muted=true;
video.addEventListener('error',()=>{video.hidden=true;});
video.play().catch(()=>{ /* Keep the gradient if autoplay is unavailable. */ });
})();
