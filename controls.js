'use strict';
window.taikoControls=(()=>{
  const $=id=>document.getElementById(id);
  let saved={};
  try{saved=JSON.parse(localStorage.getItem('tg.322.taiko.settings')||'{}')}catch(_){}
  const state={paused:false,menuOpen:false,muted:!!saved.muted,volume:saved.volume??70,quality:saved.quality||'high',speed:1,debug:false,camera:'stage',stroke:'head',instrument:'odaiko',performer:saved.performer||'auto',venue:saved.venue||'auto'};
  const listeners=[];
  let menuReturnFocus=null;
  const panel=$('settings').querySelector('.settings-panel');
  function update(){
    const soundLabel=state.muted?'音を出す':'音を消す',pauseLabel=state.paused?'再開':'一時停止';
    $('sound').classList.toggle('is-muted',state.muted);
    $('sound').setAttribute('aria-label',soundLabel);
    $('sound').setAttribute('aria-pressed',String(state.muted));
    $('sound').title=soundLabel;
    $('pause').classList.toggle('is-paused',state.paused);
    $('pause').setAttribute('aria-label',pauseLabel);
    $('pause').title=pauseLabel;
    $('paused').hidden=!state.paused||state.menuOpen;
    document.body.classList.toggle('menu-open',state.menuOpen);
    document.body.classList.toggle('debug-view',state.debug);
    try{localStorage.setItem('tg.322.taiko.settings',JSON.stringify({muted:state.muted,volume:state.volume,quality:state.quality,performer:state.performer,venue:state.venue}))}catch(_){}
    listeners.forEach(fn=>fn(state));
  }
  function togglePause(){state.paused=!state.paused;update()}
  function setMenu(open){
    if(state.menuOpen===open)return;
    if(open)menuReturnFocus=$('settingsToggle');
    state.menuOpen=open;
    $('settings').hidden=!open;
    $('settingsToggle').setAttribute('aria-expanded',String(open));
    update();
    if(open)$('settingsClose').focus({preventScroll:true});
    else (menuReturnFocus?.isConnected?menuReturnFocus:$('settingsToggle')).focus({preventScroll:true});
  }
  function toggleMute(){state.muted=!state.muted;update()}
  $('sound').onclick=toggleMute;
  $('pause').onclick=togglePause;
  $('resume').onclick=togglePause;
  $('settingsToggle').onclick=()=>setMenu(!state.menuOpen);
  $('settingsClose').onclick=()=>setMenu(false);
  $('settings').addEventListener('click',e=>{if(e.target===$('settings'))setMenu(false)});
  for(const key of ['volume','quality','speed','debug','performer','venue']){
    $(key)[key==='debug'?'checked':'value']=state[key];
    $(key).addEventListener('input',()=>{
      state[key]=key==='debug'?$(key).checked:['quality','performer','venue'].includes(key)?$(key).value:Number($(key).value);
      update();
    });
  }
  document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{
    state.camera=b.dataset.camera;
    document.querySelectorAll('[data-camera]').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b))});
    update();
  });
  document.querySelectorAll('[data-stroke]').forEach(b=>b.onclick=()=>{
    state.stroke=b.dataset.stroke;
    document.querySelectorAll('[data-stroke]').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b))});
    update();
  });
  function chooseInstrument(id){
    state.instrument=id;
    $('instrument').value=id;
    document.querySelectorAll('[data-instrument]').forEach(b=>{const chosen=b.dataset.instrument===id;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen))});
    update();
  }
  $('instrument').onchange=()=>chooseInstrument($('instrument').value);
  document.querySelectorAll('[data-instrument]').forEach(b=>b.onclick=()=>chooseInstrument(b.dataset.instrument));
  document.addEventListener('keydown',e=>{
    if(state.menuOpen){
      if(e.code==='Escape'){e.preventDefault();setMenu(false);return}
      if(e.code==='Tab'){
        const items=[...panel.querySelectorAll('button:not([hidden]),input,select,summary,[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.disabled);
        const first=items[0],last=items.at(-1);
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last?.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
      }
      return;
    }
    if(e.target.closest?.('button,input,select,textarea,summary')||e.target.isContentEditable)return;
    if(e.code==='Escape'||e.code==='Space'){e.preventDefault();if(!e.repeat)togglePause()}
  });
  document.addEventListener('focusin',e=>{if(state.menuOpen&&!$('settings').contains(e.target))$('settingsClose').focus({preventScroll:true})});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){state.paused=true;update()}});
  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('dblclick',e=>e.preventDefault());
  let lastTouchEnd=0;
  document.addEventListener('touchend',e=>{
    const now=Date.now();
    if(now-lastTouchEnd<=300)e.preventDefault();
    lastTouchEnd=now;
  },{passive:false});
  for(const g of ['gesturestart','gesturechange','gestureend'])document.addEventListener(g,e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
  document.addEventListener('touchmove',e=>{
    if(e.target.closest&&e.target.closest('.settings-body'))return;
    if(e.touches.length>1||(e.scale&&e.scale!==1))e.preventDefault();
  },{passive:false});
  update();
  return{state,onChange(fn){listeners.push(fn)},update,setMenu,togglePause,toggleMute};
})();
