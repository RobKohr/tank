var game = function(){};
var tween_interval = (1/8)*1000; //fraction of second in ms
tween_interval = (1/20)*1000; //fraction of second in ms

game.sounds = [];

game.hideReset = function(){
    game.showing_reset = 0;
    $('#reset_button').hide();
    game.reset
}

game.showReset = function(){
    game.showing_reset = 1;
    $('#reset_button').show();
}

game.reset = function(){
    game.scores = {}
    game.scores.player_1 = 0;
    game.scores.player_2 = 0;
    game.win_score = 5;
    game.max_score = game.win_score-1;
    game.move_speed = 20;
    game.angle_speed = 60;
    game.bullets.speed = 70;

    //initialize tanks
    game.objects.tanks = 
	{
	    player_1:{x:20,y:ctx.height/2,angle:90}, 
	    player_2:{x:(ctx.width-20),y:(ctx.height/2),angle:270}
	};

    //inialize map
    if(!game.map_number)
	game.map_number = 0;
    game.map_number = game.map_number+1;
    game.number_of_maps = 8;
    if(lite_version)
	game.number_of_maps = 1;
    if(game.map_number > game.number_of_maps)
	game.map_number = 1;
    game.map_name = 'map'+game.map_number;
    $('#canvas').css('background-image', "url('assets/images/"+game.map_name+".png')");
    game.map = maps[game.map_name];
    game.objects.walls = game.map.walls;

    //initialize bullets
    game.objects.bullets=
	{
	};

    game.hideReset();
}

game.addSound = function(file){
    if(typeof(Media) !== 'undefined')
	game.sounds[file] = new Media('assets/sounds/'+file);
}
game.playSound = function(file){
    if(!Media)
	return;
    if(!game.sounds[file])
	game.addSound(file);
    if(game.sounds[file])
	game.sounds[file].play();
}

game.addSound('cannon.aif');
game.addSound('explosion.wav');

game.frame_count = 0;
game.updateFPS = function(){
    if(!game.fps_element){
	game.fps_element = $('#fps');
    }
    if(!game.frame_interval_start)
	game.frame_interval_start = getTime();
    if((getTime() - game.frame_interval_start)>10){
	if(game.fps)
	    game.old_fps = game.fps;
	game.frame_count = 0;
	game.frame_interval_start = getTime();
    }
    var elapsed = getTime() - game.frame_interval_start;
    game.frame_count = game.frame_count +1;
    game.fps = game.frame_count/elapsed;
    game.fps_element.text(Math.round(game.fps) + ' FPS');
    


}

game.init = function(dom_id){
    game.player_data = 
	{
	    'player_1':{color:'#0000ff'},	
	    'player_2':{color:'#ff0000'}
	};
    game.players = ['player_1', 'player_2'];
    
    game.player_data.player_1.score_location = [ ctx.width/2,  ctx.height-40, 0]
    game.player_data.player_2.score_location = [  ctx.width/2,  40, 180]


    game.useFill = true;
    game.fillColor  = '#000000';
    game.strokeColor  = '#000000';  
    game.objects = {};	
    game.timing = {};
    game.draw_order = ['terrain', 'bullets', 'tanks', 'explosions'];
    game.tile_width = 30;
    game.ship_width = 150*5/6;
    game.max_tween_distance = 4;//in tiles
    game.canvas_min_x = 0;
    game.canvas_max_x = 0;
    game.reset();
    return setInterval(game.draw, tween_interval);
}
game.init_mouse = function(){
    game.canvas_min_x = $("#canvas").offset().left;
    game.canvas_max_x = game.canvas_min_x+ ctx.width;
    game.canvas_min_y = $("#canvas").offset().top;
    game.canvas_max_y = game.canvas_min_y + ctx.height;
}

game.click = function(evt){
    if (
	(evt.pageX <= game.canvas_min_x && evt.pageX <= game.canvas_max_x)
	&&
	(evt.pageY <= game.canvas_min_y && evt.pageY <= game.canvas_max_y)
    ){
	var x = evt.pageX - game.canvas_min_x;
	var y = evt.pageY - game.canvas_min_y;
	game.handleClick(x, y);
    }else{
	//not in canvas
	return;
    }
}

game.handleClick = function(x, y){
    alert(x + ', ' + y);
}


$('#test').click(function(){
    alert('asdf');
    game.action('setActiveShip', {'ship_id':999})
});

game.action = function(action, params){
    data = JSON.stringify({'action':action, 'params':params});
    socket.send(data);
}

