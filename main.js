import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Ensure GSAP is available globally from the HTML script tag
const gsap = window.gsap;

// Music Controls
const audio = document.getElementById('background-music') || console.error('Audio element not found');
const musicToggle = document.getElementById('music-toggle') || console.error('Music toggle not found');
let isMusicPlaying = false;

if (audio) {
    audio.volume = 0.5;
    audio.play().catch(error => {
        console.log('Autoplay prevented:', error);
        if (musicToggle) {
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('off');
        }
    });
}

document.body.addEventListener('click', () => {
    if (!isMusicPlaying && audio) {
        audio.play().then(() => {
            if (musicToggle) {
                musicToggle.textContent = '🔊';
                musicToggle.classList.remove('off');
            }
            isMusicPlaying = true;
        }).catch(error => console.log('Music play failed:', error));
    }
}, { once: true });

if (musicToggle) {
    musicToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (isMusicPlaying && audio) {
            audio.pause();
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('off');
        } else if (audio) {
            audio.play();
            musicToggle.textContent = '🔊';
            musicToggle.classList.remove('off');
        }
        isMusicPlaying = !isMusicPlaying;
    });
}

// Loading screen elements
const loadingScreen = document.getElementById('loading-screen');
const monkeyContainer = document.getElementById('monkey-container');

function initLoadingScreen() {
    if (!monkeyContainer || !loadingScreen) {
        console.error('Loading screen elements not found');
        return;
    }

    const loadingScene = new THREE.Scene();
    const loadingCamera = new THREE.PerspectiveCamera(75, 200 / 200, 0.1, 1000);
    loadingCamera.position.z = 5;
    
    const loadingRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    loadingRenderer.setSize(200, 200);
    loadingRenderer.setClearColor(0x000000, 0);
    monkeyContainer.appendChild(loadingRenderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    loadingScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    loadingScene.add(directionalLight);
    
    const monkeyGeometry = new THREE.SphereGeometry(1, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const faceMaterial = new THREE.MeshPhongMaterial({ color: 0xE3B094 });
    
    const monkeyBody = new THREE.Mesh(monkeyGeometry, bodyMaterial);
    loadingScene.add(monkeyBody);
    
    const monkeyFace = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), faceMaterial);
    monkeyFace.position.z = 0.7;
    monkeyBody.add(monkeyFace);
    
    const earGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(-0.7, 0.7, 0);
    monkeyBody.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.position.set(0.7, 0.7, 0);
    monkeyBody.add(rightEar);
    
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.2, 0.6);
    monkeyFace.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.2, 0.6);
    monkeyFace.add(rightEye);
    
    const noseGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0, 0.6);
    monkeyFace.add(nose);
    
    const mouthGeometry = new THREE.TorusGeometry(0.2, 0.05, 16, 16, Math.PI);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.2, 0.6);
    mouth.rotation.x = Math.PI / 2;
    monkeyFace.add(mouth);
    
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-1, 0, 0);
    leftArm.rotation.z = Math.PI / 2;
    monkeyBody.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(1, 0, 0);
    rightArm.rotation.z = -Math.PI / 2;
    monkeyBody.add(rightArm);
    
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.5, -1, 0);
    monkeyBody.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.5, -1, 0);
    monkeyBody.add(rightLeg);
    
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5, 16);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, -0.5, -1);
    tail.rotation.x = Math.PI / 2;
    monkeyBody.add(tail);
    
    let jumpDirection = 1;
    let jumpHeight = 0;
    
    function animateLoading() {
        jumpHeight += 0.1 * jumpDirection;
        if (jumpHeight > 1) jumpDirection = -1;
        else if (jumpHeight < 0) jumpDirection = 1;
        
        monkeyBody.position.y = jumpHeight;
        monkeyBody.rotation.y += 0.05;
        
        loadingRenderer.render(loadingScene, loadingCamera);
    }
    
    const loadingAnimation = setInterval(animateLoading, 16);
    
    setTimeout(() => {
        clearInterval(loadingAnimation);
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                loadingScreen.style.display = 'none';
            }
        });
    }, 3000);
}

initLoadingScreen();

