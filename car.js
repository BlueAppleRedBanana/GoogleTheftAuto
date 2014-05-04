function Car(latitude, longitude, direction){
	this.latitude = latitude;
	this.longitude = longitude;
	this.direction = direction;
	this.speedLimit = 10;
	this.steering = 0;
	this.speed = 0;
	this.power = 0;
}

function handleFrame(){
    if(leftkey){
      if(car.steering<1){ car.steering += 0.01; }
    }else if(rightkey){
      if(car.steering>-1){  car.steering -= 0.01; }
    }else{
      car.steering *= 0.1;
    }

    if(downkey){
      car.power = 1;
    }else if(upkey){
      car.power = -1;
    }else{
      car.power = 0;
    }

    if(car.speed + car.power < car.speedLimit){
      car.speed += car.power;
    }

    car.speed *=0.99;

    car.direction += car.steering;
    car.latitude += car.speed * -Math.cos(car.direction) * 0.000001;
    car.longitude += car.speed * Math.sin(car.direction) * 0.000001;
    
    loc.setLatitude(car.latitude);
    loc.setLongitude(car.longitude);

//    console.log(car.latitude, car.longitude, car.direction);

    var orientation = model.getOrientation();
    orientation.setHeading(360-car.direction/Math.PI*180%360);
    model.setOrientation(orientation);

    var ca = ge.createCamera('');

    ca.setLatitude(car.latitude - 0.001*Math.cos(car.direction));
    ca.setLongitude(car.longitude + 0.001*Math.sin(car.direction));
    ca.setTilt(85);
    ca.setAltitude(20);
    ca.setHeading(360 - car.direction/Math.PI*180%360);

    ge.getView().setAbstractView(ca);

    $("#speed").html(parseInt(Math.abs(car.speed))+" MPH");
  }