'use strict';
// A continuous skin surface around a two-bone chain. Joint centres remain exact.
window.createHumanRig=({T,V,scene,skin,softwareRendering})=>{
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
function surface(material,radii){const rows=softwareRendering?20:32,cols=softwareRendering?10:18,pos=new Float32Array((rows+1)*(cols+1)*3),uv=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){uv.push(i/cols,j/rows);if(j<rows&&i<cols){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,a+1,b,b,a+1,b+1)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);const mesh=new T.Mesh(geo,material);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);return{mesh,rows,cols,radii}}
function radiusAt(profile,t){let i=0;while(i<profile.length-2&&t>profile[i+1][0])i++;const a=profile[i],b=profile[i+1];return T.MathUtils.lerp(a[1],b[1],smooth((t-a[0])/(b[0]-a[0])))}
function deform(surface,root,joint,end,handQ,handEnd){const {rows,cols,radii,mesh}=surface,p=mesh.geometry.attributes.position;const upper=joint.clone().sub(root).normalize(),lower=end.clone().sub(joint).normalize(),pre=joint.clone().addScaledVector(upper,-.055),post=joint.clone().addScaledVector(lower,.055);let plane=upper.clone().cross(lower);if(plane.lengthSq()<.001)plane=V(0,0,1);plane.normalize();const boneCentre=t=>t<.44?root.clone().lerp(pre,t/.44):t>.56?post.clone().lerp(end,(t-.56)/.44):pre.clone().multiplyScalar((1-(t-.44)/.12)**2).addScaledVector(joint,2*(1-(t-.44)/.12)*(t-.44)/.12).addScaledVector(post,((t-.44)/.12)**2);
// The last skin section enters the palm, closing the wrist without a ball joint.
const palmEnd=handQ&&handEnd?handEnd.clone().applyQuaternion(handQ).add(end):null;
const handAxis=handQ?V(0,1,0).applyQuaternion(handQ):lower;
const centre=t=>{if(!palmEnd||t<=.88)return boneCentre(t);const u=(t-.88)/.12,v=1-u,p0=boneCentre(.88),p1=p0.clone().addScaledVector(lower,.055),p2=palmEnd.clone().addScaledVector(handAxis,-.055);return p0.multiplyScalar(v*v*v).addScaledVector(p1,3*v*v*u).addScaledVector(p2,3*v*u*u).addScaledVector(palmEnd,u*u*u)};
for(let j=0;j<=rows;j++){const t=j/rows*(surface.endAt||1),c=centre(t),tangent=centre(Math.min(1,t+.002)).sub(centre(Math.max(0,t-.002))).normalize(),x=plane.clone().cross(tangent).normalize(),z=tangent.clone().cross(x).normalize();let twist=0;if(handQ){const desired=V(1,0,0).applyQuaternion(handQ);twist=Math.atan2(desired.dot(z),desired.dot(x))*smooth((t-.54)/.46)}const r=radiusAt(radii,t);for(let i=0;i<=cols;i++){const angle=i/cols*Math.PI*2+twist,point=c.clone().addScaledVector(x,Math.cos(angle)*r).addScaledVector(z,Math.sin(angle)*r*.93);p.setXYZ(j*(cols+1)+i,point.x,point.y,point.z)}}p.needsUpdate=true;mesh.geometry.computeVertexNormals()}
const arm=()=>surface(skin,[[0,.072],[.09,.122],[.25,.115],[.40,.088],[.5,.076],[.64,.09],[.8,.067],[.88,.052],[.96,.034],[1,.021]]);
const sleeve=(material,endAt)=>{const s=surface(material,[[0,.085],[.09,.142],[.25,.144],[.4,.136],[.6,.13],[1,.06]]);s.endAt=endAt;return s};
return{smooth,arm,sleeve,deform};
};
