import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OBJLoader } from 'https://cdn.skypack.dev/three@v0.128.0/examples/jsm/loaders/OBJLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio (window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);




let piece; 

function addPiece() {

    // generate a random number to choose which piece model to render
    let pieceNumber = Math.floor(Math.random() * 5) + 1;
    console.log(pieceNumber);

    let modelPath = "";

    switch(pieceNumber) {
        case 1:
            modelPath = "/models/pawn_model.obj";
            break;

        case 2:
            modelPath = "/models/bishop_model.obj";
            break;
        
        case 3:
            modelPath = "/models/knight_model.obj";
            break;

        case 4:
            modelPath = "/models/king_model.obj";
            break;

        case 5:
            modelPath = "/models/queen_model.obj";
            break;
    }

    // load the model
    const loader = new OBJLoader;
    loader.load(modelPath, (object) => {

        const pieceMaterial = new THREE.MeshStandardMaterial({color: 0x66FCF1, wireframe: true});

        // set the mesh's material to a blue wireframe
        object.children[0].material = pieceMaterial;

        piece = object;

        piece.rotation.set(.3, 0, 0.3);

        // rasie the piece up a bit if its a king or queen due to their height, and bring all pieces towards the camera a bit
        if (pieceNumber == 4 || pieceNumber == 5) {
            piece.position.set(0, 1.5, 20);
        } else {
            piece.position.set(0, 0, 20);
        }

        scene.add(piece);
    });
}

addPiece();


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

// ================================== STARS =========================

var stars = [];

function addStar() {
    for (let z = -1000; z < 1000; z+= 20) {
        // create the star
        let starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        var starMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff } );
        var star = new THREE.Mesh(starGeometry, starMaterial);

        // give the star a random x and y position, and set z based on the star's index
        star.position.x = Math.random() * 1000 - 500;
		star.position.y = Math.random() * 1000 - 500;
        star.position.z = z;

        star.scale.x = star.scale.y = 2;

        stars.push(star);
        scene.add(star); 
    }
}

addStar();

// =============================== ANIMATE =========================

function animate() {
    requestAnimationFrame(animate);

    // rotate the main chess piece
    if (piece != null) {
        piece.rotation.y += 0.01;
    }

    // move stars towards camera
    if (stars != null) {
        for(var i = 0; i < stars.length; i++) {
			
            let star = stars[i]; 
                    
            // move the star forward dependent on the mouseY position. 
            star.position.z +=  i/10;
                    
            // if the star is too close move it to the back
            if(star.position.z > 1000) {
                star.position.z-=2000; 
            }       
        }
    }

    renderer.render(scene, camera);
}

animate();