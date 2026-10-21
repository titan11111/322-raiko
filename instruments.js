'use strict';
window.createInstrumentBank=({T,V,scene,mesh,rod,box,woodTex,headTex,softwareRendering,original})=>{
const bank={odaiko:original},normalUp=V(0,1,0),normalFront=V(0,0,1);
const M=(color,metalness=0,roughness=.65,map=null)=>new T.MeshStandardMaterial({color,metalness,roughness,map});
const chrome=M('#b4c0c9',.88,.24),brass=M('#c9a34d',.8,.33),skin=M('#e7dcc1',0,.82,headTex),wood=M('#b9905d',0,.61,woodTex),rope=M('#d4c6a1',0,.94),black=M('#171a20',.25,.72),red=M('#912c22',.08,.29,woodTex),blue=M('#204b66',.32,.28);
brass.side=T.DoubleSide;
function group(){const g=new T.Group();g.visible=false;scene.add(g);return g}
function cylinder(parent,r,d,mat,pos=V(),axis=normalUp){const m=mesh(new T.CylinderGeometry(r,r,d,48),mat,pos,null,parent);m.quaternion.setFromUnitVectors(normalUp,axis);return m}
function ring(parent,r,thick,mat,center,normal){const m=mesh(new T.TorusGeometry(r,thick,8,64),mat,center,null,parent);m.quaternion.setFromUnitVectors(normalFront,normal);return m}
function stand(parent,center,wooden=false){const mat=wooden?wood:chrome;const top=V(center.x,Math.max(.4,center.y+.08),center.z);rod(mat,V(top.x,.1,top.z),top,wooden?.035:.018,wooden?.035:.012,parent);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod(mat,V(top.x,.18,top.z),V(top.x+Math.cos(a)*.34,.04,top.z+Math.sin(a)*.34),.015,.013,parent);cylinder(parent,.025,.06,black,V(top.x+Math.cos(a)*.34,.04,top.z+Math.sin(a)*.34))}}
function pad(id,center,normal,radius,sound){return{id,center:V(...center),normal:V(...normal),radius,sound,rimHeight:.025}}
// Cylindrical drums are modeled around local Z, then oriented as one assembly.
function drum(parent,{center,radius,depth,normal=normalUp,shell=red,laced=false,metal=false,bulge=false}){const g=new T.Group();g.position.copy(center);g.quaternion.setFromUnitVectors(normalFront,normal);parent.add(g);
if(bulge){const points=[];for(let i=0;i<=16;i++){const t=i/16;points.push(new T.Vector2(radius*(.92+.13*Math.sin(t*Math.PI)),(t-.5)*depth))}const b=mesh(new T.LatheGeometry(points,48),shell,V(),null,g);b.rotation.x=Math.PI/2}else cylinder(g,radius*.97,depth,shell,V(),normalFront);
for(const sign of [-1,1]){const face=mesh(new T.CircleGeometry(radius,64),skin,V(0,0,sign*(depth/2+.004)),null,g);if(sign<0)face.rotation.y=Math.PI;ring(g,radius,.021,metal?chrome:rope,V(0,0,sign*(depth/2)),normalFront)}
for(let i=0;i<(laced?18:12);i++){const a=i/(laced?18:12)*Math.PI*2,x=Math.cos(a)*radius,y=Math.sin(a)*radius;if(laced){const b=a+Math.PI/(18/2);rod(rope,V(x,y,-depth/2),V(Math.cos(b)*radius,Math.sin(b)*radius,depth/2),.007,.007,g)}else{const bolt=cylinder(g,.014,depth*.85,metal?chrome:brass,V(x,y,0),normalFront);if(!metal){bolt.scale.z=.65}}}return g}
const add=(id,def)=>bank[id]={id,...def};
// Upright wooden nagado drum, with the head facing upward on a low stand.
{const root=group(),center=V(0,1.08,-.25),r=.54,d=.64;drum(root,{center,radius:r,depth:d,bulge:true});stand(root,V(0,.82,-.25),true);for(const x of [-.36,.36]){rod(wood,V(x,.05,-.65),V(x,1.0,.12),.045,.045,root);rod(wood,V(x,.05,.14),V(x,1.0,-.65),.045,.045,root)}add('nagado',{root,name:'長胴太鼓',subtitle:'木の胴に響く、祭りの一打。',pads:[pad('nagado',[0,1.404,-.25],[0,1,0],r,'nagado')],hint:'左右で面打ち。縁に切り替えるとカッ。'})}
{const root=group(),r=.37,d=.20,center=V(0,1.38,-.17);drum(root,{center,radius:r,depth:d,laced:true,shell:wood});stand(root,V(0,1.2,-.17),true);add('shime',{root,name:'締太鼓',subtitle:'張りつめた皮が刻む、鋭い拍。',pads:[pad('shime',[0,1.484,-.17],[0,1,0],r,'shime')],hint:'面は中心を少し外してテン。縁はカッ。',stickScale:.70})}
{const root=group(),r=.45,d=.82,normal=V(0,.70,.714).normalize(),center=V(0,1.02,-.35);drum(root,{center,radius:r,depth:d,normal,laced:true,shell:M('#694c32',0,.72,woodTex)});stand(root,V(0,.73,-.35),true);const head=center.clone().addScaledVector(normal,d/2+.004);add('okedo',{root,name:'桶胴太鼓',subtitle:'縄で締めた胴から、軽く弾む響き。',pads:[pad('okedo',head.toArray(),normal.toArray(),r,'okedo')],hint:'台に据えた桶胴太鼓。左右・長押しは共通。'})}
{const root=group(),r=.35,d=.22,center=V(0,1.38,-.17);drum(root,{center,radius:r,depth:d,shell:chrome,metal:true});stand(root,V(0,1.22,-.17));for(let i=0;i<12;i++)rod(chrome,V(-.18+i*.032,1.265,-.45),V(-.18+i*.032,1.265,.1),.0015,.0015,root);add('snare',{root,name:'スネアドラム',subtitle:'金属の胴とスナッピーの、歯切れよい音。',pads:[pad('snare',[0,1.494,-.17],[0,1,0],r,'snare')],hint:'左右でスネア。縁では乾いたリム音。',stickScale:.65})}
function cymbal(root,center,r,id,sound){
 const profile=[[0,.045],[.065,.045],[.12,.014],[.2,.007],[r,0]],points=profile.map(([x,y])=>new T.Vector2(x,y));
 mesh(new T.LatheGeometry(points,64),brass,center,null,root);
 for(let a=.17;a<r;a+=.035){const groove=ring(root,a,.0012,brass,center.clone().add(V(0,.006,0)),normalUp);groove.castShadow=false}
 rod(chrome,center.clone().setY(.1),center.clone().add(V(0,.08,0)),.012,.012,root);cylinder(root,.022,.035,black,center.clone().add(V(0,.062,0)));stand(root,center);
 // The playable point lies on the same conical surface as the visible cymbal.
 const x=-Math.sign(center.x)*.15,z=.08,rho=Math.hypot(x,z),lo=profile[2],hi=profile[3],slope=(hi[1]-lo[1])/(hi[0]-lo[0]),height=lo[1]+(rho-lo[0])*slope;
 return pad(id,center.clone().add(V(x,height,z)).toArray(),V(-slope*x/rho,1,-slope*z/rho).normalize().toArray(),r,sound);
}
{
 const root=group(),snare=V(-.22,1.00,.02),tom=V(.35,1.00,-.24);
 drum(root,{center:snare,radius:.31,depth:.24,shell:chrome,metal:true});stand(root,V(snare.x,.83,snare.z));
 drum(root,{center:tom,radius:.31,depth:.28,shell:blue,metal:true});stand(root,V(tom.x,.82,tom.z));
 drum(root,{center:V(.40,.51,-.61),radius:.47,depth:.55,normal:normalFront,shell:blue,metal:true});
 rod(chrome,V(.10,.28,-.40),V(.02,.04,-.20),.02,.02,root);rod(chrome,V(.70,.28,-.40),V(.78,.04,-.20),.02,.02,root);
 const left=cymbal(root,V(-.70,1.35,-.14),.35,'hihat','hihat'),right=cymbal(root,V(.72,1.38,-.26),.42,'crash','crash');
 cylinder(root,.34,.008,brass,V(-.70,1.32,-.14));
 add('kit',{root,name:'ドラムセット',subtitle:'スネア、タム、シンバルで刻むグルーヴ。',pads:[pad('snare',snare.clone().add(V(0,.124,0)).toArray(),[0,1,0],.31,'snare'),pad('tom',tom.clone().add(V(0,.144,0)).toArray(),[0,1,0],.31,'tom'),left,right],hint:'オープンハンド。左＝スネア・ハイハット／右＝タム・クラッシュ。',stickScale:.65});
}
{
 const root=group(),center=V(0,.455,.22),r=.37;
 const pts=[[.22,0],[.16,.25],[.15,.38],[.26,.55],[r,.63],[r,.72]].map(([x,y])=>new T.Vector2(x,y));
 mesh(new T.LatheGeometry(pts,64),M('#754c29',0,.78,woodTex),center,null,root);
 cylinder(root,r,.025,skin,V(0,1.1875,.22));ring(root,r,.022,rope,V(0,1.1835,.22),normalUp);
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2;rod(rope,V(Math.cos(a)*r,1.17,.22+Math.sin(a)*r),V(Math.cos(a+.1)*.17,.73,.22+Math.sin(a+.1)*.17),.005,.005,root)}
 stand(root,V(0,.44,.22),true);
 add('djembe',{root,name:'ジャンベ',subtitle:'手のひらで生まれる、深いベースと乾いたスラップ。',pads:[pad('djembe',[0,1.20,.22],[0,1,0],r,'djembe')],bare:true,hint:'台置きの立奏。面＝ベース／縁＝スラップ。'});
}
{
 const root=group(),assembly=new T.Group(),center=V(.44,1.66,.85),normal=V(.82,.06,-.57).normalize(),r=.18,d=.31;
 assembly.position.copy(center);assembly.quaternion.setFromUnitVectors(normalFront,normal);root.add(assembly);
 const points=[[-d/2,r*.83],[-.12,.12],[0,.065],[.12,.12],[d/2,r*.83]].map(([y,x])=>new T.Vector2(x,y));
 const b=mesh(new T.LatheGeometry(points,48),M('#8a3020',.04,.3,woodTex),V(),null,assembly);b.rotation.x=Math.PI/2;
 for(const sign of [-1,1]){cylinder(assembly,r,.012,skin,V(0,0,sign*d/2),normalFront);ring(assembly,r,.012,rope,V(0,0,sign*d/2),normalFront)}
 let cordPoint;
 for(let i=0;i<8;i++){
  const a=i/8*Math.PI*2,b=a+Math.PI/4,p0=V(Math.cos(a)*r,Math.sin(a)*r,-d/2),p1=V(Math.cos(b)*r,Math.sin(b)*r,d/2);
  rod(rope,p0,p1,.006,.006,assembly);if(i===5)cordPoint=p0.clone().lerp(p1,.5);
 }
 const cordNormal=V(cordPoint.x,cordPoint.y,0).normalize().applyQuaternion(assembly.quaternion);
 cordPoint.applyQuaternion(assembly.quaternion).add(center);
 const head=center.clone().addScaledVector(normal,d/2+.006);
 add('tsuzumi',{root,name:'小鼓',subtitle:'床几に座り、右肩の鼓へ指を振り入れる。',pads:[pad('cord',cordPoint.toArray(),cordNormal.toArray(),.07,'squeeze'),pad('tsuzumi',head.toArray(),normal.toArray(),r,'tsuzumi')],bare:true,hint:'左＝調べ緒を絞る／右＝指で打つ。長押しで強める。'});
}
return bank;
};
