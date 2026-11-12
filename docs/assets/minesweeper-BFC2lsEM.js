var e={small:{rows:9,cols:9,mines:10},medium:{rows:16,cols:16,mines:40},large:{rows:16,cols:30,mines:99},pro:{rows:20,cols:30,mines:145}};function t(t,n){document.body.classList.add(`minesweeper-retro`);let r=`small`,i=[],a=[],o=[],s=0,c=0,l=0,u=!1,d=!1,f=!1,p=0,m=null;t.innerHTML=`
    <header class="game-header ms-top-nav">
      <button class="back-btn" title="Назад">←</button>
      <h2>Сапёр</h2>
      <div class="ms-difficulty">
        <button class="ms-diff-btn active" data-diff="small">Мал</button>
        <button class="ms-diff-btn" data-diff="medium">Срд</button>
        <button class="ms-diff-btn" data-diff="large">Бол</button>
        <button class="ms-diff-btn" data-diff="pro">Про</button>
      </div>
      <button class="icon-btn" id="ms-restart" title="Заново">↻</button>
    </header>
    <div class="ms-game-container">
      <div class="ms-board-wrapper">
        <div class="ms-header">
          <div class="ms-counter" id="ms-mines">010</div>
          <button class="ms-face" id="ms-face">🙂</button>
          <div class="ms-counter" id="ms-time">000</div>
        </div>
        <div class="ms-grid" id="ms-grid"></div>
      </div>
    </div>
  `;let h=t.querySelector(`#ms-grid`),g=t.querySelector(`#ms-mines`),_=t.querySelector(`#ms-time`),v=t.querySelector(`#ms-face`);function y(e,t=3){let n=Math.abs(e).toString().padStart(t,`0`);return e<0?`-`+n.slice(1):n}function b(){let t=e[r];s=t.rows,c=t.cols,l=t.mines,i=Array.from({length:s},()=>Array(c).fill(0)),a=Array.from({length:s},()=>Array(c).fill(!1)),o=Array.from({length:s},()=>Array(c).fill(!1)),u=!1,d=!1,f=!1,p=0,_.textContent=y(p),g.textContent=y(l),v.textContent=`🙂`,clearInterval(m),m=null,C()}function x(e,t){let n=0;for(;n<l;){let r=Math.floor(Math.random()*s),a=Math.floor(Math.random()*c),o=Math.abs(r-e)<=1&&Math.abs(a-t)<=1;i[r][a]!==-1&&!o&&(i[r][a]=-1,n++)}for(let e=0;e<s;e++)for(let t=0;t<c;t++){if(i[e][t]===-1)continue;let n=0;for(let r=-1;r<=1;r++)for(let a=-1;a<=1;a++){let o=e+r,l=t+a;o>=0&&o<s&&l>=0&&l<c&&i[o][l]===-1&&n++}i[e][t]=n}}function S(){m||=setInterval(()=>{p++,p>999&&(p=999),_.textContent=y(p)},1e3)}function C(){h.style.gridTemplateColumns=`repeat(${c}, 22px)`,h.innerHTML=``;for(let e=0;e<s;e++)for(let t=0;t<c;t++){let n=document.createElement(`button`);n.className=`ms-cell`,a[e][t]?(n.classList.add(`revealed`),i[e][t]===-1?(n.classList.add(`mine`),n.textContent=`💣`):i[e][t]>0&&(n.textContent=i[e][t],n.dataset.num=i[e][t])):o[e][t]&&(n.textContent=`🚩`),w(n,e,t),h.appendChild(n)}}function w(e,t,n){let r,i=!1;e.addEventListener(`mousedown`,e=>{e.button===0&&(u||d||(v.textContent=`😮`))}),e.addEventListener(`mouseup`,e=>{e.button===0&&(u||d||(v.textContent=`🙂`))}),e.addEventListener(`mouseleave`,()=>{u||d||(v.textContent=`🙂`)}),e.addEventListener(`click`,e=>{i?i=!1:T(t,n)}),e.addEventListener(`contextmenu`,e=>{e.preventDefault(),E(t,n)}),e.addEventListener(`touchstart`,e=>{i=!1,r=setTimeout(()=>{i=!0,E(t,n),navigator.vibrate&&navigator.vibrate(50)},400)},{passive:!0}),e.addEventListener(`touchend`,()=>clearTimeout(r)),e.addEventListener(`touchmove`,()=>clearTimeout(r))}function T(e,t){if(!(u||d||o[e][t])&&(f||(f=!0,x(e,t),S()),!a[e][t])){if(i[e][t]===-1){u=!0,clearInterval(m),v.textContent=`😵`;for(let e=0;e<s;e++)for(let t=0;t<c;t++)i[e][t]===-1&&(a[e][t]=!0);a[e][t]=!0,C()}else D(e,t),C(),O()}}function E(e,t){if(u||d||a[e][t])return;o[e][t]=!o[e][t];let n=o.flat().filter(Boolean).length;g.textContent=y(l-n);let r=e*c+t,i=h.children[r];i.textContent=o[e][t]?`🚩`:``}function D(e,t){if(!(a[e][t]||o[e][t])&&(a[e][t]=!0,i[e][t]===0))for(let n=-1;n<=1;n++)for(let r=-1;r<=1;r++){let i=e+n,a=t+r;i>=0&&i<s&&a>=0&&a<c&&D(i,a)}}function O(){for(let e=0;e<s;e++)for(let t=0;t<c;t++)if(!a[e][t]&&i[e][t]!==-1)return;d=!0,clearInterval(m),v.textContent=`😎`;for(let e=0;e<s;e++)for(let t=0;t<c;t++)i[e][t]===-1&&(o[e][t]=!0);g.textContent=`000`,C()}return v.addEventListener(`click`,b),t.querySelector(`#ms-restart`).addEventListener(`click`,b),t.querySelector(`.back-btn`).addEventListener(`click`,n),t.querySelectorAll(`.ms-diff-btn`).forEach(e=>{e.addEventListener(`click`,()=>{t.querySelectorAll(`.ms-diff-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),r=e.dataset.diff,b()})}),b(),()=>{clearInterval(m),document.body.classList.remove(`minesweeper-retro`)}}export{t as mount};