import { THREE, createScene, particles } from './scene-utils.js';
const app = createScene('[data-three-scene="home"]', { camera:[0, .1, 8.5], fov:40 });
if (app) {
  const { scene, camera, mobile } = app, root = new THREE.Group(); scene.add(root);
  // A knowledge core, orbital disciplines, and a sparse particle field are entirely procedural.
  const gold = new THREE.Color('#d9a94e'), violet = new THREE.Color('#7b54d8');
  scene.add(particles(mobile ? 90 : 240, 15, '#d9c98d', .022));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, mobile ? 1 : 2), new THREE.MeshBasicMaterial({ color:gold, wireframe:true, transparent:true, opacity:.8 })); root.add(core);
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(.66, 1), new THREE.MeshBasicMaterial({ color:violet, transparent:true, opacity:.45 })); root.add(inner);
  const rings = []; [1.65, 2.18, 2.7].forEach((radius, index) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .012, 5, 96), new THREE.MeshBasicMaterial({color:index===1?violet:gold, transparent:true, opacity:.5})); ring.rotation.set(index*.76, index*.52, index*.28); root.add(ring); rings.push(ring); });
  const orbiters=[]; const raycaster = new THREE.Raycaster(); const geometries=[new THREE.BoxGeometry(.34,.15,.48), new THREE.TetrahedronGeometry(.25), new THREE.TorusKnotGeometry(.18,.055,48,8), new THREE.BoxGeometry(.38,.08,.28)];
  for(let i=0;i<(mobile?5:9);i++){ const mesh=new THREE.Mesh(geometries[i%geometries.length],new THREE.MeshBasicMaterial({color:i%2?gold:violet,wireframe:i%3===0,transparent:true,opacity:.84})); mesh.userData={angle:i*2.4,radius:1.35+(i%3)*.65,speed:.075+i*.008}; root.add(mesh); orbiters.push(mesh); }
  const light = new THREE.PointLight('#d9a94e', 2.2, 10); light.position.set(0,0,2); scene.add(light);
  app.animate((time, delta, pointer, settings) => { root.rotation.y += settings.reducedMotion ? 0 : delta*.07; root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, pointer.y*.09, .025); camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x*.35, .025); camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y*.2, .025); camera.position.z = 8.5 + Math.min(window.scrollY,700)*.00055; camera.lookAt(0,0,0); core.rotation.x += delta*.15; inner.rotation.y -= delta*.18; rings.forEach((r,i)=>r.rotation.z += delta*(.025+i*.012)); orbiters.forEach((m,i)=>{const a=m.userData.angle+time*m.userData.speed;m.position.set(Math.cos(a)*m.userData.radius,Math.sin(a*1.32)*.55,Math.sin(a)*m.userData.radius*.3);}); raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects(orbiters,false)[0]?.object; orbiters.forEach(m=>m.scale.setScalar(m===hit?1.35:1)); core.scale.setScalar(hit?1:1.05); });
}
