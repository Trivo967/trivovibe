import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Modal and Page elements
const modal = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact")
};
const pages = {
    landing: document.getElementById("experience"),
    projects: document.getElementById("projects-page"),
    about: document.getElementById("about-page"),
    contacts: document.getElementById("contacts-page")
};

// Set up DRACOLoader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@v0.149.0/examples/jsm/libs/draco/');

// GLB model load
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
let model;
let textModels = {};
let hoveredObject = null;

loader.load(
    './model/test11.glb',
    (glb) => {
        model = glb.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.scale.set(100, 100, 100);

        model.traverse((child) => {
            if (child.isMesh) {
                if (child.name === 'projects' || child.name === 'contacts' || child.name === 'about') {
                    textModels[child.name] = { mesh: child };
                    child.scale.set(0.5, 0.5, 0.5);
                    child.castShadow = true;
                }
            }
        });

        scene.add(model);
        console.log('test11.glb loaded:', model);
        console.log('Children:', model.children);
        console.log('Text models found:', textModels);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading test11.glb:', error);
    }
);

// Background Plane with Wireframe Grid Effect
const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    wireframe: true
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -50;
plane.receiveShadow = true;
scene.add(plane);

gsap.to(planeMaterial, {
    opacity: 0.5,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

// Three-Point Lighting with Shadows
const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(5, 5, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 500;
keyLight.shadow.camera.left = -200;
keyLight.shadow.camera.right = 200;
keyLight.shadow.camera.top = 200;
keyLight.shadow.camera.bottom = -200;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2);
fillLight.position.set(-5, 3, 5);
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
backLight.position.set(0, 5, -5);
scene.add(backLight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Camera (Perspective)
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.01,
    10000
);

// Animation setup (camera)
const clock = new THREE.Clock();
const startPosition = new THREE.Vector3(157.18032034310238, 131.15510541996068, 202.8636687878653);
const endPosition = new THREE.Vector3(520.1487133575725, 129.6368986344268, 818.432304415506);
const animationDuration = 2;
let animationStartTime = null;
let isAnimating = true;

camera.position.copy(startPosition);

// Initialize OrbitControls
const controls = new OrbitControls(camera, canvas);
controls.target.set(2, 2, 2);
controls.minDistance = 10;
controls.maxDistance = 2000;
controls.enabled = false;
controls.update();

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true, 
    powerPreference: 'high-performance' 
});
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(0x1a1a2e, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
console.log(renderer);

// Animation loop
function animate() {
    const elapsedTime = clock.getElapsedTime();

    if (animationStartTime === null) {
        animationStartTime = elapsedTime;
    }

    if (isAnimating) {
        const progress = Math.min((elapsedTime - animationStartTime) / animationDuration, 1);
        camera.position.lerpVectors(startPosition, endPosition, progress);
        if (progress === 1) {
            isAnimating = false;
            controls.enabled = true;
            console.log('Animation complete, controls enabled');
        }
    }

    if (!isAnimating) {
        controls.update();
    }

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Handle resize
function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', handleResize);

// Hover event
window.addEventListener('mousemove', onMouseMove);

function onMouseMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(Object.values(textModels).map(t => t.mesh), true);

    if (hoveredObject && (!intersects.length || intersects[0].object !== hoveredObject)) {
        gsap.to(hoveredObject.scale, { 
            x: 0.5, y: 0.5, z: 0.5,
            duration: 0.3, 
            ease: 'power2.out' 
        });
        hoveredObject = null;
        document.body.style.cursor = 'default';
    }

    if (intersects.length > 0) {
        const newHovered = intersects[0].object;
        if (newHovered !== hoveredObject) {
            hoveredObject = newHovered;
            gsap.to(hoveredObject.scale, { 
                x: 0.7, y: 0.7, z: 0.7,
                duration: 0.3, 
                ease: 'power2.out' 
            });
            document.body.style.cursor = 'pointer';
        }
    }
}

// Click event with GSAP transition
window.addEventListener('click', onClick);

function onClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(Object.values(textModels).map(t => t.mesh), true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        modal.work.style.display = 'none';
        modal.about.style.display = 'none';
        modal.contact.style.display = 'none';

        let targetPage;
        switch (clickedObject.name) {
            case 'projects':
                targetPage = pages.projects;
                break;
            case 'about':
                targetPage = pages.about;
                break;
            case 'contacts':
                targetPage = pages.contacts;
                break;
            default:
                console.log('Clicked unknown model:', clickedObject);
                return;
        }

        gsap.to(pages.landing, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                pages.landing.style.display = 'none';
                targetPage.style.display = 'block';
                gsap.fromTo(targetPage, 
                    { opacity: 0, y: 50 }, 
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                );
            }
        });
    }
}

// Back button functionality
document.querySelectorAll('.back-btn').forEach(button => {
    button.addEventListener('click', () => {
        const currentPage = button.closest('.page');
        gsap.to(currentPage, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                currentPage.style.display = 'none';
                pages.landing.style.display = 'block';
                gsap.fromTo(pages.landing, 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 0.5, ease: 'power2.out' }
                );
            }
        });
    });
});