//update objects
game.updateObjects = function(updated_objects){
    for(object_type in updated_objects){
	game.updateTiming(object_type);
	if(game.objects[object_type]==undefined){
	    game.updateObjects[object_type](updated_objects[object_type]);
	}else{
	    //remove objects that are not in updated set
	    game.removeOldObjects(object_type, updated_objects);
	    game.updateObjects[object_type](updated_objects[object_type]);
	}
    }
}

game.removeOldObjects = function(object_type, updated_objects){
    for(key in game.objects[object_type]){
	if(updated_objects[object_type][key] == undefined){
	    log('removing old object of type '+object_type+'and key'+key);
	    delete game.objects[object_type][key];
	}
    }
}

game.updateObjects.ship = function(updated_objects){
    game.updateObjects.generic('ship', updated_objects, ['x', 'y', 'angle']);
}

game.updateObjects.generic = function(object_type, updated_objects, tween_params){
    for(key in updated_objects){
	var object = updated_objects[key];
	if(game.objects[object_type] == undefined){
	    game.objects[object_type] = {}
	}
	if(game.objects[object_type][key] == undefined){
	    //initialize
	    if(tween_params)
		game.updateTween(tween_params, object);
	    game.objects[object_type][key] = object;
	}else{
	    //update
	    var old_object = game.objects[object_type][key];
	    if(tween_params)
    		game.updateTween(tween_params, object, old_object);
	    game.objects[object_type][key] = object;
	}
    }
}

game.updateTween = function(parameters, object, old_object){
    var tween = {};
    //changes continuously during motion between updates
    tween.current = {};
    //value of current display position at last update from server
    tween.at_update = {};
    if(old_object==undefined){
	//no old object, initialize
	for(i in parameters){
	    param = parameters[i];
	    tween.current[param] = object[param];
	    tween.at_update[param] = object[param];
	}
    }else{
	//update using old object values
	for(i in parameters){
	    param = parameters[i];
	    tween.current[param] = old_object.tween.current[param];
	    tween.at_update[param] = old_object.tween.current[param];
	}
    }
    object.tween = tween;
}



//timing
game.updateTiming = function(object_type){
    var time = getTime();
    if(game.timing[object_type] == undefined){
	game.initializeTiming(object_type);
	return;
    }else{
	//adjust timing
	var time_since_last_update = time -  game.timing[object_type].updated;
	if((time_since_last_update <0) || (time_since_last_update>5)){
	    //things are strange, lets start over
	    log('Error: reseting timing for '+object_type+'. Time since last update = '+time_since_last_update);
	    game.initializeTiming(object_type);
	    return;
	}
	if(time_since_last_update>(1/8))
	    time_since_last_update = 1/8;

	//running average
	game.timing[object_type].update_frequency = time_since_last_update;
	//prepare for next call
	game.timing[object_type].updated = time;
    }
}

game.initializeTiming = function(object_type){
    var time = getTime();
    game.timing[object_type] = {
	    updated: time,
	    update_frequency:0.5,
    };
}


////////
//draw sets of objects
game.draw = function(){
    ctx.clear();
    game.update_from_controls();
    game.draw.interface_objects();
    game.draw.scores();
    for (i in game.draw_order){
	var object_type = game.draw_order[i];
	if(game.objects[object_type]){
	    game.draw[object_type](game.objects[object_type]);//draw all objects of type
	}
    }
    game.updateFPS();
}
//x,y,angle

game.draw.scores = function(){
    for(player in  game.scores){
	var score_location = game.player_data[player].score_location;
	if(game.scores[player]>game.max_score)
	    game.draw.number('win', score_location[0], score_location[1], score_location[2]);
	else
	    game.draw.number(game.scores[player], score_location[0], score_location[1], score_location[2]);
    }
}


game.number = {};
game.number.width = Math.ceil(175/10);
game.number.height = 20;
game.draw.number = function(num, x, y, angle){ 
    if(num=='win')
	ctx.placeRotatedImage('you_win.png', angle, x, y, 100, 32)
    else
	ctx.placeRotatedImage('score_'+num+'.png', angle, x, y, 19, 32)
}

game.draw.interface_objects = function(){
    var x, y, xy_center, width, finger_x, finger_y;
    ctx.lineWidth = 2;

    for(player in game.touch_regions){
	var x, y, width, angle;

	xy_center = game.touch_regions[player]['xy'];
	x = xy_center[0];
	y = xy_center[1];
	width = 90;
	angle = 0;
	if(player=='player_2')
	    angle = 180;

	var x_ctr = game.controls[player+'_x'];
	var y_ctr = game.controls[player+'_y'];
	var img = player+'/dpad_up.png';
	if(y_ctr>0)
	    img = player+'/dpad_forward.png';
	if(y_ctr<0)
	    img = player+'/dpad_reverse.png';
	if(x_ctr>0)
	    img = player+'/dpad_right.png';
	if(x_ctr<0)
	    img = player+'/dpad_left.png';

	ctx.placeRotatedImage(img, angle, x, y, width, width);
	game.debug = {x:x_ctr, y:y_ctr, img:img};

	fire_center = game.touch_regions[player]['fire'];
	x = fire_center[0];
	y = fire_center[1];
	var status = 'up';
	if(game.controls[player+'_fire'])
	    status = 'active';	
	width = 40;
	var direct = 1;//nudge direction for fire button to line up properly
	if(player=='player_2')
	    direct = -1;
	
	ctx.placeRotatedImage(player+'/fire_button_'+status+'.png', angle, x+1*direct, y-1*direct, width, width);
    }


}

