import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

const canvas = document.querySelector('#experience-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#D9CAD1');
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 5, 10);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.target.set(0, 0, 0);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let clickableObjects = [];

const loadingScreen = document.querySelector('.loading-screen');
const loader = new GLTFLoader();
loader.load('/models/japanese_tavern.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(0, 0, 0);
  model.scale.set(0, 0, 0); // Start small for animation
  scene.add(model);
  clickableObjects.push(model);
  gsap.to(model.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'back.out(1.8)' });
  setTimeout(() => {
    loadingScreen.style.transition = 'opacity 0.5s';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500); // Fade duration
  }, 3000); // 3-second delay
}, undefined, (error) => console.error('Error:', error));

window.addEventListener('mousemove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);
  if (intersects.length > 0) {
    document.getElementById('tavern-modal').style.display = 'block';
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();