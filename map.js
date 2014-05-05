function Map(longitude, latitude){        
    var me = this;
    me.longitude = parseFloat(longitude);
    me.latitude = parseFloat(latitude);
    me.buildings = [];
    me.bounds = [];
    me.section;
    me.bbox = {
            "north":parseFloat(me.latitude) + BBOX_SIZE/2, 
            "south":parseFloat(me.latitude) - BBOX_SIZE/2,
            "east":parseFloat(me.longitude) + BBOX_SIZE/2,
            "west":parseFloat(me.longitude) - BBOX_SIZE/2};

    var objects = [];
    var BASE_URL = "http://api.openstreetmap.org/api/0.6/map?bbox="

    function getUrl(oldbox, direction) {
        var west = oldbox.west;
        var east = oldbox.east;
        var north = oldbox.north;
        var south = oldbox.south;
        switch (direction) {
            case "east" :
                west = east;
                east = east + BBOX_SIZE;
                break;
            case "west" :
                east = west;
                west = west + BBOX_SIZE;
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
        return BASE_URL += west + "," + south + "," + east + "," + north;
    }

    function getOSM(oldbox, direction) {
        var url = getUrl(oldbox,direction);
        $.ajax({
            type: 'GET',
            url: url
        }).done(function (data) {
            objects = (osm2geo(data)).features;
            me.draw();
        });
    }

    function drawBoundingBox(object) {
        
        object.geometry.computeBoundingBox();
        var bBox = object.geometry.boundingBox;

        var rectShape = new THREE.Shape();
        rectShape.moveTo( bBox.min.x,bBox.min.y );
        rectShape.lineTo( bBox.min.x,bBox.max.y );
        rectShape.lineTo( bBox.max.x,bBox.max.y );
        rectShape.lineTo( bBox.max.x,bBox.min.y );
        rectShape.lineTo( bBox.min.x,bBox.min.y );

        var rectGeom = new THREE.ShapeGeometry( rectShape );
        var bound = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true }));
        object.bounds = bound;
        me.bounds.push(bound);
        scene.add(bound);
    }

    me.draw = function(){

        var rectShape = new THREE.Shape();
        rectShape.moveTo( longitude-BBOX_SIZE/2,latitude-BBOX_SIZE/2 );
        rectShape.lineTo( longitude-BBOX_SIZE/2,latitude+BBOX_SIZE/2 );
        rectShape.lineTo( longitude+BBOX_SIZE/2,latitude+BBOX_SIZE/2 );
        rectShape.lineTo( longitude+BBOX_SIZE/2,latitude-BBOX_SIZE/2 );
        rectShape.lineTo( longitude-BBOX_SIZE/2,latitude-BBOX_SIZE/2 );

        var rectGeom = new THREE.ShapeGeometry( rectShape );
        var section = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: "#8CBEB2", wireframe:true } ) ) ;     
        me.section = section;
        scene.add(section);

        $.each(objects, function(index, value){
            if(value.properties.building == "yes"){
                var boundary = [];
                var rectShape = new THREE.Shape();
                var startPoint;
                $.each(value.geometry.coordinates[0], function(index2, vertex){
                    if(index2 == 0){
                        rectShape.moveTo(vertex[0],vertex[1]);
                        startPoint = [vertex[0],vertex[1]];
                    }else{
                        rectShape.lineTo(vertex[0],vertex[1]);
                    }
                    boundary.push({ "x":vertex[0], "y":vertex[1] });
                });

                if(startPoint){
                    rectShape.lineTo(startPoint[0],startPoint[1]);

                    var rectGeom = new THREE.ShapeGeometry( rectShape );

                    var building = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color:"#E6E1B5", wireframe:false }));

                    building.boundary = boundary;
                    
                    scene.add(building);
                    me.buildings.push(building);

                    drawBoundingBox(building);
                    scene.add(building);
                }
            }
        });

        if(!car){

            var rectShape = new THREE.Shape();
            rectShape.moveTo(-0.00001,  0.00001 );
            rectShape.lineTo( 0.00003,  0.00001 );
            rectShape.lineTo( 0.00003,  -0.00001 );
            rectShape.lineTo(-0.00001,  -0.00001 );
            rectShape.lineTo(-0.00001,  0.00001 );

            var rectGeom = new THREE.ShapeGeometry( rectShape );
            car = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ) ;     
            car.collision = false;
            car.lookup = 0;
            var rectShape = new THREE.Shape();
            var BUMPERSIZE = 1.5;
            rectShape.moveTo(-0.00001*BUMPERSIZE,  0.00001*BUMPERSIZE );
            rectShape.lineTo( 0.00003*BUMPERSIZE,  0.00001*BUMPERSIZE );
            rectShape.lineTo( 0.00003*BUMPERSIZE,  -0.00001*BUMPERSIZE );
            rectShape.lineTo(-0.00001*BUMPERSIZE,  -0.00001*BUMPERSIZE );
            rectShape.lineTo(-0.00001*BUMPERSIZE,  0.00001*BUMPERSIZE );


            var rectGeom = new THREE.ShapeGeometry( rectShape );
            car.bumper = rectGeom;

            car.position.x = longitude;
            car.position.y = latitude;
            car.direction = 0;
            car.steering = 0;
            car.speed = 0;

            scene.add( car );

            animate();
        }
    }
    getOSM(this.bbox,false);
};