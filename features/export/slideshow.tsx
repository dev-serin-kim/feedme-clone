import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Slide } from "./slides";

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const markdownToHtml = (markdown: string) =>
  renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>);

function slideHtml(slide: Slide): string {
  switch (slide.kind) {
    case "cover":
      return `<section class="slide cover"><h1 class="wordart">${escapeHtml(slide.title)}</h1><p class="note">★ ${escapeHtml(slide.subtitle || "웹에서 퍼온 글")} ★</p><p class="presenter">발표자: feedme</p></section>`;
    case "content":
      return `<section class="slide content"><h2 class="title">▶ ${escapeHtml(slide.title)}</h2><div class="body">${markdownToHtml(slide.body)}</div></section>`;
    case "end":
      return `<section class="slide end"><h1 class="wordart">감사합니다 ★<br>질문 받습니다</h1></section>`;
  }
}

const STYLE = `
*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden;background:#000}
body{font-family:"굴림",Gulim,"Malgun Gothic","Comic Sans MS",sans-serif}
#viewport{position:fixed;inset:0 0 44px;overflow:hidden}
#stage{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:center}
.slide{position:absolute;inset:0;visibility:hidden;padding:48px 64px;display:flex;flex-direction:column;overflow:hidden;
background:radial-gradient(circle at 12% 18%,#fff 0 3px,transparent 4px) 0 0/90px 90px,linear-gradient(160deg,#ff7eb3 0%,#ffb86b 18%,#fff56b 34%,#7cff8a 52%,#6bd6ff 70%,#8f7bff 86%,#ff7eff 100%);
border:12px ridge #ff00ff}
.slide.active{visibility:visible}
.wordart{font-family:"궁서",Gungsuh,GungSeo,Batang,serif;font-weight:900;margin:0;line-height:1.25;text-align:center;
background:linear-gradient(180deg,#f00,#f90 25%,#ff0 45%,#0c0 62%,#06f 80%,#90f);-webkit-background-clip:text;background-clip:text;color:transparent;
-webkit-text-stroke:2.5px #000;filter:drop-shadow(5px 5px 0 rgba(0,0,0,.45));transform:skewX(-6deg)}
.cover,.end{justify-content:center;align-items:center;gap:36px}
.cover .wordart{font-size:84px}.end .wordart{font-size:96px}
.note{margin:0;padding:6px 16px;background:#ff9;border:3px dashed #f00;font-size:30px;font-weight:700;color:#000}
.presenter{margin:0;font-size:26px;font-weight:700;color:#00c;background:#fff;border:3px outset #fff;padding:4px 14px}
.title{margin:0 0 18px;font-family:"궁서",Gungsuh,Batang,serif;font-size:46px;color:#03f;background:#ff0;border:4px solid #000;padding:4px 16px;align-self:flex-start;max-width:100%}
.body{flex:1;min-height:0;overflow:hidden;background:rgba(255,255,230,.92);border:4px double #000;box-shadow:8px 8px 0 rgba(0,0,0,.35);padding:18px 24px;color:#000;font-size:28px;line-height:1.45;overflow-wrap:anywhere}
.body p,.body ul,.body ol,.body pre,.body blockquote{margin:0 0 .5em}.body ul{list-style:none;padding-left:0}.body ul>li::before{content:"▶ ";color:#f00}
.body ol{padding-left:1.4em}.body strong{color:#f00;background:#ff0}.body a{color:#00e}.body code{background:#000;color:#0f0;padding:0 .2em;font-size:.9em}
.body pre{background:#000;color:#0f0;padding:.4em .6em;white-space:pre-wrap}.body pre code{padding:0}.body h1,.body h2,.body h3,.body h4{font-size:1.05em;color:#c00;margin:.3em 0}
.body blockquote{border-left:6px solid #03f;padding-left:.5em;color:#03f}.body img{max-height:200px}.body table{border-collapse:collapse}.body td,.body th{border:1px solid #000;padding:0 .3em}
#bar{position:fixed;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;justify-content:center;gap:10px;background:#00c;color:#ff0;font:700 15px "굴림",Gulim,sans-serif}
#bar button{font:inherit;color:#000;background:linear-gradient(#fff,#d4d0c8);border:2px outset #fff;padding:3px 12px;cursor:pointer}
#bar button:active{border-style:inset}#count{min-width:80px;text-align:center}
:fullscreen #bar{display:none}:fullscreen #viewport{inset:0}
`;

const SCRIPT = `
(function(){
var slides=[].slice.call(document.querySelectorAll('.slide')),i=0,stage=document.getElementById('stage'),count=document.getElementById('count');
function fit(){var vp=document.getElementById('viewport');var s=Math.min(vp.clientWidth/1280,vp.clientHeight/720);stage.style.transform='translate(-50%,-50%) scale('+s+')'}
function shrink(){slides.forEach(function(sl){var b=sl.querySelector('.body');if(!b)return;var size=28;b.style.fontSize=size+'px';while(b.scrollHeight>b.clientHeight&&size>11){size--;b.style.fontSize=size+'px'}})}
function show(n){i=Math.max(0,Math.min(slides.length-1,n));slides.forEach(function(s,k){s.classList.toggle('active',k===i)});count.textContent=(i+1)+' / '+slides.length}
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();show(i+1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){show(i-1)}else if(e.key==='f'||e.key==='F'){full()}else if(e.key==='Escape'&&!document.fullscreenElement&&window.parent!==window){window.parent.postMessage('feedme:close-slides','*')}});
document.getElementById('viewport').addEventListener('click',function(){show(i+1)});
function full(){if(document.fullscreenElement){document.exitFullscreen()}else{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}}
document.getElementById('prev').onclick=function(){show(i-1)};document.getElementById('next').onclick=function(){show(i+1)};document.getElementById('full').onclick=full;
document.getElementById('save').onclick=function(){var html='<!doctype html>\\n'+document.documentElement.outerHTML;var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));a.download=document.body.getAttribute('data-filename');a.click()};
window.addEventListener('resize',fit);fit();shrink();show(0);
})();
`;

/** A self-contained "first PPT" style slideshow page: works offline after `.html 저장`. */
export function renderSlideshowHtml(slides: Slide[], title: string, filename: string): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} - 발표 자료</title><style>${STYLE}</style></head>
<body data-filename="${escapeHtml(filename)}">
<div id="viewport"><div id="stage">${slides.map(slideHtml).join("")}</div></div>
<div id="bar"><button id="prev" aria-label="이전 슬라이드">◀</button><span id="count"></span><button id="next" aria-label="다음 슬라이드">▶</button><button id="full">전체 화면 (F)</button><button id="save">.html 저장</button></div>
<script>${SCRIPT}</script>
</body></html>`;
}
