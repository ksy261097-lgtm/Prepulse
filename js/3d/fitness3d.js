import { THREE, createScene, particles } from './scene-utils.js';
const app = createScene('[data-three-scene="fitness"]', { camera:[0, .1, 8.2], fov:38 });
if (app) {
  const { scene, camera, mobile } = app, forge = new THREE.Group(); scene.add(forge);
  // Lightweight primitives suggest a barbell, rack, platform, and anatomical form.
  scene.add(particles(mobile ? 55 : 150, 13, '#e6b786', .02));
  const steel = new THREE.MeshBasicMaterial({color:'#e4bd79',wireframe:true,transparent:true,opacity:.56});
  const ember = new THREE.MeshBasicMaterial({color:'#f05a28',transparent:true,opacity:.72});
  const bar = new THREE.Group(); const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,3.1,10),steel); shaft.rotation.z=Math.PI/2;bar.add(shaft);
  [-1.26,-1.05,1.05,1.26].forEach((x,i)=>{const plate=new THREE.Mesh(new THREE.CylinderGeometry(i%2?.28:.42,i%2?.28:.42,.11,20),i%2?steel:ember);plate.rotation.z=Math.PI/2;plate.position.x=x;bar.add(plate);}); bar.position.set(1.7,.15,0);bar.rotation.z=-.12; forge.add(bar);
  const rack = new THREE.Group(); [-1,1].forEach(x=>{const upright=new THREE.Mesh(new THREE.BoxGeometry(.07,3.2,.07),steel);upright.position.set(x,0,0);rack.add(upright);}); const cross=new THREE.Mesh(new THREE.BoxGeometry(2.1,.07,.07),steel);cross.position.y=1.5;rack.add(cross); rack.position.set(1.7,-.1,-.6);forge.add(rack);
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,.04,48),new THREE.MeshBasicMaterial({color:'#67301e',transparent:true,opacity:.25}));platform.position.set(1.5,-1.8,-.3);platform.rotation.x=.22;forge.add(platform);
  const anatomy = new THREE.Mesh(new THREE.TorusKnotGeometry(.48,.06,70,10),new THREE.MeshBasicMaterial({color:'#ff9b70',wireframe:true,transparent:true,opacity:.42})); anatomy.position.set(-.35,.3,.2); anatomy.scale.set(.8,1.8,.8);forge.add(anatomy);
  const glow=new THREE.PointLight('#f05a28',3.2,10);glow.position.set(1.5,1.5,2);scene.add(glow);
  app.animate((time,delta,pointer,settings)=>{forge.rotation.y=THREE.MathUtils.lerp(forge.rotation.y,-.35+pointer.x*.12,.018);forge.rotation.x=THREE.MathUtils.lerp(forge.rotation.x,pointer.y*.06,.018);bar.position.y=.15+Math.sin(time*.75)*.05;bar.rotation.z=-.12+Math.sin(time*.5)*.025;anatomy.rotation.y+=settings.reducedMotion?0:delta*.2;camera.position.x=THREE.MathUtils.lerp(camera.position.x,pointer.x*.22,.018);camera.position.y=THREE.MathUtils.lerp(camera.position.y,pointer.y*.12,.018);camera.lookAt(.8,0,0);});
}
