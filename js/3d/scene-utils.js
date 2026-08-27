import * as THREE from 'https://unpkg.com/three@0.166.1/build/three.module.js';

export { THREE };

// Shared progressive-enhancement renderer: it leaves the page's CSS art intact on failure.
export function createScene(selector, options = {}) {
  const mount = document.querySelector(selector);
  if (!mount || !window.WebGLRenderingContext) return null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 820px)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'low-power' });
  } catch (_) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(options.fov || 42, 1, .1, 100);
  camera.position.set(...(options.camera || [0, 0, 8]));
  const pointer = new THREE.Vector2();
  let visible = true, frame = 0, raf = 0;
  const resize = () => { const rect = mount.getBoundingClientRect(); camera.aspect = rect.width / Math.max(rect.height, 1); camera.updateProjectionMatrix(); renderer.setSize(rect.width, rect.height, false); };
  const onPointer = (event) => { const rect = mount.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .01 });
  observer.observe(mount); window.addEventListener('resize', resize); window.addEventListener('pointermove', onPointer, { passive:true }); resize();
  // Pause offscreen work and throttle animation for reduced-motion visitors.
  function animate(callback) { let previous = performance.now(); const loop = (now) => { raf = requestAnimationFrame(loop); const delta = Math.min(.05, (now - previous) / 1000); previous = now; if (!visible) return; if (reducedMotion && ++frame % 8) return; callback(now / 1000, delta, pointer, { reducedMotion, mobile }); renderer.render(scene, camera); }; raf = requestAnimationFrame(loop); }
  function dispose() { cancelAnimationFrame(raf); observer.disconnect(); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onPointer); renderer.dispose(); mount.replaceChildren(); }
  window.addEventListener('pagehide', dispose, { once:true });
  return { mount, renderer, scene, camera, animate, dispose, reducedMotion, mobile };
}

export function particles(count, spread, color, size = .025) { const geometry = new THREE.BufferGeometry(), positions = new Float32Array(count * 3); for (let i=0;i<count;i++) { positions[i*3]=(Math.random()-.5)*spread; positions[i*3+1]=(Math.random()-.5)*spread; positions[i*3+2]=(Math.random()-.5)*spread; } geometry.setAttribute('position', new THREE.BufferAttribute(positions,3)); return new THREE.Points(geometry, new THREE.PointsMaterial({ color, size, transparent:true, opacity:.72, depthWrite:false, sizeAttenuation:true })); }
