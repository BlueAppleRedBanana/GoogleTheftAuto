
var minDistance = 0.00001;


function rotateBbox(bBox) {
	var cos = Math.cos(car.direction);
    var sin = Math.sin(car.direction);
	bBox.min.x*=cos;
	bBox.min.y*=sin;
	bBox.max.x*=cos;
    bBox.max.y*=sin;
}
function drawBoundingBox(object) {
	//car.geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( car.direction/2));
	updateCarBoundingBox();
    var bBox = object.geometry.boundingBox;

    var rectShape = new THREE.Shape();
    rectShape.moveTo( bBox.min.x,bBox.min.y );
    rectShape.lineTo( bBox.min.x,bBox.max.y );
    rectShape.lineTo( bBox.max.x,bBox.max.y );
    rectShape.lineTo( bBox.max.x,bBox.min.y );
    rectShape.lineTo( bBox.min.x,bBox.min.y );

    var rectGeom = new THREE.ShapeGeometry( rectShape );
    var bound = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0xff5555, wireframe:true }));
    object.bounds = bound;
    scene.add(bound);
}

function drawCarBumper() {
    var bumpers = car.bumper.vertices;
    var newBumper =[];
	for ( key in bumpers ) {
		var bumperx = bumpers[key].x + car.position.x;
		var bumpery = bumpers[key].y + car.position.y;
		newBumper.push({"x":bumperx,"y":bumpery});
	}

	var rectShape = new THREE.Shape();
	rectShape.moveTo(newBumper[0].x, newBumper[0].y);
	for (key in newBumper) {
		rectShape.lineTo( newBumper[key].x, newBumper[key].y);
	}
	rectShape.lineTo(newBumper[0].x, newBumper[0].y);

	var rectGeom = new THREE.ShapeGeometry(rectShape);
	var bound = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0x5555ff, wireframe:true }));
    scene.add(bound);
}

function updateCarBoundingBox() {
	car.geometry.computeBoundingBox();
	car.geometry.boundingBox.min.x += car.position.x;
	car.geometry.boundingBox.max.x += car.position.x;
	car.geometry.boundingBox.min.y += car.position.y;
	car.geometry.boundingBox.max.y += car.position.y;
}

function detectCollision() {
	updateCarBoundingBox();
	drawBoundingBox(car);
	drawCarBumper();
	
	// console.log(car.geometry.boundingBox.max);
	//console.log(car.position);
	buildings = currentMap.buildings;
	// console.log(currentMap.buildings.length);

	// var candidates = getNearOnly(car, minDistance, buildings);
	// if (candidates.length == 0) {
	// 	return false;
	// } else { 
	// 	console.log("near: " + candidates.length);
	// }
	var candidates = buildings;
	candidates = getBoundCollision(candidates);
	$.each(buildings, function(index, object) {
        	object.bounds.material.color.setHex(0xFF0000);
    });
	if (candidates.length == 0) {
		return false;
	} else {
		console.log("bound: " + candidates.length);	
        $.each(candidates, function(index, object) {
        	object.bounds.material.color.setHex(0x0000FF);
        });
	}
	// debugger;

	candidates = checkCarCollision(car, candidates);
	return candidates;
}

function setCenter(obj) {
	obj.position.x = (obj.geometry.boundingBox.max.x + obj.geometry.boundingBox.min.x) /2;
	obj.position.y = (obj.geometry.boundingBox.max.y + obj.geometry.boundingBox.min.y) /2;
	obj.geometry.computeBoundingBox();
}

function getNearOnly(car, distance, objects) {
	result = [];
	for (key in objects) {
		var obj = objects[key];
		setCenter(obj);
		console.log(getDistance(car, obj));
		if (getDistance(car, obj) < distance) {
			result.push(obj);
		}
	}
	return result;
}

function simpleDistance(obj1, obj2) {
	return Math.min(Math.abs(obj1.position.x - obj2.position.x),Math.abs(obj1.position.y - obj2.position.y));
}

function getDistance(obj1, obj2) {
	var result = (Math.pow(Math.abs(obj1.x-obj2.x),2) + Math.pow(Math.abs(obj1.y-obj2.y),2));
	return result;
}

function getBoundCollision(candidates) {
	result = [];
	for (key in candidates) {
		obj = candidates[key];
		if (checkBound(car, obj)) {
			result.push(obj);
		}
	}
	return result;
}

function checkBound(car, obj) {
	if (obj.geometry.boundingBox == null) {
		obj.geometry.computeBoundingBox();
	}
	bound1 = car.geometry.boundingBox;
	bound2 = obj.geometry.boundingBox;
	// console.log(bound1.max);
	// console.log(bound2.max);
	
	left1 = bound1.min.x;
	right1 = bound1.max.x;
	bottom1 = bound1.min.y;
	top1 = bound1.max.y;

	left2 = bound2.min.x;
	right2 = bound2.max.x;
	bottom2 = bound2.min.y;
	top2 = bound2.max.y;

	return !(bottom1 > top2 ||
		right1 < left2 ||
		top1 < bottom2 ||
		left1 > right2 );
}