game.fire = function(player){
    if(!game.objects.bullets[player]){
	game.playSound('cannon.aif');
	game.objects.bullets[player] =
	    {x:game.objects.tanks[player]['x'],
	     y:game.objects.tanks[player]['y'],
	     angle:game.objects.tanks[player]['angle'],
	     created:getTime()
	    };
    }else{
	//click sound
    }
}

game.last_update_from_controls = getTime();
game.update_from_controls = function(){
    var time_since_last_update = getTime() - game.last_update_from_controls;
    game.last_update_from_controls = getTime();
    if(time_since_last_update>(1/8))
	time_since_last_update = 1/8;//prevent too big of a jump 
    var bullet;
    var time = getTime();
    var time_to_live = 3;
    for(player in game.scores){
	if(game.scores[player]>game.max_score){
	    $('#reset_button').show();
	    for(player in game.objects.bullets){
		delete game.objects.bullets[player];
	    }
	    return;
	}
    }

    for(player in game.objects.bullets){
	bullet = game.objects.bullets[player];
	bullet.angle = game.objects.tanks[player].angle;
	if((time - bullet.created)>time_to_live){
	    delete game.objects.bullets[player];
	    continue;
	}
	new_pos = getMovementXY(bullet, game.bullets.speed * time_since_last_update);
	new_pos_half = getMovementXY(bullet, (game.bullets.speed * time_since_last_update)/2);
	if(offScreen(new_pos, 0, 120, ctx.width, ctx.height-120) 
	   || (key = detectCollision(new_pos, game.bullets.collision_width, game.objects.walls, game.walls.collision_width))
	   || (key = detectCollision(new_pos_half, game.bullets.collision_width, game.objects.walls, game.walls.collision_width))
	  ){
	    //hit wall
	    delete game.objects.bullets[player];
	}else if(key = detectCollision(new_pos, game.bullets.collision_width, game.objects.tanks, game.tanks.collision_width, player)){
	    //hit tank
	    delete game.objects.bullets[player];
	    //blow up tank
	    game.destroyTank(key);
	    //increment score
	    game.incrementScore(player);
	}else{
	    bullet.x = new_pos.x;
	    bullet.y = new_pos.y;
	}
    }

    for(player in game.objects.tanks){
	tank = game.objects.tanks[player];
	var move = 0;
	//adjust angles
	if(game.controls[player + '_y']){
	    move = move + game.controls[player + '_y'];
	}
	if(game.controls[player + '_x']){
	    tank.angle = tank.angle + game.angle_speed *  game.controls[player + '_x'] * time_since_last_update
	    tank.angle = tank.angle % 360;
	}
	move = move * game.move_speed * time_since_last_update;
	new_pos = getMovementXY(tank, move);
	if(
	    offScreen(new_pos, 0, 120, ctx.width, ctx.height-120) 
		|| detectCollision(new_pos, game.tanks.collision_width, game.objects.walls, game.walls.collision_width)){
	    //crashed into wall (play sound?)
	}else{
	    tank.x = new_pos.x;
	    tank.y = new_pos.y;
	}
    }
}


game.incrementScore = function(player){
    if(!game.scores[player]){
	game.scores[player] = 0;
    }
    game.scores[player] = game.scores[player] + 1;
}

game.destroyTank = function(player){
    tank = game.objects.tanks[player];
    if(!game.objects.explosions)
	game.objects.explosions = {};
    game.objects.explosions[tank.x+'-'+tank.y] = {x:tank.x, y:tank.y, created:getTime()};
    game.playSound('explosion.wav');
    var angle = game.objects.tanks[player].angle;
    delete game.objects.tanks[player];
    game.resetTank(player, angle);
}

game.resetTank = function(player, angle){
    tank = {};
    if(!angle)
	tank.angle = Math.random()*359;
    else
	tank.angle = angle;
    var success = 0;
    while(!success){
	tank.x = Math.random()*ctx.width;
	tank.y = game.map.top + ( (game.map.bottom - game.map.top) * Math.random());
	if(detectCollision(tank, game.tanks.collision_width, game.objects.walls, game.walls.collision_width)){
	    //we placed on top of a wall... failure
	}else{
	    success = 1;
	}
    }
    game.objects.tanks[player] = tank;
}


