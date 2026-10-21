'use strict';
window.taikoGamepad=(()=>{
  const PRESS=0.45,RELEASE=0.25,TRIGGER=0.55;
  const BUTTONS={
    0:['right','head'],1:['right','rim'],2:['left','head'],3:['left','rim'],
    4:['left','rim'],5:['right','rim'],6:['left','head'],7:['right','head'],
    12:['left','rim'],13:['right','rim'],14:['left','head'],15:['right','head']
  };
  const NAMES={0:'A',1:'B',2:'X',3:'Y',4:'L1',5:'R1',6:'L2',7:'R2',8:'Select',9:'Start',10:'L3',11:'R3',12:'上',13:'下',14:'左',15:'右'};
  const prev=new Map();
  const latched=new Set();
  const sticks={left:null,right:null};
  let snapshot={connected:false,id:'',mapping:'',buttons:[],axes:[0,0,0,0]};
  const status=()=>document.getElementById('padStatus');
  function show(text){const el=status();if(el&&el.textContent!==text)el.textContent=text}
  function shortName(id){const name=String(id||'ゲームパッド').split('(')[0].trim();return name||'ゲームパッド'}
  function pressedButton(button,index){
    if(!button)return false;
    const value=Number(button.value)||0;
    if(index===6||index===7)return !!button.pressed||value>TRIGGER;
    return !!button.pressed||value>0.5;
  }
  function drop(token,hooks){if(!latched.has(token))return;latched.delete(token);hooks.releaseHold(token,true)}
  function sync(token,down,hooks,side,kind){
    const before=prev.get(token)||false;
    prev.set(token,down);
    if(hooks.blocked){drop(token,hooks);return}
    if(down&&!before){latched.add(token);hooks.beginHold(side,token,kind)}
    else if(!down&&before&&latched.has(token)){latched.delete(token);hooks.releaseHold(token)}
  }
  function syncStick(hand,x,y,hooks){
    const token=`pad:stick:${hand}`;
    const mag=Math.hypot(x,y);
    if(hooks.blocked){sticks[hand]=null;drop(token,hooks);prev.set(token,mag>=RELEASE);return}
    if(sticks[hand]){
      if(mag<RELEASE){sticks[hand]=null;sync(token,false,hooks)}
      return;
    }
    if(mag<PRESS){sync(token,false,hooks);return}
    if(prev.get(token))return;
    const kind=Math.abs(y)>Math.abs(x)?'rim':'head';
    sticks[hand]=kind;
    sync(token,true,hooks,hand,kind);
  }
  function disconnect(hooks){
    for(const token of [...latched])drop(token,hooks);
    sticks.left=sticks.right=null;
    prev.clear();
    snapshot={connected:false,id:'',mapping:'',buttons:[],axes:[0,0,0,0]};
    show('USBコントローラーは、ボタンを一度押すと認識します。');
  }
  function poll(hooks,pads){
    const list=pads||(navigator.getGamepads?navigator.getGamepads():[]);
    let gp=null;
    for(const item of list)if(item){gp=item;break}
    if(!gp){disconnect(hooks);return snapshot}
    const buttons=[];
    for(let i=0;i<gp.buttons.length;i++){
      const down=pressedButton(gp.buttons[i],i);
      if(down)buttons.push(i);
      const action=BUTTONS[i];
      if(action)sync(`pad:${i}`,down,hooks,action[0],action[1]);
      else prev.set(`pad:${i}`,down);
    }
    const start=pressedButton(gp.buttons[9],9);
    const select=pressedButton(gp.buttons[8],8);
    if(start&&!prev.get('edge:start'))hooks.onStart?.();
    if(select&&!prev.get('edge:select'))hooks.onSelect?.();
    prev.set('edge:start',start);
    prev.set('edge:select',select);
    const axes=[0,1,2,3].map(i=>Number(gp.axes?.[i])||0);
    syncStick('left',axes[0],axes[1],hooks);
    syncStick('right',axes[2],axes[3],hooks);
    snapshot={connected:true,id:gp.id||'',mapping:gp.mapping||'',buttons,axes};
    const axisText=`L ${axes[0].toFixed(2)},${axes[1].toFixed(2)}  R ${axes[2].toFixed(2)},${axes[3].toFixed(2)}`;
    const names=buttons.map(i=>NAMES[i]||String(i)).join(' ');
    const mode=gp.mapping==='standard'?'':` ／ 割り当て ${gp.mapping||'不明'}`;
    show(`USB ${shortName(gp.id)} ／ ${names||'待機'} ／ ${axisText}${mode}`);
    return snapshot;
  }
  return{poll,getState:()=>snapshot};
})();
