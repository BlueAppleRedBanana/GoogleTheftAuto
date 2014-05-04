function Map(longitude, latitude) {
    var BBOX_SIZE = 0.0005;
    var THRESHOLD = 0.00001;
    var me = this;
    this.buildings = [];
    this.bounds = [];
    var bbox = {
        "north": latitude + BBOX_SIZE / 2,
        "south": latitude - BBOX_SIZE / 2,
        "east": longitude + BBOX_SIZE / 2,
        "west": longitude - BBOX_SIZE / 2
    };
    console.log(bbox);
    var objects = [];
    var BASE_URL = "http://api.openstreetmap.org/api/0.6/map?bbox="

    function getUrl(oldbox, direction) {
        var west = oldbox.west;
        var east = oldbox.east;
        var north = oldbox.north;
        var south = oldbox.south;
        switch (direction) {
            case "east":
                west = east;
                east = east + BBOX_SIZE;
                break;
            case "west":
                east = west;
                west = west + BBOX_SIZE;
                break;
            case "north":
                south = north;
                north = north + BBOX_SIZE;
                break;
            case "south":
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
            url: url//"http://api.openstreetmap.org/api/0.6/map?bbox=11.54,48.14,11.543,48.145"
        }).done(function (data) {
            objects = (osm2geo(data)).features;
            //console.log(objects);
            me.draw();
        });
    }

    this.draw = function(){
        $.each(objects, function(index, value){
            //console.log(value);
            if(value.properties.building == "yes"){
                //console.log(index, value);
                //if(index>50) return false;
                var boundary = [];
                var geometry = new THREE.Geometry();
                $.each(value.geometry.coordinates[0], function(asd, vertex){
                    if(!offsetX){
                        offsetX = vertex[0];
                        offsetZ = vertex[1];
                    }
                    geometry.vertices.push(new THREE.Vector3((vertex[0]-offsetX)*1000,0,(vertex[1]-offsetZ)*1000));
                    boundary.push([(vertex[0]-offsetX)*1000, (vertex[1]-offsetZ)*1000]);

                //  console.log(new THREE.Vector3(vertex[0]-offsetX,0,vertex[1]-offsetZ));
                });
                var n = geometry.vertices.length;

                for (x = 0; x < n-2; x++) {
                    geometry.faces.push(new THREE.Face3(0, x + 1, x + 2));
                }

                material = new THREE.MeshBasicMaterial({color:"#E6E1B5",wireframe:false});

                building = new THREE.Mesh(geometry, material);
                building.boundary = boundary;
                building.geometry.computeBoundingBox ();

                var bBox = building.geometry.boundingBox;

                scene.add(building);
                me.buildings.push(building);

                var geometry = new THREE.Geometry();
                    geometry.vertices.push(new THREE.Vector3(bBox.min.x,0,bBox.min.z));
                    geometry.vertices.push(new THREE.Vector3(bBox.min.x,0,bBox.max.z));
                    geometry.vertices.push(new THREE.Vector3(bBox.max.x,0,bBox.max.z));
                    geometry.vertices.push(new THREE.Vector3(bBox.max.x,0,bBox.min.z));

                for (x = 0; x < 2; x++) {
                    geometry.faces.push(new THREE.Face3(0, x + 1, x + 2));
                }

                material = new THREE.MeshBasicMaterial({color:"#ff0000",wireframe:true});

                bound = new THREE.Mesh(geometry, material);
                bound.buildingID = building.id;
                me.bounds.push(bound);
                scene.add(bound);
                //console.log(bound);
            }
        });
    }
    getOSM(bbox,false);
}