//basic utils
//returns in seconds
getTime = function(){
    var date = new Date();
    return date.getTime()/1000;
}

//convert seconds to ms
function secsToMs(seconds){
    return seconds*1000;
}

function msToSecs(ms){
    return ms/1000;
}

function pr(obj){
    console.log(JSON.stringify(obj));
}
var log = pr;//alias

//move an object at an angle a certain distance
function getMovementXY(obj, distance){
    x = obj.x + distance*Math.cos(degreesToRadians(obj.angle-90));
    y = obj.y + distance*Math.sin(degreesToRadians(obj.angle-90));
    return {x:x, y:y};
}

function offScreen(obj, min_x, min_y, max_x, max_y){
    if ((obj.x<min_x) || (obj.y<min_y) || (obj.x>max_x) || (obj.y>max_y)){
	return true;
    }
    return false;
}

//returns the key of obj2 on collision
function detectCollision(obj1, obj1_width, obj2_set, obj2_width, ignore_key){
    var collision_distance = (obj1_width+obj2_width)/2;
    for(key in obj2_set){
	if(key == ignore_key)
	    continue;
	var obj2 = obj2_set[key];
	var dist = distance(obj1.x, obj1.y, obj2.x, obj2.y);
	if(dist<collision_distance){
	    return key;
	}
    }
    return false;
}

function xyToAngle(x, y){
    var angle = Math.atan(y/x);
    angle = radiansToDegrees(angle);
    if((x >= 0)){
	return angle + 90;
    }
    return angle + 270;	
}

function distance(x1, y1, x2, y2){
    //find horizontal distance (x)
    var x = x2 - x1;
    //find vertical distance (y)
    var y = y2 - y1;
    //do calculation
    var hyp = Math.sqrt(x*x + y*y);
    return hyp;
}

function radiansToDegrees(rad){
    var deg = rad * (180/Math.PI) 
    return deg;
}

function degreesToRadians(deg)
{
    var rad = deg * Math.PI / 180;
    return rad;
}

