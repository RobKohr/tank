

// If you want to prevent dragging, uncomment this section
function preventBehavior(e) 
{ 
    e.preventDefault(); 
};
document.addEventListener("touchmove", preventBehavior, false);

touchmove = function(event){
    event.preventDefault();
}

current_touches = []

/* center x, center y, max distance, max sensitivity distance 
(sensitivity distance is less than max distance */
game.bottom = 480;
game.right = 320;
var side_pad = 57;
game.touch_regions = 
    {
	player_1:{xy:[side_pad, game.bottom - side_pad, 80, 30],fire:[game.right-side_pad, game.bottom-side_pad, 50, 50]},
	player_2:{xy:[game.right-side_pad, side_pad, 80, 30],fire:[side_pad, side_pad, 50, 50]}
    }

game.player_flip = 
    {
	'player_1':{x:1, y:1},
	'player_2':{x:-1, y:-1}
    };


function touchHandler(event)
{
    if(event.type=='mousemove'){
	event.touches = [{pageX:event.pageX, pageY:event.pageY}];
    }
    event.preventDefault();
    var debug = '';
    var touch = '';
    var x = 0; var y = 0;
    var new_controls = {};
    for( i in game.players ){
	player = game.players[i];
	new_controls[player+'_x'] = 0;
	new_controls[player+'_y'] = 0;
	new_controls[player+'_px'] = 0;
	new_controls[player+'_py'] = 0;
	new_controls[player+'_fire'] = 0;
    }

    for( i in event.touches){
	touch = event.touches[i];
	x = touch.pageX;
	y = touch.pageY;
    }

//    debug = debug + 'touches <br>';
    var player_region, center_distance, region, x_dist, y_dist;
    for( i in event.touches){
	touch = event.touches[i];
	x = touch.pageX;
	y = touch.pageY;
	for( player in game.touch_regions ){
	    player_region = game.touch_regions[player];
	    for( region_name in player_region ){
		region = player_region[region_name];
		center_distance = distance(region[0], region[1], x, y);
		if(center_distance <  (region[2]*1.3)){
		    if(region_name == 'xy'){
			x_dist = x - region[0];
			y_dist = y - region[1];
			var angle = xyToAngle(x_dist, y_dist);
			x_ctr = 0;
			y_ctr = 0;
			var sens = 60;
			var dead_zone = 10;
			if (( angle > (360 - sens) ) || ( angle < sens ))
			    y_ctr = 1 * game.player_flip[player]['y'];
			if (( angle > (180-(sens))) && ( angle < (180+(sens))))
			    y_ctr = -1  * game.player_flip[player]['y'];
			if (( angle > (90 - sens) ) && (angle < (90 + sens) ))
			    x_ctr = 1 * game.player_flip[player]['x'];
			if ((angle > (270 - sens)) && (angle < (270 + sens)))
			    x_ctr = -1 * game.player_flip[player]['x'];

			if(distance(0, 0, x_dist, y_dist)<dead_zone){
			    x_ctr = 0;
			    y_ctr = 0;
			}
			
			//extend down y dead zone
			if((y_ctr == -1)&&(x_ctr!=0)){
			    if(Math.abs(y_dist)<25){
				y_ctr = 0;
			    }
			}
			    
			
			new_controls[player+'_x'] = x_ctr;
			new_controls[player+'_y'] = y_ctr;
		    }
		    if(region_name == 'fire'){
			new_controls[player+'_fire'] = 1;
			game.fire(player);
		    }
//		    debug = debug+'('+player+'--'+region_name+'--'+center_distance+'--)<br>';
		}
	    }
	}

//	debug = debug + touch.pageX + ', '+touch.pageY+'<br>';	

    }
    game.controls = new_controls;
    $('#debug').html(debug);
}


function selectedStart(){
    return false;
}

function onBodyLoad()
{
    document.getElementById('game').style.display = 'block'
    document.getElementById('welcome').style.display = 'none';
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("mousemove", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);    
    document.addEventListener("selectstart", selectedStart, false);


    document.getElementById('canvas').ontouchstart = function(evt){


    }
}

/* When this function is called, PhoneGap has been initialized and is ready to roll */
function onDeviceReady()
{
    document.addEventListener("deviceready",onDeviceReady,false);
}

