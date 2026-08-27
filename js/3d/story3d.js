import { THREE, createScene, particles } from './scene-utils.js';
const app = createScene('[data-three-scene="story"]', { camera:[0, 0, 9], fov:44 });
if (app) {
  const { scene, camera, mobile } = app, galaxy = new THREE.Group(), constellation = new THREE.Group(); scene.add(galaxy, constellation);
  // Layered stars and a restrained constellation provide depth without external textures.
  scene.fog = new THREE.FogExp2('#12090a', .055);
  scene.add(particles(mobile ? 140 : 440, 24, '#f3d6ab', .032));
  scene.add(particles(mobile ? 70 : 180, 15, '#8da4df', .045));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(2.1, 24, 24), new THREE.MeshBasicMaterial({ color:'#5a4a95', transparent:true, opacity:.09 })); glow.scale.set(1.8,.52,1); galaxy.add(glow);
  const starMaterial = new THREE.MeshBasicMaterial({ color:'#f5dfac', transparent:true, opacity:.9 });
  const stars=[];
  for(let i=0;i<(mobile?28:60);i++){const star=new THREE.Mesh(new THREE.SphereGeometry(.018+(i%4)*.009, 5,5),starMaterial);const angle=Math.random()*Math.PI*2, radius=1.2+Math.random()*5;star.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius*.48,(Math.random()-.5)*3);galaxy.add(star);stars.push(star);}
  const points=[[-3.2,.45,-.4],[-2.1,1.25,.25],[-.8,.55,-.1],[.3,1.5,.1],[1.55,.58,.25],[3,1.18,-.2]];
  const lineGeometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))); constellation.add(new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({color:'#d9a94e',transparent:true,opacity:.44})));
  points.forEach((point,index)=>{const node=new THREE.Mesh(new THREE.SphereGeometry(index%2?.07:.1,10,10),new THREE.MeshBasicMaterial({color:index%2?'#95a9e4':'#f0d9a0'}));node.position.set(...point);constellation.add(node);});
  const orbit=new THREE.Mesh(new THREE.TorusGeometry(3.7,.008,4,90),new THREE.MeshBasicMaterial({color:'#a692dd',transparent:true,opacity:.35}));orbit.rotation.x=1.16;galaxy.add(orbit);
  app.animate((time, delta, pointer, settings)=>{galaxy.rotation.z += settings.reducedMotion?0:delta*.012; galaxy.rotation.y += delta*.006; constellation.position.x=THREE.MathUtils.lerp(constellation.position.x,pointer.x*.32,.02); constellation.position.y=THREE.MathUtils.lerp(constellation.position.y,pointer.y*.18,.02); camera.position.x=THREE.MathUtils.lerp(camera.position.x,pointer.x*.18,.016); camera.position.y=THREE.MathUtils.lerp(camera.position.y,pointer.y*.1 - Math.min(window.scrollY,900)*.00032,.016); camera.lookAt(0,.25,0); stars.forEach((star,i)=>{star.scale.setScalar(.8+Math.sin(time*.9+i)*.25);});});
}
