(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();const n={app:{name:"Yom-easy",intro:"文字を、あなたに合う見え方に変えてみませんか。",placeholder:"これから、フォントや色、ふりがな、読み上げなど、自分にぴったり合う読み方を一緒に見つけていきます。"}};function c(){const t=document.getElementById("app");t&&(t.innerHTML=`
    <main class="reading-area" aria-labelledby="app-title">
      <h1 id="app-title" class="reading-area__title">${n.app.name}</h1>
      <p class="reading-area__intro">${n.app.intro}</p>
      <p class="reading-area__placeholder">${n.app.placeholder}</p>
    </main>
  `)}c();
//# sourceMappingURL=index-5TxMXkZ-.js.map
