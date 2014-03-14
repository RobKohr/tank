var test = null;
//example var unit_canvas = canvas_module({container:'game', id='unit_canvas'});
// unit_canvas.draw({objs:units});
var canvas_module = function(params){    
    var container = $('#'+params.container);
    var width = container.width();
    var height = container.height();
    var html = '<canvas id="'+params.id+'" width="'+width+'" height="'+height+'">CANVAS element not supported</canvas>';
    container.append(html);
    var ctx = document.getElementById(params.id).getContext('2d');
    for(var key in params){
        ctx[key] = params[key];
    }
    ctx.container = container;
    ctx.clear = function(){
        ctx.clearRect(0,0,ctx.width, ctx.height);
    }

    ctx.adjust_viewport = function(){
        var view_port = ctx.view_port;
        var original_tile_size = view_port.tile_size;
        //calculate how big a tile should be in pixels
        var p_tile_width = Math.floor(ctx.width/view_port.width);
        var p_tile_height = Math.floor(ctx.height/view_port.height);
        //choose the minumum
        ctx.scaled_tile_size = p_tile_width<p_tile_height ? p_tile_width : p_tile_height;
        ctx.scaled_tile_size = Math.floor(ctx.scaled_tile_size);
        //figure out what scale we will be working with
        ctx.scale = Math.floor(ctx.scaled_tile_size / original_tile_size);
        //figure out the width of the view_port
        var p_width = original_tile_size * view_port.width;
        var p_height = original_tile_size * view_port.height;

        //move the viewport so it is centered on the screen
        ctx.offset_px = p_width<ctx.width ? Math.floor((ctx.width-p_width)/2) : 0;
        ctx.offset_py = p_height<ctx.height ? Math.floor((ctx.height-p_height)/2) : 0;        
    }

    ctx.fullscreen = function(){
        var width = ctx.width = ctx.container.width();
        var height = ctx.height = ctx.container.height();
        console.log('www', width, height);
        ctx.min_dimension = ctx.width; //used to calc square size
        if(ctx.height < ctx.width){
            ctx.min_dimension = ctx.height;
        }
        $('#'+ctx.id).attr('width', width);
        $('#'+ctx.id).attr('height', height);
        ctx.adjust_viewport();
    }
    ctx.fullscreen();
    $(window).resize(ctx.fullscreen);//happens whenever screen is resized


    ctx.draw = function(p){//p short for paramaters
        ctx.clear();
        //draw all of dah stuffs
        for(var key in p.objs){
            var obj = p.objs[key];
            if(!obj.width) obj.width = ctx.scaled_tile_size;
            if(!obj.height) obj.height = ctx.scaled_tile_size;
            var px = obj.x*ctx.scaled_tile_size + ctx.offset_px;
            var py = obj.y*ctx.scaled_tile_size + ctx.offset_py;
            ctx.drawImageUrl(obj.img, px, py, ctx.scaled_tile_size, ctx.scaled_tile_size);
        }
    }

    ctx.fetched_images = {};
    ctx.fetchImage = function(image_url){
        if(ctx.fetched_images[image_url]){
            return ctx.fetched_images[image_url];
        }
        var img = new Image();
        img.src = image_url;
        ctx.fetched_images[image_url] = img;
    }

    ctx.drawImageUrl = function(image_url, px, py, width, height){
        var img = ctx.fetchImage(image_url);
        if(!img){
            return;
        }
        ctx.drawImage(img, px, py, width, height);
    }
    //draw a tile map 
    ctx.drawTiles = function(data){
        var tileset = data.tilesets[0];
        var image_url = 'maps/'+tileset.image;
        tileset.img = new Image();
        tileset.img.onload = function(){
            var layer = data.layers[0];
            var ld = layer.data;
            var tile_size = tileset.tileheight;
            tileset.width = Math.floor(tileset.imagewidth/tile_size);
            tileset.height = Math.floor(tileset.imageheight/tile_size);
            for(var i = 0; i<ld.length; i++){
                var gid = ld[i];
                var tile_cords = ctx.index_to_xy(i, layer.width, layer.height);
                var sprite_cords = ctx.index_to_xy(gid-tileset.firstgid, tileset.width, tileset.height);
                ctx.drawSprite(tileset.img, ctx.scaled_tile_size, tile_size,
                               sprite_cords.x, sprite_cords.y,
                               tile_cords.x, tile_cords.y)
            }
        };
        tileset.img.src = image_url;
    }

    ctx.drawSprite = function(img, scaled_tile_size, tile_size, sx, sy, dx, dy){
        ctx.drawImage(img, 
                      sx*tile_size, sy*tile_size, tile_size, tile_size,
                      dx*scaled_tile_size+ctx.offset_px, dy*scaled_tile_size+ctx.offset_py, 
                      scaled_tile_size, scaled_tile_size
                     );
    }

    ctx.gid_to_xy = function(gid, tileset){
        var tile_size = tileset.tilewidth;
    }
    ctx.index_to_xy = function(i, width, height){
        var out = {};
        out.x = i % width;
        out.y = Math.floor(i/width);
        return out;
    }
    test = ctx;
    return ctx;
}