// Main scene setup
const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas") || console.error('Canvas not found');
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
    './model/test15.glb',
    (glb) => {
        model = glb.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.scale.set(100, 100, 100);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; // Enable shadow casting for all meshes
                child.receiveShadow = false; // Meshes don’t need to receive shadows unless desired
                if (child.name === 'projects' || child.name === 'contacts' || child.name === 'about') {
                    textModels[child.name] = { mesh: child };
                    child.scale.set(0.5, 0.5, 0.5);
                }
            }
        });

        scene.add(model);
        console.log('test15.glb loaded:', model);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading test15.glb:', error);
    }
);

// Background Plane (Solid surface for shadows)
const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1); // Reduced segments for solid plane
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    side: THREE.DoubleSide,
    roughness: 0.8, // Adds some realism to the surface
    metalness: 0.2
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -50;
plane.receiveShadow = true; // Plane receives shadows
plane.castShadow = false; // Plane doesn’t cast shadows
scene.add(plane);

// Sunlight setup
const sunlight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
sunlight.position.set(0, 100, 50);
scene.add(sunlight);

const sunShadowLight = new THREE.DirectionalLight(0xffffff, 3); // Increased intensity for stronger shadows
sunShadowLight.position.set(50, 200, 50); // Moved higher for broader coverage
sunShadowLight.castShadow = true;
sunShadowLight.shadow.mapSize.width = 2048; // High resolution for crisp shadows
sunShadowLight.shadow.mapSize.height = 2048;
sunShadowLight.shadow.camera.near = 0.1;
sunShadowLight.shadow.camera.far = 1000; // Covers the scene depth
sunShadowLight.shadow.camera.left = -500; // Covers the scaled model and plane
sunShadowLight.shadow.camera.right = 500;
sunShadowLight.shadow.camera.top = 500;
sunShadowLight.shadow.camera.bottom = -500;
sunShadowLight.shadow.bias = -0.0001; // Reduces shadow artifacts
scene.add(sunShadowLight);

// Camera (Perspective)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 10000);

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
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows for natural look
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Declare video/photo/contact gallery variables upfront
let videoGalleryActive = false;
let videoGalleryScene = null;
let videoGalleryCamera = null;
let photoGalleryCamera = null;
let contactGalleryCamera = null;

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

    if (videoGalleryActive && videoGalleryScene) {
        updateVideoGallery();
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
    
    if (videoGalleryCamera) {
        videoGalleryCamera.aspect = sizes.width / sizes.height;
        videoGalleryCamera.updateProjectionMatrix();
        videoGalleryRenderer.setSize(sizes.width, sizes.height);
    }
    if (photoGalleryCamera) {
        photoGalleryCamera.aspect = sizes.width / sizes.height;
        photoGalleryCamera.updateProjectionMatrix();
        photoGalleryRenderer.setSize(sizes.width, sizes.height);
    }
    if (contactGalleryCamera) {
        contactGalleryCamera.aspect = sizes.width / sizes.height;
        contactGalleryCamera.updateProjectionMatrix();
        contactGalleryRenderer.setSize(sizes.width, sizes.height);
    }
}
window.addEventListener('resize', handleResize);

// Hover event
window.addEventListener('mousemove', onMouseMove);

let photoGalleryRaycaster = new THREE.Raycaster();
let photoGalleryPointer = new THREE.Vector2();
let contactRaycaster = new THREE.Raycaster();
let contactPointer = new THREE.Vector2();
let hoveredPhoto = null;
let hoveredContact = null;

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
    
    if (videoGalleryActive) {
        handleVideoGalleryHover(event);
    }
    
    if (pages.about && pages.about.style.display === 'block') {
        handleAboutGalleryHover(event);
    }
    
    if (pages.contacts && pages.contacts.style.display === 'block') {
        handleContactGalleryHover(event);
    }
}