function testIntersection(car, candidates) {
	result = [];
	for (key in candidates) {
		candidate = candidates[key];
		if (objectIntersect(car, candidate)) {
			result.push(candidate);
		}
	}
	return result;
}



function checkCarCollision(car, objects) {
	result = []
	for (key in objects) {
		var object = objects[key];

		// Using BoundingBox
		//var bound = car.geometry.boundingBox;
		// test four side
		// testx = bound.max.x;
		// testy = bound.max.y;
		// if (pnpoly(testx,testy,object)) {
		// 	result.push(object); continue;
		// }
		// testy = bound.min.y;
		// if (pnpoly(testx,testy,object)) {
		// 	result.push(object); continue;
		// }

		// testx = bound.min.x;
		// testy = bound.max.y;
		// if (pnpoly(testx,testy,object)) {
		// 	result.push(object); continue;
		// }
		// testy = bound.min.y;
		// if (pnpoly(testx,testy,object)) {
		// 	result.push(object); continue;
		// }

		// using geometry itself
		var vertices = car.bumper.vertices;
		for (key in vertices) {
			var vertex = vertices[key];
			var testx = vertex.x + car.position.x;
			var testy = vertex.y + car.position.y;
			if (pnpoly(testx,testy,object)) {
				result.push(object); 
				break;
			}
		}
	}
	return result;
 }

function pnpoly(testx,testy, obj) {
	var nvert = obj.boundary.length;
	var vertices = obj.boundary;
	var i, j, c;
	for (i=0, j=nvert-1; i<nvert; j=i++) {
		if ( ((vertices[i].y >= testy) != (vertices[j].y >= testy)) &&
			(testx <= (vertices[j].x-vertices[i].x)*(testy-vertices[i].y/vertices[j].y-vertices[i].y) + vertices[i].x)) {
			c = !c;
		}
	}
	return c;
}

function objectIntersect(car, object) {
	var carPoints = car.geometry.vertices;
	for (key1 in carPoints) {
		var startPoint = carPoints[key1];
		var endPoint = (key1 != carPoints.length-1) ? carPoints[key1+1] : carPoints[0];

		// startPoint.x += 
		// var line = {"s":startPoint,"e":endPoint};
		// var line1 = {"X":0,.y":0}
		line1.x = line.x + car.position.x;
		line1.y = line.y + car.position.y;
		for (key2 in object.boundary) {
			var line2 = object.boundary[key2];
			if (lineIntersect(line1,line2)) {
				return true;
			}
		}
	}
	return false;
}


function lineIntersect(line1, line2) {
	v1 = line1.s;
	v2 = line1.e;
	v3 = line2.s;
	v4 = line2.e;
	if (lineIntersect(v1.x,v1.y,v2.x,v2.y,v3.x,v3.y,v4.x,v4.y)) {
		return true;
	}

	v3 = line2.e;
	v4 = line2.s;
	if (lineIntersect(v1.x,v1.y,v2.x,v2.y,v3.x,v3.y,v4.x,v4.y)) {
		return true;
	}

	v1 = line1.e;
	v2 = line1.s;
	v3 = line2.s;
	v4 = line2.e;
	if (lineIntersect(v1.x,v1.y,v2.x,v2.y,v3.x,v3.y,v4.x,v4.y)) {
		return true;
	}

	v3 = line2.e;
	v4 = line2.s;
	if (lineIntersect(v1.x,v1.y,v2.x,v2.y,v3.x,v3.y,v4.x,v4.y)) {
		return true;
	}
	return false;
}

function lineIntersect(x1,y1,x2,y2,x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}


function doesCollide(car, obj) {
	for (point in carPoints) {
		// check point is in object or not.
	}
}


// 1 | 0
// --+--
// 2 | 3
// We don't need this 
function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width : 0,
		height : 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;

	/*
	 * Clears the quadTree and all nodes of objects
	 */
	this.clear = function() {
		objects = [];
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}
		this.nodes = [];
	};

	/*
	 * Get all objects in the quadTree
	 */
	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}
		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};

	/*
	 * Return all objects that the object could collide with
	 */
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}
		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}
		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};

	/*
	 * Insert the object into the quadTree. If the tree
	 * excedes the capacity, it will split and add all
	 * objects to their corresponding nodes.
	 */
	this.insert = function(obj) {
		if (typeof obj === "undefined") {
			return;
		}
		if (obj instanceof Array) {
			for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}
			return;
		}
		if (this.nodes.length) {
			var index = this.getIndex(obj);
			// Only add the object to a subnode if it can fit completely
			// within one
			if (index != -1) {
				this.nodes[index].insert(obj);
				return;
			}
		}
		objects.push(obj);
		// Prevent infinite splitting
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}
			var i = 0;
			while (i < objects.length) {
				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				}
				else {
					i++;
				}
			}
		}
	}
}