game.walls = {};
game.walls.collision_width = 5;

game.draw.explosions = function(explosions){
    var width = 44;
    var max_age = 1;
    for(key in explosions){
	var explosion = explosions[key];
	if(getTime() > (explosion.created + max_age)){
	    delete explosions[key];
	    continue;
	}
	ctx.image('explosion.png', explosion.x - width/2, explosion.y-width/2, width, width);
    }
}

game.tanks = {};
game.tanks.width = 23;
game.tanks.collision_width = 13;
game.draw.tanks = function(tanks){
    for(key in tanks){
	var tank = tanks[key];
	var image_path = key+'_tank.png';
	ctx.placeRotatedImage(image_path, tank.angle, tank.x, tank.y, game.tanks.width, game.tanks.width);
    }
}

game.bullets = {};
game.bullets.width = 2;
game.bullets.collision_width = 2;
game.draw.bullets = function(bullets){
    var bullet;
    for(player in bullets){
	bullet = bullets[player];
	ctx.strokeStyle = game.player_data[player].color;
	ctx.fillStyle = game.player_data[player].color;
	ctx.useFill = true;
	ctx.lineWidth   = 2;
	ctx.circle(bullet.x, bullet.y, game.bullets.width*2);	
    }
}

game.draw.terrain = function(terrain){
    
}

game.draw.ship = function(ships){
    for(key in ships){
	var obj = ships[key];
	game.adjustTween(obj, 'ship')
	game.render.ship(obj);
    }
}
//end draw sets of objects
////////


game.adjustTween = function(obj, obj_type){
    if(
	(!obj.tween)
	    ||(!obj.tween.current)
	    ||(!obj.tween.at_update)
    ){
	return;//nothing to do here
    }
    var time = getTime();
    var timing = game.timing[obj_type];
    var portion = (time - timing.updated)/timing.update_frequency;
    var adjustment = 0;
    for(param in obj.tween.current){
	adjustment = (obj[param] - obj.tween.at_update[param])*portion;
	obj.tween.current[param] = obj[param];
	if(Math.abs(adjustment)>game.max_tween_distance){
	    obj.tween.current[param] = obj[param];
	}else{
	    obj.tween.current[param] =  obj.tween.at_update[param] + adjustment;
	}
    }
}

/////////
//render is to put one object on the screen

//general render function
game.render = function(obj){

}
game.render.ship = function(obj){

    var x = obj.tween.current.x;
    var y = obj.tween.current.y;

    var angle = obj.angle;
    if(!angle)
	angle = 360

    if(angle>360) 
	angle = angle-360;
    if(angle<0)
	angle = angle+360;
    var ship_width = game.ship_width;
    var tile_width = game.tile_width;
    var proportion = angle/360;
    var rounded_angle = (Math.round(proportion*8)/8)*360;
    if(rounded_angle == 360) rounded_angle = 0;
    var type = obj.type;
    if( (!type) || (type=='ship'))
	type = 'dhow';
    var ship_image_path = '/assets/images/ships/'+type+'/'+rounded_angle+'.png';
    var rounded_angle_offset = angle - rounded_angle;
    px = x*tile_width -tile_width/2;
    py = y*tile_width -tile_width/2;
    //start arrows
    if(obj.user_id == undefined)
	obj.user_id = -1;
    obj.active_ship = 1;//TEST
    if((obj.active_ship==1)&&(user_id==obj.user_id)){
	var arrow_length = ship_width*1.5/2;
	ctx.lineWidth   = 6;
	
	ctx.strokeStyle = 'rgba(255,0,0,0.3)';
	ctx.arrow(px, py, arrow_length, degreesToRadians(obj.desired_angle-90), ship_width*.5/2);
	useFill = false;
	ctx.lineWidth   = 10;
	ctx.strokeStyle = 'rgba(0,0,255,0.3)';
	ctx.circle(px, py, ship_width*1.2);
    }
    //end arrows

    ctx.startRotatePlacement(px, py, degreesToRadians(rounded_angle_offset))
    ctx.image(ship_image_path, -ship_width/2, -ship_width/2, ship_width, ship_width);
    ctx.endRotatePlacement();
    return;
}

$(document).ready(function(){
    var dom = document.getElementById('canvas');
    ctx_init(dom);
    var canvas = $(dom);
    ctx.width = ctx.canvas.width;
    ctx.height =  ctx.canvas.height;
    canvas.click(game.click); 
    game.init();
    game.init_mouse();
});