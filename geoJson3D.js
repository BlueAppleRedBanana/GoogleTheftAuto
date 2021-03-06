
var home = [40.412, -74.0]
//var home = [-122.410312, 37.761012]
//var TILE_URL = "http://tile.stamen.com/toner-labels/"
var TILE_URL = "http://tile.stamen.com/toner/"

var proj = d3.geo.mercator()
    .center(home)
    .scale(Math.pow(2,27));

var width = window.innerWidth*3,
    height = window.innerHeight*3

var tile = d3.geo.tile()
    .size([width, height]);

var zoom = d3.behavior.zoom()
    .scale(proj.scale())
    .translate(proj([0,0]))
    .on("zoom", zoomed);

var map = d3.select("body")
//    .call(zoom);

var layer = map.append("div")
    .attr("class", "layer");

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(width/2, -height/2, 500); // gen
camera.position.set(1180, -1500, 300);
camera.target = new THREE.Vector3(0, 0, 0);
camera.rotation.x += Math.PI/4
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

//init scene
scene = new THREE.Scene();
scene.add(camera);

var light = new THREE.PointLight(0xffffff);
light.shadowCameraVisible = true;
light.position.set(50000,5000,50000);
scene.add(light);

var light2 = new THREE.PointLight(0xffffff);
light2.shadowCameraVisible = true;
light2.position.set(-50000,5000,50000);
scene.add(light2);

var tileTextures = [];

function floorTile (url, d, t) {
  var tc = THREE.ImageUtils.loadTexture( url, function (evt) {
    renderer.render(scene, camera);
  })
  //var material = new THREE.MeshBasicMaterial({
  var material = new THREE.MeshLambertMaterial({
    map: tc, color: 0xffffff })
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(256, 256), material);
  plane.position.x = 128 + (tile().translate[0] + d[0])*256
  plane.position.y = -128 + (tile().translate[1] + d[1])*(-256)
  scene.add(plane);
  tileTextures.push(plane)
}

function v2d(x,y,z) {
  return new THREE.Vector2(x,y);
}

function v(x,y,z) {
  return new THREE.Vector3(x,y,z);
}

var meshes = []; // for later rotations etc

function loadBuildings (jsonData) {
d3.json(jsonData, function (err, footprints) {
  if (err) { console.log(err); return; }
  var footprints = footprints.features
  var floorGeom;
  footprints.forEach(function (e0, i0, c0) {
    floorGeom = []
    e0.geometry.coordinates[0].forEach(function (e1, i1, c1) {
      var scrnCoord = proj(e1)
      floorGeom.push(
        v2d(scrnCoord[0], (-1)*scrnCoord[1])
      )
    })

    var footprintshape2d = new THREE.Shape(floorGeom)
    var footprintExtrudable = new THREE.ExtrudeGeometry(footprintshape2d, {
              // height given + constant by inspection
              amount: e0.properties.height*1.3, height: 0,
              bevelEnabled: false,
              material: 0, extrudeMaterial: 1
            })
  var frontMaterial = new THREE.MeshLambertMaterial( { color: 0x3f3f3f, wireframe: false } );
	var sideMaterial = new THREE.MeshLambertMaterial( { color: 0xb86b00, wireframe: false } );
  var materialArray = [ frontMaterial, sideMaterial ];
	footprintExtrudable.materials = materialArray;
  var bldg = new THREE.Mesh( footprintExtrudable, new THREE.MeshFaceMaterial() );
  scene.add(bldg);
  meshes.push(bldg)
  })
})
}

//loadBuildings("parcelcollection_unprojected.json")

container = document.createElement('div');
document.body.appendChild(container);
container.appendChild(renderer.domElement);
renderer.render(scene, camera);

zoomed();

function zoomed() {
  var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      ();

  var image = layer
    .selectAll(".tile")
      .data(tiles, function(d) { return d; });

  image.exit()
      .remove();

  image.enter().append("img")
      .attr("class", "tile")
      .attr("hidden", function(d) {
        floorTile(TILE_URL + d[2] + "/" + d[0] + "/" + d[1] + ".png", d, tile);
        return "";
      })
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame( animate );
}
animate()

// console.log type position debug
// var dsumx = 0, dsumy=0;

function keydown(event){
	var delta = 16;
	event = event || window.event;
	var keycode = event.keyCode;
	switch(keycode){
		case 37 : //left arrow
			event.preventDefault();
			camera.position.x -= delta;
			break;
		case 38 : // up arrow
			event.preventDefault();
			camera.position.y += delta;
			break;
		case 39 : // right arrow
			//event.preventDefault();
			camera.position.x += delta;
			break;
		case 40 : //down arrow
			event.preventDefault();
			camera.position.y -= delta;
			break;
		case 190 : //
			event.preventDefault();
			camera.position.z += delta;
			break;
		case 188 : //
			event.preventDefault();
			camera.position.z -= delta;
			break;
		case 89 : //
			event.preventDefault();
			camera.rotation.y = camera.rotation.y + Math.PI/100;
			break;
		case 88 : //
			event.preventDefault();
			camera.rotation.x = camera.rotation.x + Math.PI/100;
			break;
		case 90 : //
			event.preventDefault();
			camera.rotation.z = camera.rotation.z + Math.PI/100;
			break;
		case 55 : //
			event.preventDefault();
			camera.rotation.y = camera.rotation.y - Math.PI/100;
			break;
		case 68 : //
			event.preventDefault();
			camera.rotation.x = camera.rotation.x - Math.PI/100;
			break;
		case 83 : //
			event.preventDefault();
			camera.rotation.z = camera.rotation.z - Math.PI/100;
			break;
      /* for repositioning tiles visually with: [, ], ;, and ' keys
		case 221 : // ]
			event.preventDefault();
      tileTextures.forEach(function (t) {
        t.position.x += delta;
      })
      dsumx+=delta
			break;
		case 219 : // [
			event.preventDefault();
      tileTextures.forEach(function (t) {
        t.position.x -= delta;
      })
      dsumx-=delta;
			break;
		case 186 : // ;
			event.preventDefault();
      tileTextures.forEach(function (t) {
        t.position.y += delta;
      })
      dsumy+=delta
			break;
		case 222 : // '
			event.preventDefault();
      tileTextures.forEach(function (t) {
        t.position.y -= delta;
      })
      dsumy-=delta;
      break;
      */
	}
  //console.log(dsumx, dsumy)
	camera.updateProjectionMatrix();
  renderer.render( scene, camera );
  zoomed()
}

document.addEventListener('keydown',keydown,false);

