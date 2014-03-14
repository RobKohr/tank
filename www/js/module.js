var module = function () {
    var exports = {};
    // your code goes here
    exports.bla = 'hello world';

    exports.set = function(new_bla){
        exports.bla = new_bla;
    }

    exports.test = function(){
        console.log(exports.bla);
    };
    return exports;
}

if(typeof(exports)!='undefined'){
    exports = module();//for node.js
}

