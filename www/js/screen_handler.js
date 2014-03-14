$(document).ready(function() {
    function showHash(){
        var req = {data:{errors:[]}};
        $('.screens > div').hide();
        var hash = window.location.hash;
        hash = hash.split('?');
        var params = '';
        if(hash[1]){
            params = hash[1]
        }
        req.screen = hash[0].replace('#', '');
        if((!req.screen)||(req.screen=='')){
            req.screen = 'home';
        }
        params = params.split('&');
        req.params = {};
        for(var i = 0; i<params.length; i++){
            params[i] = params[i].split('=');
            console.log(params[i]);
            if(params[i].length==2){
                req.params[params[i][0]] = params[i][1];
            }
        }
        console.log(req);
        
        function next(){
            if(req.data.errors.length){
                var errors = '<p>'+req.data.errors.join('</p><p>')+'</p>';
                $('#errors').html(errors).show();
                setTimeout(function(){$('#errors').html(errors).hide();}, 1000);
            }
            $('#'+req.screen).show();
        }

        if(app[req.screen]){
            app[req.screen](req, next);
        }else{
            next();
        }
    }
    showHash();
    window.addEventListener("hashchange", showHash);    
});