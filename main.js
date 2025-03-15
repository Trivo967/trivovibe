import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Music Controls
const audio = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
let isMusicPlaying = false; // Start as false since autoplay is blocked

audio.volume = 0.5; // Set initial volume (0 to 1)

// Try to play on load, but expect it to fail due to browser policy
audio.play().catch(error => {
    console.log('Autoplay prevented:', error);
    musicToggle.textContent = '🔇';
    musicToggle.classList.add('off');
});

// Start music on first user interaction (e.g., click anywhere)
document.body.addEventListener('click', () => {
    if (!isMusicPlaying) {
        audio.play().then(() => {
            musicToggle.textContent = '🔊';
            musicToggle.classList.remove('off');
            isMusicPlaying = true;
        }).catch(error => console.log('Music play failed:', error));
    }
}, { once: true }); // Only trigger once

musicToggle.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent triggering the body click listener
    if (isMusicPlaying) {
        audio.pause();
        musicToggle.textContent = '🔇';
        musicToggle.classList.add('off');
    } else {
        audio.play();
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('off');
    }
    isMusicPlaying = !isMusicPlaying;
});

// Loading screen elements
const loadingScreen = document.getElementById('loading-screen');
const monkeyContainer = document.getElementById('monkey-container');

// Create loading screen with 3D monkey
function initLoadingScreen() {
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
    
    if (videoGalleryActive) {
        handleVideoGalleryHover(event);
    }
}

// Click event with GSAP transition
window.addEventListener('click', onClick);

function onClick(event) {
    if (videoGalleryActive) {
        handleVideoGalleryClick(event);
        return;
    }
    
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
                initVideoGallery();
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
        
        if (currentPage.id === 'projects-page') {
            cleanupVideoGallery();
        }
        
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

// ===== 3D Video Gallery Implementation =====
let videoGalleryScene, videoGalleryCamera, videoGalleryRenderer, videoGalleryControls;
let videoObjects = [];
let videoCubes = [];
let currentVideoIndex = 0;
let videoGalleryActive = false;
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
    videoGalleryScene = new THREE.Scene();
    videoGalleryCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    videoGalleryCamera.position.set(0, 0, 15);
    
    videoGalleryRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    videoGalleryRenderer.setSize(window.innerWidth, window.innerHeight);
    videoGalleryRenderer.setClearColor(0x000000, 0);
    container.appendChild(videoGalleryRenderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    videoGalleryScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    videoGalleryScene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0x4cc9f0, 2, 50);
    pointLight1.position.set(10, 5, 5);
    videoGalleryScene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xf72585, 2, 50);
    pointLight2.position.set(-10, -5, 5);
    videoGalleryScene.add(pointLight2);
    
    createVideoThumbnails();
    
    videoGalleryControls = new OrbitControls(videoGalleryCamera, videoGalleryRenderer.domElement);
    videoGalleryControls.enableDamping = true;
    videoGalleryControls.dampingFactor = 0.05;
    videoGalleryControls.maxDistance = 25;
    videoGalleryControls.minDistance = 8;
    
    document.getElementById('prev-video').addEventListener('click', showPreviousVideo);
    document.getElementById('next-video').addEventListener('click', showNextVideo);
    document.getElementById('video-player-close').addEventListener('click', closeVideoPlayer);
    
    animateVideoGallery();
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

function closeVideoPlayer() {
    const playerContainer = document.getElementById('video-player-container');
    const player = document.getElementById('video-player');
    
    player.innerHTML = '';
    playerContainer.style.display = 'none';
}

function showNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videoObjects.length;
    highlightCurrentVideo();
    rotateToCurrentVideo();
}

function showPreviousVideo() {
    currentVideoIndex = (currentVideoIndex - 1 + videoObjects.length) % videoObjects.length;
    highlightCurrentVideo();
    rotateToCurrentVideo();
}

function rotateToCurrentVideo() {
    const currentVideo = videoObjects[currentVideoIndex];
    const targetPosition = new THREE.Vector3().copy(currentVideo.position).normalize().multiplyScalar(20);
    
    gsap.to(videoGalleryCamera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => {
            videoGalleryCamera.lookAt(0, 0, 0);
        }
    });
}

function cleanupVideoGallery() {
    if (!videoGalleryActive) return;
    
    videoGalleryActive = false;
    
    document.getElementById('prev-video').removeEventListener('click', showPreviousVideo);
    document.getElementById('next-video').removeEventListener('click', showNextVideo);
    document.getElementById('video-player-close').removeEventListener('click', closeVideoPlayer);
    
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