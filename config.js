var latitude = 40.7120;
var longitude = -74.0059;

var zoomLevel = 9

var zoomRange = [
	{20 : 1128.497220},
	{19 : 2256.994440},
	{18 : 4513.988880},
	{17 : 9027.977761},
	{16 : 18055.955520},
	{15 : 36111.911040},
	{14 : 72223.822090},
	{13 : 144447.644200},
	{12 : 288895.288400},
	{11 : 577790.576700},
	{10 : 1155581.153000},
	{9  : 2311162.307000},
	{8  : 4622324.614000},
	{7  : 9244649.227000},
	{6  : 18489298.450000},
	{5  : 36978596.910000},
	{4  : 73957193.820000},
	{3  : 147914387.600000},
	{2  : 295828775.300000},
	{1  : 591657550.500000}
]

Object.prototype.getKeyByValue = function( value ) {
	for( var prop in this ) {
		if( this.hasOwnProperty( prop ) ) {
			if( this[ prop ] === value )
				return prop;
		}
	}
}
// function getRangeFromZoomLvl(zoomlevel) {
// 	return zoomRange[zoomLevel]
// }

// function getZoomLvlFromRange(range) {
// 	for key in zoomRange {
// 		if (zoomRange[key] > range && key > 0) {
// 			value = getNearer(zoomRange[key-1], zoomRange[key], range)
// 			return zoomRange.getKeyByValue(value);
// 		}
// 	}
// }

function getNearer(elem1, elem2, target) {
	diff1 = Math.abs(elem1 - target);
	diff2 = Math.abs(elem2 - target);
	return ( diff1 < diff2 ) ? elem1 : elem2
}