function handleAboutGalleryHover(event) {
    photoGalleryPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    photoGalleryPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    photoGalleryRaycaster.setFromCamera(photoGalleryPointer, photoGalleryCamera);
    const intersects = photoGalleryRaycaster.intersectObjects(photoObjects, true);
    
    if (hoveredPhoto && (!intersects.length || intersects[0].object.parent !== hoveredPhoto)) {
        gsap.to(hoveredPhoto.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        hoveredPhoto = null;
        document.body.style.cursor = 'default';
    }
    
    if (intersects.length > 0) {
        const newHovered = intersects[0].object.parent;
        if (newHovered !== hoveredPhoto && !newHovered.userData.expanded) {
            hoveredPhoto = newHovered;
            gsap.to(hoveredPhoto.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
            document.body.style.cursor = 'pointer';
        }
    }
}

// Click event with GSAP transition
window.addEventListener('click', (event) => {
    if (videoGalleryActive) {
        handleVideoGalleryClick(event);
    } else if (pages.about && pages.about.style.display === 'block') {
        handleAboutGalleryClick(event);
    } else if (pages.contacts && pages.contacts.style.display === 'block') {
        handleContactGalleryClick(event);
    } else {
        onClick(event);
    }
});

function onClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(Object.values(textModels).map(t => t.mesh), true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if (modal.work) modal.work.style.display = 'none';
        if (modal.about) modal.about.style.display = 'none';
        if (modal.contact) modal.contact.style.display = 'none';

        let targetPage;
        switch (clickedObject.name) {
            case 'projects':
                targetPage = pages.projects;
                initVideoGallery();
                break;
            case 'about':
                targetPage = pages.about;
                initAboutGallery();
                break;
            case 'contacts':
                targetPage = pages.contacts;
                initContactGallery();
                break;
            default:
                console.log('Clicked unknown model:', clickedObject);
                return;
        }

        if (pages.landing && targetPage) {
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
}

// Back button functionality
document.querySelectorAll('.back-btn').forEach(button => {
    button.addEventListener('click', () => {
        const currentPage = button.closest('.page');
        
        if (currentPage) {
            if (currentPage.id === 'projects-page') {
                cleanupVideoGallery();
            } else if (currentPage.id === 'about-page') {
                cleanupAboutGallery();
            } else if (currentPage.id === 'contacts-page') {
                cleanupContactGallery();
            }
            
            gsap.to(currentPage, {
                opacity: 0,
                y: 50,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => {
                    currentPage.style.display = 'none';
                    if (pages.landing) {
                        pages.landing.style.display = 'block';
                        gsap.fromTo(pages.landing, 
                            { opacity: 0 }, 
                            { opacity: 1, duration: 0.5, ease: 'power2.out' }
                        );
                    }
                }
            });
        }
    });
});

// ===== 3D Video Gallery Implementation =====
let videoGalleryRenderer, videoGalleryControls;
let videoObjects = [];
let videoCubes = [];
let currentVideoIndex = 0;
let videoGalleryRaycaster = new THREE.Raycaster();
let videoGalleryPointer = new THREE.Vector2();
let hoveredVideo = null;

const videoData = [
    { id: "22NTSj3yMgc", title: "Animation 1" },
    { id: "i8TJAKnyy7w", title: "Animation 2" },
    { id: "LaEhIA6vprw", title: "Animation 3" },
    { id: "-HN4EBvRV3g", title: "Animation 4" },
    { id: "Wg7hCVhKBAw", title: "Animation 5" },
    { id: "_QlIdAuV-po", title: "Animation 6" },
    { id: "GyWp6Xx-djE", title: "Animation 7" }
];

function initVideoGallery() {
    if (videoGalleryActive) return;
    
    videoGalleryActive = true;
    
    const container = document.getElementById('projects-3d-container');
    if (!container) {
        console.error('Projects 3D container not found');
        return;
    }
    
    videoGalleryScene = new THREE.Scene();
    videoGalleryCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    videoGalleryCamera.position.set(0, 0, 15);
    
    videoGalleryRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    videoGalleryRenderer.setSize(window.innerWidth, window.innerHeight);
    videoGalleryRenderer.setClearColor(0x000000, 0);
    container.appendChild(videoGalleryRenderer.domElement);
    
    const gallerySunlight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    gallerySunlight.position.set(0, 100, 50);
    videoGalleryScene.add(gallerySunlight);
    
    const galleryShadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    galleryShadowLight.position.set(50, 100, 50);
    galleryShadowLight.castShadow = true;
    videoGalleryScene.add(galleryShadowLight);
    
    createVideoThumbnails();
    
    videoGalleryControls = new OrbitControls(videoGalleryCamera, videoGalleryRenderer.domElement);
    videoGalleryControls.enableDamping = true;
    videoGalleryControls.dampingFactor = 0.05;
    videoGalleryControls.maxDistance = 25;
    videoGalleryControls.minDistance = 8;
    
    const closeBtn = document.getElementById('video-player-close');
    if (closeBtn) closeBtn.addEventListener('click', closeVideoPlayer);
    
    animateVideoGallery();
    animateProjectPage();
}

function createVideoThumbnails() {
    videoObjects.forEach(obj => videoGalleryScene.remove(obj));
    videoObjects = [];
    videoCubes = [];
    
    const radius = 10;
    const totalVideos = videoData.length;
    
    videoData.forEach((video, index) => {
        const videoGroup = new THREE.Group();
        const thumbnailTexture = new THREE.TextureLoader().load(`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`);
        const cubeMaterial = new THREE.MeshBasicMaterial({ map: thumbnailTexture, side: THREE.FrontSide });
        const materials = [cubeMaterial, cubeMaterial, cubeMaterial, cubeMaterial, cubeMaterial, cubeMaterial];
        
        const cubeSize = 2.5;
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cube = new THREE.Mesh(cubeGeometry, materials);
        
        videoGroup.add(cube);
        
        const angle = (index / totalVideos) * Math.PI * 2;
        videoGroup.position.x = radius * Math.cos(angle);
        videoGroup.position.y = radius * Math.sin(angle) * 0.3;
        videoGroup.position.z = radius * Math.sin(angle) * 0.8;
        
        videoGroup.lookAt(0, 0, 0);
        
        videoGroup.userData = { videoId: video.id, index: index };
        cube.userData = { videoId: video.id, index: index };
        
        videoGalleryScene.add(videoGroup);
        videoObjects.push(videoGroup);
        videoCubes.push(cube);
    });
    
    highlightCurrentVideo();
}

function animateProjectPage() {
    const header = document.querySelector('.project-header');
    const cubes = videoObjects;

    if (header) {
        gsap.fromTo(header, 
            { opacity: 0, y: -50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        );
    }

    cubes.forEach((cube, index) => {
        gsap.fromTo(cube.position,
            { y: -20 },
            { 
                y: cube.position.y,
                duration: 1.5,
                delay: 0.5 + (index * 0.1),
                ease: 'bounce.out'
            }
        );
    });
}

function updateVideoGallery() {
    if (!videoGalleryActive) return;
    
    videoCubes.forEach((cube, index) => {
        cube.rotation.y += 0.005;
        cube.rotation.x += 0.002;
        const group = videoObjects[index];
        group.position.y += Math.sin(clock.getElapsedTime() * 2 + index) * 0.005;
    });
    
    videoGalleryControls.update();
    videoGalleryRenderer.render(videoGalleryScene, videoGalleryCamera);
}

function animateVideoGallery() {
    if (!videoGalleryActive) return;
    
    updateVideoGallery();
    requestAnimationFrame(animateVideoGallery);
}

function handleVideoGalleryHover(event) {
    videoGalleryPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    videoGalleryPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    videoGalleryRaycaster.setFromCamera(videoGalleryPointer, videoGalleryCamera);
    const intersects = videoGalleryRaycaster.intersectObjects(videoObjects, true);
    
    if (hoveredVideo && (!intersects.length || !isChildOfObject(intersects[0].object, hoveredVideo))) {
        if (hoveredVideo.userData.index !== currentVideoIndex) {
            gsap.to(hoveredVideo.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        }
        hoveredVideo = null;
        document.body.style.cursor = 'default';
    }
    
    if (intersects.length > 0) {
        let targetObject = intersects[0].object;
        while (targetObject && !targetObject.userData.videoId) {
            targetObject = targetObject.parent;
        }
        
        if (targetObject && targetObject !== hoveredVideo) {
            hoveredVideo = targetObject;
            if (hoveredVideo.userData.index !== currentVideoIndex) {
                gsap.to(hoveredVideo.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
            }
            document.body.style.cursor = 'pointer';
        }
    }
}

function isChildOfObject(child, parent) {
    let current = child;
    while (current) {
        if (current === parent) return true;
        current = current.parent;
    }
    return false;
}

function handleVideoGalleryClick(event) {
    videoGalleryPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    videoGalleryPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    videoGalleryRaycaster.setFromCamera(videoGalleryPointer, videoGalleryCamera);
    const intersects = videoGalleryRaycaster.intersectObjects(videoObjects, true);
    
    if (intersects.length > 0) {
        let targetObject = intersects[0].object;
        while (targetObject && !targetObject.userData.videoId) {
            targetObject = targetObject.parent;
        }
        
        if (targetObject) {
            const videoId = targetObject.userData.videoId;
            currentVideoIndex = targetObject.userData.index;
            highlightCurrentVideo();
            playVideo(videoId);
        }
    }
}

function highlightCurrentVideo() {
    videoObjects.forEach((obj, index) => {
        if (index === currentVideoIndex) {
            gsap.to(obj.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.5 });
            gsap.to(obj.position, { z: obj.position.z + 1, duration: 0.5 });
            gsap.to(videoCubes[index].material[0], { emissiveIntensity: 0.5, duration: 0.5 });
        } else {
            gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
            gsap.to(obj.position, { z: videoObjects[index].position.z - (index === currentVideoIndex ? 1 : 0), duration: 0.5 });
            gsap.to(videoCubes[index].material[0], { emissiveIntensity: 0, duration: 0.5 });
        }
    });
}

function playVideo(videoId) {
    const playerContainer = document.getElementById('video-player-container');
    const player = document.getElementById('video-player');
    
    if (playerContainer && player) {
        player.innerHTML = `
            <iframe width="100%" height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
        playerContainer.style.display = 'flex';
    }
}

function closeVideoPlayer() {
    const playerContainer = document.getElementById('video-player-container');
    const player = document.getElementById('video-player');
    
    if (playerContainer && player) {
        player.innerHTML = '';
        playerContainer.style.display = 'none';
    }
}

function cleanupVideoGallery() {
    if (!videoGalleryActive) return;
    
    videoGalleryActive = false;
    
    const closeBtn = document.getElementById('video-player-close');
    if (closeBtn) closeBtn.removeEventListener('click', closeVideoPlayer);
    
    closeVideoPlayer();
    
    const container = document.getElementById('projects-3d-container');
    if (container && videoGalleryRenderer) {
        container.removeChild(videoGalleryRenderer.domElement);
    }
    
    videoObjects.forEach(obj => {
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (mat.map) mat.map.dispose();
                        mat.dispose();
                    });
                } else {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            }
        });
    });
    
    videoObjects = [];
    videoCubes = [];
    videoGalleryScene = null;
    videoGalleryCamera = null;
    videoGalleryRenderer = null;
    videoGalleryControls = null;
}

// ===== 3D Photo Gallery Implementation =====
let photoGalleryScene, photoGalleryRenderer, photoGalleryControls;
let photoObjects = [];
let expandedPhoto = null;

function initAboutGallery() {
    const container = document.getElementById('about-3d-container');
    if (!container) {
        console.error('About 3D container not found');
        return;
    }
    
    photoGalleryScene = new THREE.Scene();
    photoGalleryCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    photoGalleryCamera.position.set(0, 0, 15);
    
    photoGalleryRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    photoGalleryRenderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(photoGalleryRenderer.domElement);
    
    const photoSunlight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    photoSunlight.position.set(0, 100, 50);
    photoGalleryScene.add(photoSunlight);
    
    const photoShadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    photoShadowLight.position.set(50, 100, 50);
    photoShadowLight.castShadow = true;
    photoGalleryScene.add(photoShadowLight);
    
    createPhotoGallery();
    
    photoGalleryControls = new OrbitControls(photoGalleryCamera, photoGalleryRenderer.domElement);
    photoGalleryControls.enableDamping = true;
    photoGalleryControls.dampingFactor = 0.05;
    
    animateAboutGallery();
}

function createPhotoGallery() {
    const photoData = [
        { id: 'photo1', src: './images/1.jpg', desc: 'This is me 90% of the time, currently' },
        { id: 'photo2', src: './images/2.jpg', desc: 'This picture captured my attention, I dont know why' },
        { id: 'photo4', src: './images/4.jpg', desc: 'Gotta post this so the bros know I listen to Joe Rogan' },
        { id: 'photo6', src: './images/6.jpg', desc: 'I walked along this river walk for 2 hours, it was magical!' },
        { id: 'photo7', src: './images/7.jpg', desc: 'coffee makes me smile' },
        { id: 'photo9', src: './images/9.jpg', desc: 'I stayed here and did nothing for 2 days, meditation mode activate.' },
        { id: 'photo10', src: './images/10.jpg', desc: 'Morning ocean sunrise, this makes me feel sucessful somehow.' },
        { id: 'photo11', src: './images/11.jpg', desc: 'The inside is boring, but the outside is BRUTAL!' },
    ];
    
    const radius = 8;
    photoData.forEach((photo, index) => {
        const photoGroup = new THREE.Group();
        const texture = new THREE.TextureLoader().load(
            photo.src,
            () => console.log(`Loaded ${photo.src}`),
            undefined,
            (err) => console.error(`Error loading ${photo.src}:`, err)
        );
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const geometry = new THREE.PlaneGeometry(2, 2);
        const photoMesh = new THREE.Mesh(geometry, material);
        
        photoGroup.add(photoMesh);
        
        const angle = (index / photoData.length) * Math.PI * 2;
        const targetX = radius * Math.cos(angle);
        const targetY = radius * Math.sin(angle) * 0.3;
        const targetZ = radius * Math.sin(angle) * 0.8;
        
        photoGroup.position.set(targetX, targetY, targetZ);
        photoGroup.lookAt(0, 0, 0);
        photoGroup.userData = { 
            id: photo.id, 
            desc: photo.desc, 
            index: index, 
            originalPosition: new THREE.Vector3(targetX, targetY, targetZ), 
            src: photo.src 
        };
        
        photoMesh.material.opacity = 0;
        photoMesh.material.transparent = true;
        photoGalleryScene.add(photoGroup);
        photoObjects.push(photoGroup);
        
        gsap.to(photoMesh.material, {
            opacity: 1,
            duration: 1,
            delay: index * 0.2,
            ease: 'power1.inOut'
        });
    });
}

function animateAboutGallery() {
    photoObjects.forEach((photo, index) => {
        if (!photo.userData.expanded) {
            photo.position.y += Math.sin(clock.getElapsedTime() * 2 + index) * 0.005;
            photo.rotation.y += 0.002;
        }
    });
    
    photoGalleryControls.update();
    photoGalleryRenderer.render(photoGalleryScene, photoGalleryCamera);
    requestAnimationFrame(animateAboutGallery);
}

function handleAboutGalleryClick(event) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, photoGalleryCamera);
    const intersects = raycaster.intersectObjects(photoObjects, true);
    
    if (intersects.length > 0) {
        const target = intersects[0].object.parent;
        
        if (expandedPhoto === target) {
            closeExpandedPhoto();
        } else {
            if (expandedPhoto) {
                closeExpandedPhoto(() => expandPhoto(target));
            } else {
                expandPhoto(target);
            }
        }
    } else if (expandedPhoto) {
        closeExpandedPhoto();
    }
}

function expandPhoto(photo) {
    expandedPhoto = photo;
    photo.userData.expanded = true;
    
    gsap.to(photo.children[0].material, {
        opacity: 0,
        duration: 0.5,
        ease: 'power1.inOut',
        onComplete: () => photo.visible = false
    });
    
    const imgElement = document.createElement('img');
    imgElement.src = photo.userData.src;
    imgElement.className = 'expanded-image';
    pages.about.appendChild(imgElement);
    
    gsap.fromTo(imgElement, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.5, ease: 'power1.inOut' }
    );
    
    const desc = document.createElement('div');
    desc.className = 'photo-description';
    desc.textContent = photo.userData.desc;
    pages.about.appendChild(desc);
    
    gsap.fromTo(desc, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.5, ease: 'power1.inOut', delay: 0.2 }
    );
    
    const closeBtn = document.createElement('div');
    closeBtn.className = 'photo-close-btn';
    closeBtn.textContent = '×';
    closeBtn.onclick = closeExpandedPhoto;
    pages.about.appendChild(closeBtn);
    
    gsap.from(closeBtn, { opacity: 0, duration: 0.5, ease: 'power1.inOut', delay: 0.3 });
}

function closeExpandedPhoto(callback) {
    if (!expandedPhoto) return;
    
    const imgElement = document.querySelector('.expanded-image');
    const desc = document.querySelector('.photo-description');
    const closeBtn = document.querySelector('.photo-close-btn');
    
    gsap.to(imgElement, { 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power1.inOut', 
        onComplete: () => imgElement.remove() 
    });
    
    gsap.to(desc, { 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power1.inOut', 
        onComplete: () => desc.remove() 
    });
    
    gsap.to(closeBtn, { 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power1.inOut', 
        onComplete: () => {
            closeBtn.remove();
            expandedPhoto.visible = true;
            expandedPhoto.children[0].material.opacity = 0;
            expandedPhoto.children[0].material.transparent = true;
            gsap.to(expandedPhoto.children[0].material, {
                opacity: 1,
                duration: 0.5,
                ease: 'power1.inOut'
            });
            
            const tempExpanded = expandedPhoto;
            expandedPhoto = null;
            tempExpanded.userData.expanded = false;
            
            if (callback) callback();
        }
    });
}

function cleanupAboutGallery() {
    const container = document.getElementById('about-3d-container');
    if (container && photoGalleryRenderer) {
        container.removeChild(photoGalleryRenderer.domElement);
    }
    
    const expandedImg = document.querySelector('.expanded-image');
    if (expandedImg) expandedImg.remove();
    const desc = document.querySelector('.photo-description');
    if (desc) desc.remove();
    const closeBtn = document.querySelector('.photo-close-btn');
    if (closeBtn) closeBtn.remove();
    
    photoObjects.forEach(obj => {
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
    });
    
    photoObjects = [];
    photoGalleryScene = null;
    photoGalleryCamera = null;
    photoGalleryRenderer = null;
    photoGalleryControls = null;
}

// ===== 3D Contact Page Implementation =====
let contactGalleryScene, contactGalleryRenderer, contactGalleryControls;
let contactObjects = [];

const contactData = [
    { 
        id: 'email', 
        src: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
        url: 'mailto:vothanhtri2204@gmail.com', 
        label: 'Email' 
    },
    { 
        id: 'linkedin', 
        src: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
        url: 'https://www.linkedin.com/in/trithanhvo967', 
        label: 'LinkedIn' 
    },
    { 
        id: 'instagram', 
        src: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
        url: 'https://www.instagram.com/trivovibes', 
        label: 'Instagram' 
    }
];

function initContactGallery() {
    const container = document.getElementById('contacts-3d-container');
    if (!container) {
        console.error('Contacts 3D container not found');
        return;
    }
    
    contactGalleryScene = new THREE.Scene();
    contactGalleryCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    contactGalleryCamera.position.set(0, 0, 10);
    
    contactGalleryRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    contactGalleryRenderer.setSize(window.innerWidth, window.innerHeight);
    contactGalleryRenderer.setClearColor(0x000000, 0);
    container.appendChild(contactGalleryRenderer.domElement);
    
    const contactSunlight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    contactSunlight.position.set(0, 100, 50);
    contactGalleryScene.add(contactSunlight);
    
    const contactShadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
    contactShadowLight.position.set(50, 100, 50);
    contactShadowLight.castShadow = true;
    contactGalleryScene.add(contactShadowLight);
    
    createContactIcons();
    
    contactGalleryControls = new OrbitControls(contactGalleryCamera, contactGalleryRenderer.domElement);
    contactGalleryControls.enableDamping = true;
    contactGalleryControls.dampingFactor = 0.05;
    contactGalleryControls.maxDistance = 20;
    contactGalleryControls.minDistance = 5;
    
    animateContactGallery();
}

function createContactIcons() {
    const radius = 5;
    contactData.forEach((contact, index) => {
        const contactGroup = new THREE.Group();
        const texture = new THREE.TextureLoader().load(
            contact.src,
            () => console.log(`Loaded ${contact.src}`),
            undefined,
            (err) => console.error(`Error loading ${contact.src}:`, err)
        );
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const geometry = new THREE.PlaneGeometry(2, 2);
        const iconMesh = new THREE.Mesh(geometry, material);
        
        contactGroup.add(iconMesh);
        
        const angle = (index / contactData.length) * Math.PI * 2;
        const targetX = radius * Math.cos(angle);
        const targetY = radius * Math.sin(angle) * 0.3;
        const targetZ = radius * Math.sin(angle) * 0.8;
        
        contactGroup.position.set(targetX, targetY, targetZ);
        contactGroup.lookAt(0, 0, 0);
        contactGroup.userData = { 
            id: contact.id, 
            url: contact.url, 
            label: contact.label,
            originalPosition: new THREE.Vector3(targetX, targetY, targetZ)
        };
        
        iconMesh.material.opacity = 0;
        contactGalleryScene.add(contactGroup);
        contactObjects.push(contactGroup);
        
        gsap.to(iconMesh.material, {
            opacity: 1,
            duration: 1,
            delay: index * 0.2,
            ease: 'power1.inOut'
        });
    });
}

function animateContactGallery() {
    contactObjects.forEach((contact, index) => {
        contact.rotation.y += 0.02;
        contact.position.y += Math.sin(clock.getElapsedTime() * 2 + index) * 0.005;
    });
    
    contactGalleryControls.update();
    contactGalleryRenderer.render(contactGalleryScene, contactGalleryCamera);
    requestAnimationFrame(animateContactGallery);
}

function handleContactGalleryHover(event) {
    contactPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    contactPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    contactRaycaster.setFromCamera(contactPointer, contactGalleryCamera);
    const intersects = contactRaycaster.intersectObjects(contactObjects, true);
    
    if (hoveredContact && (!intersects.length || intersects[0].object.parent !== hoveredContact)) {
        gsap.to(hoveredContact.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        const label = document.getElementById(`label-${hoveredContact.userData.id}`);
        if (label) label.style.opacity = '0';
        hoveredContact = null;
        document.body.style.cursor = 'default';
    }
    
    if (intersects.length > 0) {
        const newHovered = intersects[0].object.parent;
        if (newHovered !== hoveredContact) {
            hoveredContact = newHovered;
            gsap.to(hoveredContact.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.3 });
            document.body.style.cursor = 'pointer';
            
            let label = document.getElementById(`label-${hoveredContact.userData.id}`);
            if (!label) {
                label = document.createElement('div');
                label.id = `label-${hoveredContact.userData.id}`;
                label.className = 'contact-icon-label';
                label.textContent = hoveredContact.userData.label;
                document.getElementById('contacts-page').appendChild(label);
            }
            
            const rect = contactGalleryRenderer.domElement.getBoundingClientRect();
            const vector = new THREE.Vector3();
            hoveredContact.getWorldPosition(vector);
            vector.project(contactGalleryCamera);
            const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
            const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            label.style.opacity = '1';
        }
    }
}

function handleContactGalleryClick(event) {
    contactPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    contactPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    contactRaycaster.setFromCamera(contactPointer, contactGalleryCamera);
    const intersects = contactRaycaster.intersectObjects(contactObjects, true);
    
    if (intersects.length > 0) {
        const target = intersects[0].object.parent;
        window.open(target.userData.url, '_blank');
    }
}

function cleanupContactGallery() {
    const container = document.getElementById('contacts-3d-container');
    if (container && contactGalleryRenderer) {
        container.removeChild(contactGalleryRenderer.domElement);
    }
    
    contactObjects.forEach(obj => {
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
    });
    
    document.querySelectorAll('.contact-icon-label').forEach(label => label.remove());
    
    contactObjects = [];
    contactGalleryScene = null;
    contactGalleryCamera = null;
    contactGalleryRenderer = null;
    contactGalleryControls = null;
}

// Chatbox Functionality
const chatboxContainer = document.getElementById('chatbox-container');
const chatboxToggle = document.getElementById('chatbox-toggle');
const chatboxMessages = document.getElementById('chatbox-messages');
const chatboxInputText = document.getElementById('chatbox-input-text');
const chatboxSend = document.getElementById('chatbox-send');

// Toggle chatbox minimize/maximize
chatboxToggle.addEventListener('click', () => {
    chatboxContainer.classList.toggle('minimized');
    chatboxToggle.textContent = chatboxContainer.classList.contains('minimized') ? '+' : '−';
});

// Send message and get response
chatboxSend.addEventListener('click', sendMessage);
chatboxInputText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const messageText = chatboxInputText.value.trim();
    if (!messageText) return;

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.textContent = messageText;
    chatboxMessages.appendChild(userMessage);

    // Clear input
    chatboxInputText.value = '';

    // Scroll to bottom
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

    // Simulate bot response (placeholder)
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        botMessage.textContent = getBotResponse(messageText);
        chatboxMessages.appendChild(botMessage);

        // Scroll to bottom
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }, 500);
}

// Placeholder for bot responses (replace with actual AI logic)
function getBotResponse(message) {
    message = message.toLowerCase();
    if (message.includes('who are you') || message.includes('about tri')) {
        return "I'm TriBot, here to tell you about Tri! He's a 3D tinkerer who loves making stuff move and look cool with tools like Blender, Maya, and Unreal Engine 5.";
    } else if (message.includes('projects') || message.includes('work')) {
        return "Tri has some cool animations in the Projects section—check them out! He's all about turning wild ideas into reality.";
    } else if (message.includes('contact') || message.includes('reach out')) {
        return "You can reach Tri via email, LinkedIn, or Instagram. Links are in the Contacts section!";
    } else if (message.includes('skills') || message.includes('tools')) {
        return "Tri works with Blender, Maya, and Unreal Engine 5, focusing on modeling, texturing, rigging, and animation. He's a creative experimenter!";
    } else {
        return "Hmm, not sure about that one. Ask me anything about Tri, his projects, or skills!";
    }
}