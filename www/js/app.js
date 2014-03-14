var app_module = function(){
    var app = {};
    app.canvases = {};

    app.init = function(){
        var view_port = {width:20, height:30, tile_size:20};
        app.canvases.terrain = canvas_module({container:'game_screen', id:'terrain', view_port:view_port});
        app.canvases.units = canvas_module({container:'game_screen', id:'units', view_port:view_port});
        app.keyboard = keyboard_module();
        app.touches = touches_module();
        app.mouse = mouse_module();
        var controls = {
            p_0_up:
            
        }

        app.controller = controller({keyboard:app.keyboard, touches:app.touches, mouse:app.mouse, controls:controls});
    }

    app.game = function(req, next){
        //this happens after game method is run (app.game.practice then app.game)
        app.draw_terrain('map_1');
        app.play_frames();
        try{
            app.game[req.params.type](req, next);
        }catch(e){
            req.data.errors.push('Game type not found');
            return next();
        }
    }

    app.draw_terrain = function(map){
        var file = 'maps/'+map+'.json';
        $.getJSON( file, function( data ) {
            app.canvases.terrain.drawTiles(data);            
            $(window).resize( function(){
                app.canvases.terrain.drawTiles(data);
            });//happens whenever screen is resized
        });
    }


    app.playing = null
    app.play_frames = function(){
        console.log('play_frames');
        if(app.playing){
            return;
        }
        app.playing = setInterval(app.play_frame, 1000);
    }



    app.play_frame = function(){
        app.update_units();

        console.log('play_frame', app.units);
        app.canvases.units.draw({objs:app.units});
        
    }

    app.update_units = function(){
        app.units = {
            player_0: {
                img:'images/units/tank/player_0_tank_270.png',
                x: 0, y:0, width:20
            },
            player_1: {
                img:'images/units/tank/player_1_tank_270.png',
                x: 10, y:15, width:20
            },
            player_2: {
                img:'images/units/tank/player_1_tank_270.png',
                x: 19, y:29, width:20
            }
        }

    }

    app.home = function(req, next){
        return next();
    }

    app.game.practice = function(req, next){
        console.log('practice game');
        return next()
    }
    return app;
}
var app = app_module();//There is only one app.