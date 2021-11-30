import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio (window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);

// basic material which doesn't require, and isn't affected by light
//const material = new THREE.MeshBasicMaterial({color: 0xFF6347, wireframe: true});

// advanced material that requires lighting
const material = new THREE.MeshStandardMaterial({color: 0xFF6347, wireframe: true});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);


const planeGemoetry = new THREE.PlaneGeometry(300, 200, 100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0xffffff, wireframe: true});
const plane = new THREE.Mesh(planeGemoetry, planeMaterial);
plane.position.set(0, 10, -20);
plane.rotation.set(-.7, 0, 0);
//scene.add(plane);


const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

// lights everything
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);


function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.01;

    renderer.render(scene, camera);
}

animate();