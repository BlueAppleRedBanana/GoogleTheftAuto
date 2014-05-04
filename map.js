function Map(longitude, latitude){        
    console.log(longitude, latitude);
    var me = this;
    me.longitude = longitude;
    me.latitude = latitude;
    me.buildings = [];
    me.bounds = [];
    me.section;
    me.bbox = {
            "north":me.latitude + BBOX_SIZE/2, 
            "south":me.latitude - BBOX_SIZE/2,
            "east":me.longitude + BBOX_SIZE/2,
            "west":me.longitude - BBOX_SIZE/2};

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
//                var geometry = new THREE.Geometry();

                var rectShape = new THREE.Shape();
                var startPoint;
                $.each(value.geometry.coordinates[0], function(index2, vertex){
                    if(index2 == 0){
                        rectShape.moveTo(vertex[0],vertex[1]);
                        startPoint = [vertex[0],vertex[1]];
                    }else{
                        rectShape.lineTo(vertex[0],vertex[1]);
                    }
//                    geometry.vertices.push(new THREE.Vector3(vertex[1],0,vertex[0]));
                    boundary.push([vertex[0], vertex[1]]);
                });
                rectShape.lineTo(startPoint[0],startPoint[1]);

                var rectGeom = new THREE.ShapeGeometry( rectShape );
                var building = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color:"#E6E1B5", wireframe:false }));

/*
                var n = geometry.vertices.length;

                for (x = 0; x < n-2; x++) {
                    geometry.faces.push(new THREE.Face3(n-1, n-2-x, n-3-x));
                }

                material = new THREE.MeshBasicMaterial({color:"#E6E1B5",wireframe:false});

                building = new THREE.Mesh(geometry, material);
  */
                building.boundary = boundary;
                building.geometry.computeBoundingBox();

                var bBox = building.geometry.boundingBox;
                scene.add(building);
                me.buildings.push(building);



                var rectShape = new THREE.Shape();
                rectShape.moveTo( bBox.min.x,bBox.min.y );
                rectShape.lineTo( bBox.min.x,bBox.max.y );
                rectShape.lineTo( bBox.max.x,bBox.max.y );
                rectShape.lineTo( bBox.max.x,bBox.min.y );
                rectShape.lineTo( bBox.min.x,bBox.min.y );

                var rectGeom = new THREE.ShapeGeometry( rectShape );
                var bound = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true }));     

/*
                var geometry = new THREE.Geometry();
                    geometry.vertices.push(new THREE.Vector3(bBox.min.x,0,bBox.min.z));
                    geometry.vertices.push(new THREE.Vector3(bBox.min.x,0,bBox.max.z));
                    geometry.vertices.push(new THREE.Vector3(bBox.max.x,0,bBox.max.z));
                    geometry.vertices.push(new THREE.Vector3(bBox.max.x,0,bBox.min.z));

                for (x = 0; x < 2; x++) {
                    geometry.faces.push(new THREE.Face3(3, 2-x, 1-x));
                }

                material = new THREE.MeshBasicMaterial({color:"#ff0000",wireframe:true});
                bound = new THREE.Mesh(geometry, material);
*/                
                building.bounds = bound;
                me.bounds.push(bound);
                scene.add(bound);
            }
        });

        if(!car){

            var rectShape = new THREE.Shape();
            rectShape.moveTo(.00004,.00002);
            rectShape.lineTo( 0,.00002);
            rectShape.lineTo( 0,0 );
            rectShape.lineTo( .00004,0 );
            rectShape.lineTo(.00004,.00002);

            var rectGeom = new THREE.ShapeGeometry( rectShape );
            car = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ) ;     

/*
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(.00004,0,.00002));
            geometry.vertices.push(new THREE.Vector3(0,0,.00002));
            geometry.vertices.push(new THREE.Vector3(0,0,0));
            geometry.vertices.push(new THREE.Vector3(.00004,0,0));
        
            for (x = 0; x < 2; x++) {
                geometry.faces.push(new THREE.Face3(0, x + 1, x + 2));
            }

            material = new THREE.MeshBasicMaterial({color:"#0000cc",wireframe:true});
            car = new THREE.Mesh( geometry, material);
*/
            car.position.x = longitude;
            car.position.y = latitude;
            car.direction = 0;
            car.steering = 0;
            car.speed = 0;
            console.log(car);

            scene.add( car );

            animate();
        }
    }
    getOSM(this.bbox,false);
};