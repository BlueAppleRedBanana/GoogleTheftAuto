//"follow point" Google Earth game
//written by: Paul van Dinther
//            Dinther Product Design
//            Software development and specialists in simulation
//            email: vandinther@gmail.com
//This unit relies on pre-computed global variables used for speed optimisation defined in globals.js
//This class will allow you to record a series of coordinates into an array up to "size" in length
//Call getPoint and pass in the distance along for which you want a point.
//Lat lng Hdg are all interpolated and returned as a pointPosition object.
//The class keeps the last lookup index in memory so it is faster to look up
//subsequent points. Headings and segments are also pre-computed for faster processing.
//
//This calls is useful to animate objects along a poly line or
//to allow a camera to trail a moving object where the moving object records points
//and the camera is told to follow at a set distance.
//All distances are defined at sea level.



function pointPosition(latitude, longitude, altitude, heading, segment, distance){
	this.latitude = latitude;
	this.longitude = longitude;
	this.altitude = altitude;
	this.heading = heading;
	this.segment = segment;
	this.distance = distance;
}


function followPoint(size){
	this.positions = [];
	this.cursor = 0;
	this.index = 0;
	this.size = size;
	this.turnRate = 0;
	this.initialised = false;
	//pre-computes all the pointPositions from a kmlLineString and adjusts the array size
	this.initFromKmlCoord = function(kmlCoord){
		this.size = kmlCoord.getLength();
		for (var i = 0; i < kmlCoord.getLength(); i++){
			this.addPoint(kmlCoord.get(i).getLatitude(),kmlCoord.get(i).getLongitude(),kmlCoord.get(i).getAltitude(),0);
			if (i > 0){
				_oldPos1 = this.positions[this.positions.length-2];
				_oldPos2 = this.positions[this.positions.length-1];
				//alert(_oldPos1.latitude + ' - ' + _oldPos1.longitude + ' - ' + _oldPos1.altitude + ' and ' + _oldPos2.latitude + ' - ' + _oldPos2.longitude + ' - ' + _oldPos2.altitude);
				//compute heading for the previous point recorded
				var _data = getBearingDistanceTilt(_oldPos1.latitude,_oldPos1.longitude,_oldPos1.altitude,_oldPos2.latitude,_oldPos2.longitude,_oldPos2.altitude, getMetersToLocalLon(_oldPos2.latitude));
				this.positions[this.positions.length-2].heading = _data.bearing;
				this.positions[this.positions.length-1].segment = _data.distance;
				this.positions[this.positions.length-1].distance = this.positions[this.positions.length-2].distance + _data.distance;			
			}
		}

		if (i > 0){
			this.positions[this.positions.length-1].heading = this.positions[this.positions.length-2].heading;
		}
		this.initialised = true;
		debug('completed initFromKmlCoord');
	}
	this.clear = function(){
		this.positions = [];
	}
	
	this.populate = function(objLatitude,objLongitude,objAltitude, objHeading){
		for (var i = 0; i < this.size; i++){
			this.addPoint(objLatitude,objLongitude,objAltitude, objHeading);
		}	
	}
	//fast real-time recording of point data
	this.addPoint = function(objLatitude,objLongitude,objAltitude, objHeading){
		while (this.positions.length > this.size){this.positions.shift();}
		if (this.positions.length == 0){
			this.positions[this.positions.length] = new pointPosition(objLatitude,objLongitude,objAltitude,objHeading,0,0 ); 
		}else {
			//pop last node if segment is too short
			if (this.positions.length > 1 && this.positions[this.positions.length-1].segment < 1){this.positions.pop();}
			var _lastPos = this.positions[this.positions.length - 1];
			var _segment = getDistance(_lastPos.latitude, _lastPos.longitude, objLatitude, objLongitude,G_metersToLocalLon);
			var _distance = _lastPos.distance + _segment;
			this.positions[this.positions.length] = new pointPosition(objLatitude,objLongitude,objAltitude,objHeading,_segment,_distance);
		}
	}
	this.getLength = function(){
		return (this.positions[this.positions.length-1].distance);
	}
	this.getPointFromEnd = function(distance){
		_searchDist = this.positions[this.positions.length - 1].distance - Math.abs(distance);
		//Find the low and high nodes for _searchDist
		//Start looking around where the last search produced a result
		if (this.positions[this.index].distance > _searchDist){
			while (this.positions[this.index].distance > _searchDist && this.index > 0){ this.index -= 1;}
			_nodeID1 = this.index;
			_nodeID2 = this.index + 1;
		}
		else{
			while (this.positions[this.index].distance < _searchDist && this.index < this.positions.length-1){ this.index += 1;}
			_nodeID2 = this.index;
			_nodeID1 = this.index - 1;
		}
		//interpolate the nodes
		_node1 = this.positions[_nodeID1];
		_node2 = this.positions[_nodeID2];
		_deltaDist = _node2.distance - _node1.distance;
		_distAlongSegment = _searchDist - _node1.distance;

		_factor = _distAlongSegment/_deltaDist;
		_deltaLat = _node2.latitude - _node1.latitude;
		_deltaLon = _node2.longitude - _node1.longitude;
		_deltaAlt = _node2.altitude - _node1.altitude;
		_deltaHdg = fixAngle(_node2.heading - _node1.heading);
		if (_deltaHdg > 180) {_deltaHdg -=360;}
		if (_deltaHdg < -180) {_deltaHdg +=360;}
		_fixedHdg = _node1.heading + (_factor * _deltaHdg);
		return{latitude:_node1.latitude + (_factor * _deltaLat), longitude:_node1.longitude + (_factor * _deltaLon), altitude:_node1.altitude + (_factor * _deltaAlt),heading:_fixedHdg,segment:_distAlongSegment,distance:distance};	
	}
	this.getPointFromStart = function(distance){
		_searchDist = Math.min(Math.abs(distance),this.positions[this.positions.length-1].distance);
		//Find the low and high nodes for _searchDist
		//Start looking around where the last search produced a result
		if (this.positions[this.index].distance > _searchDist){
			while (this.positions[this.index].distance > _searchDist && this.index > 0){ this.index -= 1;}
			_nodeID1 = this.index;
			_nodeID2 = this.index + 1;
		}
		else{
			while (this.positions[this.index].distance < _searchDist && this.index < this.positions.length-1){ this.index += 1;}
			_nodeID2 = this.index;
			_nodeID1 = this.index - 1;
		}
		//interpolate the nodes
		_node1 = this.positions[_nodeID1];
		_node2 = this.positions[_nodeID2];
		_deltaDist = _node2.distance - _node1.distance;
		_distAlongSegment = _searchDist - _node1.distance;

		_factor = _distAlongSegment/_deltaDist;
		_deltaLat = _node2.latitude - _node1.latitude;
		_deltaLon = _node2.longitude - _node1.longitude;
		_deltaAlt = _node2.altitude - _node1.altitude;
		//_deltaHdg = fixAngle(_node2.heading - _node1.heading);
		//_fixedHdg = _node1.heading + (_factor * _deltaHdg);
		_fixedHdg = _node1.heading; //test
		var _pointPos = new pointPosition(_node1.latitude + (_factor * _deltaLat),_node1.longitude + (_factor * _deltaLon),_node1.altitude + (_factor * _deltaAlt),_fixedHdg,_distAlongSegment,distance);
		return ( _pointPos);		
	}
}