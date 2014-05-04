
var minDistance = 0.0000001;

detectCollision = function() {
	buildings = currentMap.buildings;
	//candidates = getNearOnly(car, minDistance, buildings);
	// if (candidates.length > 0) {

	// }
}

function bound(obj1, obj2) {
	// bound1 = obj1.geometry.boundingbox;
	// bound2 = obj2.geometry.boundingbox;
	// bottom = bound1.min.x;
	// top = bound1.max.x;
	// left = bound1.

	// bound1.max.x < 
	if (obj1.x < obj2.x + obj2.width && 
		obj1.x + obj1.width > obj2.x &&
		obj1.y < obj2.y + obj2.height &&
		obj1.y + obj1.height > oj2.y) {
	// objects are touching
	}
}

function distance(obj1, obj2) {
	return (Math.pow(Math.abs(obj1.x-obj2.x),2) + Math.pow(Math.abs(obj1.y-obj2.y),2));
}

// function getCenter(bound) {
// 	bound.
// }

// function simpleDistance(obj1, obj2) {
// 	return max(Math.abs(obj1.))
// }

function getNearOnly(car, distance, objects) {
	result = [];
	for (obj in objects) {
		if (distance(car, obj) < distance) {
			result.append(obj);
		}
	}
	return result;
}

function testIntersection(car, object) {
	for (line1 in car.boundary) {
		for (line2 in object.boundary) {
			if (lineIntersect(line1,line2)) {
				return true;
			}
		}
	}
	return false;
}



function checkIntersects(line1, line2) {
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