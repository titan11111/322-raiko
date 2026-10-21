'use strict';
// Animation design parameters, not measured human joint limits or timing data.
window.createTaikoMotion=({smooth,V})=>{
 const stances={odaiko:{rise:0,width:.58,front:.49,back:.89},nagado:{rise:.025,width:.52,front:.51,back:.85},shime:{rise:.06,width:.45,front:.54,back:.81},okedo:{rise:.025,width:.52,front:.51,back:.85},snare:{rise:.075,width:.43,front:.56,back:.81},kit:{rise:.075,width:.43,front:.56,back:.81},djembe:{rise:.05,width:.47,front:.53,back:.83},tsuzumi:{rise:.07,width:.42,front:.56,back:.80}};
 function phase(a,time,instrument){
  const age=time-a.start,returnEnd=a.duration*.90,windup=instrument==='odaiko'?(a.windup||0):0;
  let arm=0,hand=0,prepare=0,back=0,backHand=0,stage='ready';
  if(age>=0&&age<windup){const t=age/windup;back=smooth(t);backHand=smooth(Math.pow(t,1.25));stage='backswing'}
  else if(age>=windup&&age<a.down){const t=(age-windup)/(a.down-windup);arm=smooth(t);hand=smooth(Math.pow(t,instrument==='odaiko'?1.4:1.65));prepare=instrument==='odaiko'?0:t<.3?Math.sin(Math.PI*t/.3):0;back=instrument==='odaiko'?1-arm:0;stage=instrument!=='odaiko'&&t<.25?'prepare':t<.75?'downstroke':'snap'}
  else if(age>=a.down&&age<returnEnd){const t=(age-a.down)/(returnEnd-a.down);arm=1-smooth(t);hand=(1-t)*(1-t);stage=t<.25?'rebound':'recover'}
  // Inclined okedo keeps wrist and arm closer through the stroke.
  if(instrument==='okedo')hand=arm+(hand-arm)*.35;
  return{age,arm,hand,prepare,back,backHand,stage,returnEnd};
 }
 function odaikoBack(side,power=2.2){const size=.85+.15*Math.max(0,Math.min(1,(power-1)/1.2));return{wrist:V(side*(.34+.10*size),1.91+.62*size,.25+.72*size),direction:V(-side*.08,.62,.78).normalize(),pole:V(side*.35,.25,.95)}}
 // Sweep above the shoulder in the sagittal plane. Quaternion shortest paths can cross the head.
 function swingDirection(from,to,t){const angle=Math.atan2(from.y,-from.z)*(1-t)+Math.atan2(to.y,-to.z)*t,x=from.x*(1-t)+to.x*t,yz=Math.sqrt(Math.max(0,1-x*x));return V(x,Math.sin(angle)*yz,-Math.cos(angle)*yz)}
 function odaikoReady(side,charge){const lift=smooth(charge),back=odaikoBack(side);return{wrist:V(side*.34,1.91,.25).lerp(back.wrist,lift).add(V(side*.22*Math.sin(Math.PI*lift),0,0)),direction:swingDirection(V(-side*.10,.50,-.86).normalize(),back.direction,lift),pole:V(side*.20,-1,-.12).lerp(back.pole,lift),lift}}
 return{phase,odaikoReady,odaikoBack,swingDirection,stance:id=>stances[id]||stances.odaiko};
};
