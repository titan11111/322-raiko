'use strict';
// Wrist origin, palm +Y, palm width X, palm back +Z. The shaft has its own axis.
window.createTaikoHand=({T,V,scene,skin,stickMat,mesh,ell,rod,side,length})=>{
 const s=side,grip=new T.Group();scene.add(grip);
 const shaftAxis=V(-s*.62,Math.sqrt(1-.62*.62),0),shaftCenter=V(0,.105,.004);
 const palm=ell(skin,[0,.075,.038],[.048,.061,.026],grip);
 const wristSocket=ell(skin,[0,0,0],[.045,.045,.044],grip);
 const fingerRoots=[],fingerTips=[],fingerParts=[];
 for(let i=0;i<4;i++){
  const x=-s*(.038-i*.025),y=[.125,.130,.123,.110][i],r=i===3?.009:.0105;
  const contactY=shaftCenter.y+x/shaftAxis.x*shaftAxis.y;
  const pts=[V(x,y,.045),V(x,y+(i===3?.019:.026),.031),V(x+s*.003,contactY+.023,-.010),V(x+s*.006,contactY+.005,-.025),V(x+s*.006,contactY-.006,-.027)];
  const finger=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,r,8,false),skin,V(),null,grip);
  finger.name=['index','middle','ring','little'][i];fingerParts.push(finger);
  ell(skin,pts[0].toArray(),[r*1.12,r*1.10,r*1.08],grip);
  ell(skin,pts.at(-1).toArray(),[r,r,r],grip);fingerRoots.push(pts[0].clone());fingerTips.push(pts.at(-1).clone());
 }
 const thumbPoints=[V(-s*.044,.066,.044),V(-s*.067,.095,.026),V(-s*.052,.128,.001),V(-s*.030,.145,-.012)];
 const thumb=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(thumbPoints),16,.0125,8,false),skin,V(),null,grip);
 thumb.name='thumb';ell(skin,thumbPoints.at(-1).toArray(),[.013,.013,.013],grip);
 const fistParts=grip.children.slice();
 // Preserve the existing bare-palm contact relative to the new wrist origin.
 const openHand=new T.Group();openHand.position.set(0,.065,-.028);openHand.visible=false;grip.add(openHand);
 ell(skin,[0,0,.035],[.048,.071,.022],openHand);
 for(let i=0;i<4;i++){
  const x=s*(-.036+i*.024),extra=[.085,.108,.095,.071][i];
  const pts=[V(x,.045,.035),V(x*1.12,.080,.031),V(x*1.2,.065+extra,.026)];
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),10,.0095,8,false),skin,V(),null,openHand);
  ell(skin,pts[2].toArray(),[.0095,.0095,.0095],openHand);
 }
 const tpts=[V(-s*.035,-.005,.035),V(-s*.07,.022,.025),V(-s*.079,.059,.022)];
 mesh(new T.TubeGeometry(new T.CatmullRomCurve3(tpts),10,.012,8,false),skin,V(),null,openHand);
 ell(skin,tpts[2].toArray(),[.012,.012,.012],openHand);
 const bachi=new T.Group();bachi.position.copy(shaftCenter);bachi.quaternion.setFromUnitVectors(V(0,1,0),shaftAxis);grip.add(bachi);
 rod(stickMat,V(0,-.105,0),V(0,length-.021,0),.022,.021,bachi);
 ell(stickMat,[0,length-.021,0],[.021,.021,.021],bachi);
 const tip=new T.Object3D();tip.position.copy(shaftCenter).addScaledVector(shaftAxis,length-.021);grip.add(tip);
 // Select a stable palm roll independently of the shaft direction.
 function orientation(direction,palmLift=1){
  const d=direction.clone().normalize(),up=V(0,1,0).addScaledVector(d,-d.y);
  if(up.lengthSq()<1e-6)up.set(0,0,1).addScaledVector(d,-d.z);
  const y=d.clone().multiplyScalar(shaftAxis.y).addScaledVector(up.normalize(),Math.abs(shaftAxis.x)*palmLift);
  const x=d.clone().addScaledVector(y,-shaftAxis.y).multiplyScalar(1/shaftAxis.x).normalize();
  const z=x.clone().cross(y).normalize();
  return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));
 }
 const palmAxis=fingerRoots[1].clone().add(fingerRoots[2]).multiplyScalar(.5).normalize();
 return{grip,palmAxis,palm,wristSocket,thumb,fingerRoots,fingerTips,fingerParts,fistParts,openHand,bachi,tip,shaftAxis,shaftCenter,orientation};
};
