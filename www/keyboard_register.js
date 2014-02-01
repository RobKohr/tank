game.controls = {};
game.control_adjust = function(params){
    for(key in params){
	if(key!='undefined'){
	    game.controls[key] = params[key];
	}
    }

    console.log(JSON.stringify(game.controls));
}



game.control_keys  = {
    'up arrow':['player_2_y', 1],
    'down arrow':['player_2_y', -1],
    'left arrow':['player_2_x', -1],
    'right arrow':['player_2_x', 1],
    'm':['player_2_fire', 1]
}
game.controls = {};

var key_event = function(evt){
    var char = key_codes[evt.keyCode];
    console.log(event.keyCode+'..'+char);
    if(!game.control_keys)
	return;
    if(!game.control_keys[char])
	return;
    var control_label = game.control_keys[char][0];
    var control_value = game.control_keys[char][1];
    var params = {};

    if(evt.type=='keydown')
	params[control_label]=control_value;
    else
	params[control_label]=0;
    game.control_adjust(params)
}

$(document).bind('keydown', key_event); 


$(document).bind('keyup', key_event); 


