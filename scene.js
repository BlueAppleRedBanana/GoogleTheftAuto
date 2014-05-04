// Set up the three.js scene. This is the most basic setup without
// any special stuff
function initScene() {
    // set the scene size
    var WIDTH = 600,
        HEIGHT = 600;
    // set some camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;
    // create a WebGL renderer, camera, and a scene
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene = new THREE.Scene();
    // add and position the camera at a fixed position
    scene.add(camera);
    setCamera(camera);
    camera.lookAt(scene.position);
    
    // start the renderer, and black background
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x000);
    // add the render target to the page
    $("#chart").append(renderer.domElement);
    // add a light at a specific position
    var pointLight = new THREE.PointLight(0xFFFFFF);
    scene.add(pointLight);
    pointLight.position.x = 800;
    pointLight.position.y = 800;
    pointLight.position.z = 800;
    // add a base plane on which we'll render our map
    var planeGeo = new THREE.PlaneGeometry(10000, 10000, 10, 10);
    var planeMat = new THREE.MeshLambertMaterial({
        color: 0x666699
    });
    var plane = new THREE.Mesh(planeGeo, planeMat);
    // rotate it to correct position
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
}

function setCamera(camera, z=40, y=-74) {
    camera.position.z = z;
    camera.position.x = 0;
    camera.position.y = y;
}