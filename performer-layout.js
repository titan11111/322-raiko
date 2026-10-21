'use strict';
// World-space layouts share the same pelvis, seat and foot coordinates as the IK rig.
window.createPerformerLayout=({T,V,scene,mesh,ell,box,rod})=>{
 const radians=degrees=>degrees*Math.PI/180;
 const foot=(x,z,toeOut=12,y=.15,pedal=null)=>({x,y,z,toeOut:radians(toeOut),pedal});
 const standing=(pelvisY,bodyZ,lean,width,stagger=0)=>({
  pelvisY,bodyZ,lean:radians(lean),seated:false,seatHeight:null,
  feet:[foot(-width,bodyZ-stagger/2),foot(width,bodyZ+stagger/2)]
 });
 const profiles={
  odaiko:standing(1.06,.99,0,.57,.36),
  nagado:standing(1.10,1.17,11,.48,.12),
  shime:standing(1.13,1.13,10,.39,.04),
  okedo:standing(1.10,1.17,10,.41,.06),
  snare:standing(1.13,1.13,10,.39,.04),
  djembe:standing(1.10,1.03,12,.40,.06),
  kit:{pelvisY:.78,bodyZ:1.0,lean:radians(3),seated:true,seatHeight:.78,
   feet:[foot(-.40,.43,7,.18,'hihat'),foot(.40,.40,7,.18,'bass')]},
  tsuzumi:{pelvisY:.75,bodyZ:1.15,lean:0,seated:true,seatHeight:.75,
   feet:[foot(-.37,.58,12),foot(.37,.58,12)]}
 };
 const steel=new T.MeshStandardMaterial({color:'#a5b0b7',metalness:.86,roughness:.27});
 const rubber=new T.MeshStandardMaterial({color:'#151b20',metalness:.05,roughness:.84});
 const cushion=new T.MeshStandardMaterial({color:'#262b31',roughness:.91});
 const frameWood=new T.MeshStandardMaterial({color:'#614734',roughness:.79});
 const makeGroup=id=>{const g=new T.Group();g.name=id;g.visible=false;scene.add(g);return g};
 const kit=makeGroup('drum-throne-and-pedals'),tsuzumi=makeGroup('tsuzumi-folding-seat');
 const cylinder=(parent,radius,height,material,position)=>mesh(new T.CylinderGeometry(radius,radius,height,36),material,position,null,parent);
 const kitProfile=profiles.kit;
 cylinder(kit,.29,.09,cushion,V(0,kitProfile.seatHeight-.045,kitProfile.bodyZ));
 cylinder(kit,.25,.035,rubber,V(0,kitProfile.seatHeight-.105,kitProfile.bodyZ));
 rod(steel,V(0,.13,kitProfile.bodyZ),V(0,kitProfile.seatHeight-.10,kitProfile.bodyZ),.027,.023,kit);
 for(let i=0;i<3;i++){
  const angle=i*Math.PI*2/3,base=V(Math.cos(angle)*.35,.035,kitProfile.bodyZ+Math.sin(angle)*.35);
  rod(steel,V(0,.23,kitProfile.bodyZ),base,.018,.014,kit);
  ell(rubber,base.toArray(),[.043,.025,.043],kit);
 }
 const pedals={};
 for(const f of kitProfile.feet){
  // The plate sits under the shoe, with its hinge at the heel and toe pointing forward (-Z).
  const center=V(f.x,.035,f.z-.10),plate=box(steel,center.toArray(),[.16,.035,.35],kit);
  plate.rotation.y=-Math.sign(f.x)*f.toeOut;
  for(let i=0;i<5;i++)box(rubber,[f.x,.056,center.z-.105+i*.047],[.12,.006,.010],kit);
  cylinder(kit,.034,.021,rubber,V(f.x,.025,f.z+.08));
  pedals[f.pedal]={center:center.toArray(),top:.0525,ankle:[f.x,f.y,f.z]};
 }
 // A visible beater links the right pedal to the near head of the bass drum.
 rod(steel,V(.40,.075,.19),V(.40,.43,-.25),.009,.009,kit);
 ell(cushion,[.40,.46,-.27],[.055,.045,.032],kit);
 // The left pedal operates the hi-hat through a slim linkage beside the snare.
 rod(steel,V(-.40,.07,.21),V(-.70,.09,-.14),.010,.010,kit);
 const t=profiles.tsuzumi;
 box(cushion,[0,t.seatHeight-.0325,t.bodyZ],[.72,.065,.56],tsuzumi);
 for(const x of [-.28,.28]){
  rod(frameWood,V(x,.045,t.bodyZ-.25),V(x,t.seatHeight-.065,t.bodyZ+.23),.026,.026,tsuzumi);
  rod(frameWood,V(x,.045,t.bodyZ+.25),V(x,t.seatHeight-.065,t.bodyZ-.23),.026,.026,tsuzumi);
  cylinder(tsuzumi,.029,.04,steel,V(x,t.seatHeight*.49,t.bodyZ)).rotation.z=Math.PI/2;
 }
 rod(frameWood,V(-.28,.18,t.bodyZ-.16),V(.28,.18,t.bodyZ-.16),.018,.018,tsuzumi);
 let current='odaiko';
 const profile=id=>profiles[id]||profiles.odaiko;
 function apply(id){current=profiles[id]?id:'odaiko';kit.visible=current==='kit';tsuzumi.visible=current==='tsuzumi';return profile(current)}
 function getState(){const p=profile(current);return{instrument:current,seated:p.seated,seatHeight:p.seatHeight,seatVisible:kit.visible||tsuzumi.visible,pedals:current==='kit'?pedals:null}}
 return{profile,apply,getState};
};
