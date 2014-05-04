

var BASE_URL = "http://api.openstreetmap.org/api/0.6/map?bbox="
var BBOX_SIZE = 1.000000;

function getUrl(oldbox, direction) {
	var west = oldbox.west;
	var east = oldbox.east;
	var north = oldbox.north;
	var south = oldbox.south;
	switch (direction) {
		case "east" :
			left = right;
			right = right + BBOX_SIZE;
			break;
		case "west" :
			right = left;
			left = left + BBOX_SIZE;
			break;
		case "north" :
			south = north;
			north = north + BBOX_SIZE;
			break;
		case "south" :
			north = south;
			south = south + BBOX_SIZE;
			break;
	}
	return BASE_URL += west + "," + south + "," + north + "," + east;
}

function getOSM(oldbox, direction) {
	var url = getUrl(oldbox,direction);
	$.ajax({
		type: 'GET',
		url: url
	}).done(function (data) {
		return osm2geo(data);
	});
}