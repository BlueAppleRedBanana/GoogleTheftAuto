
var stage;
var quadStage;
var circles;
var tree;

var CIRCLE_COUNT = 100;
var bounds;
var shape;
var fps;
var showOverlay = false;


var pointQuad = true;
var bounds = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
}

var quad = new QuadTree(bounds, pointQuad);

var quadCanvas = document.getElementById("quadCanvas");
