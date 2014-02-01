game = {};
game.init = function(dom_id){
}
game.click = function(evt){
    if (
	(evt.pageX >= 0 && evt.pageX <= ctx.width)
	    &&
	    (evt.pageY >= 0 && evt.pageY <= ctx.height)
    ){
	log('in');
	var x = evt.pageX;
	var y = evt.pageY;
	game.handleClick(x, y);
    }else{
	//not in canvas
	return;
    }
}

var walls = {};
var wall_size = 10;
game.handleClick = function(x, y){
    Math.round(x/wall_size)*wall_size;
}

$(document).ready(function(){
    var dom = document.getElementById('canvas');
    ctx_init(dom);
    var canvas = $(dom);
    ctx.width = ctx.canvas.width;
    ctx.height =  ctx.canvas.height;
    canvas.click(game.click); 
    game.init();
});