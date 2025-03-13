import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Modal elements
const modal = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact")
};

// GLB model load
const loader = new GLTFLoader();
let model;
loader.load(
    './model/earth_03.glb', // Updated to earth_03.glb
    (glb) => {
        model = glb.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.scale.set(100, 100, 100);
        scene.add(model);
        console.log('earth_03.glb loaded:', model);
        console.log('Children:', model.children); // Verify structure
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading earth_03.glb:', error);
    }
);

// Three-Point Lighting
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2);
fillLight.position.set(-5, 3, 5);
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
backLight.position.set(0, 5, -5);
scene.add(backLight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Camera (Orthographic)
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
    -aspect * 50,
    aspect * 50,
    50,
    -50,
    1,
    1000
);

// Initialize OrbitControls
const controls = new OrbitControls(camera, canvas);
camera.position.set(-120, 50.36559573967677, 400);
controls.target.set(2, 2, 2);
controls.update();

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x0000FF, 1);
console.log(renderer);

// Animation loop
function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Handle resize
function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    const newAspect = sizes.width / sizes.height;
    camera.left = -newAspect * 50;
    camera.right = newAspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
}
window.addEventListener('resize', handleResize);

// Raycaster for click
window.addEventListener('click', onClick);

function onClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        let targetModel = clickedObject;

        // Traverse up to find the named parent (Astronaut, Globe, Dog)
        while (targetModel && !['Astronaut', 'Globe', 'Dog'].includes(targetModel.name)) {
            targetModel = targetModel.parent;
        }

        // Hide all modals
        modal.work.style.display = 'none';
        modal.about.style.display = 'none';
        modal.contact.style.display = 'none';

        // Show the corresponding modal
        if (targetModel) {
            switch (targetModel.name) {
                case 'Astronaut':
                    modal.work.style.display = 'block';
                    break;
                case 'Globe':
                    modal.about.style.display = 'block';
                    break;
                case 'Dog':
                    modal.contact.style.display = 'block';
                    break;
                default:
                    console.log('Clicked unknown model:', targetModel);
            }
        }
    }
}