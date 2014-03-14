
/////////
//begin canvas primatives
var ctx = {};
ctx_init = function(dom){
    ctx = dom.getContext('2d');
    ctx.clear = function(){
//	ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
//	ctx.fillRect(0, 0, ctx.width, ctx.height);
	ctx.clearRect(0,0,ctx.width,ctx.height);
    }


    ctx.centeredText = function(txt, x, y){
	width = ctx.measureText(txt).width;
	x = x - width/2;
	ctx.fillText(txt, x, y);
    }
    
    ctx.startRotatePlacement = function(origin_x, origin_y, angle){
	ctx.save();
	ctx.translate(origin_x, origin_y);
	ctx.rotate(angle);
    }
    
    ctx.endRotatePlacement = function(){
	ctx.restore();
    }
    ctx.images = {};
    ctx.placeRotatedImage = function(file, angle, x, y, width, height){
	ctx.startRotatePlacement(x, y, degreesToRadians(angle))
	ctx.image(file, -width/2, -height/2, width, height);
	ctx.endRotatePlacement();
    }

    ctx.image = function(file, x, y, width, height){
	var path = './assets/images/'+file;
	x = Math.round(x);
	y = Math.round(y);

	if((width)&&(!height))
	    height = width;

	if(ctx.images[path]==undefined){
	    ctx.images[path] = new Image();
	    ctx.images[path].src = path;
	    ctx.images[path].loaded = false;
	    ctx.images[path].onload = function(){  
		ctx.images[path].loaded = true;
	    }  
	}

	if(ctx.images[path].loaded){
	    if(width)
		ctx.drawImage(ctx.images[path], x, y, width, height);
	    else
		ctx.drawImage(ctx.images[path], x, y);
	}	
    }


    ctx.setFill = function(useFill){
	ctx.useFill = useFill;
    }
    ctx.setStyle = function(style){
	ctx.fillStyle = style;
    }
    ctx.fillOrStroke = function(){
	if(ctx.useFill){
	    ctx.fill();
	}else{
	    ctx.stroke();
	}
    }
    //this is already pre-centered on x, y
    ctx.circle = function(x1, y1, width){
	ctx.beginPath();
	var radius = width/2;
	ctx.arc(x1, y1, radius, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fillOrStroke();
	return this;
    }
    ctx.arrow = function(start_x, start_y, length, angle, start_offset){
	ctx.startRotatePlacement(start_x, start_y, angle);
	ctx.beginPath();
	ctx.moveTo(0, 0);
	if(start_offset)
	    ctx.moveTo(start_offset, 0);
	
	ctx.lineTo(length, 0);
	ctx.lineTo(length - 5, -5);
	ctx.moveTo(length, 0);
	ctx.lineTo(length - 5, 5);
	ctx.stroke();
	ctx.closePath();
	ctx.endRotatePlacement();
    }
}

//end canvas primatives
////////
