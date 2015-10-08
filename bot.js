var Canvas = require('canvas');
var GIF = require('gifencoder');
var fs = require('fs');
var vm = require('vm');
var w = 320, h = 320;
var canvas = new Canvas(w,h);
var ctx = canvas.getContext('2d');

var creds = JSON.parse(fs.readFileSync('./creds.json'));

var Twitter = require('twitter');
var client = new Twitter(creds);


Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)];
}

var mod = function(x, y) {
    return x - y * Math.floor(x / y);
}


var pixelExpr = '';

var grammar = {
    'expr': function() { return ['Math.cos(expr)','Math.sin(expr)','expr-expr','expr*expr','expr+expr','expr%expr','Math.abs(expr)','Math.sqrt(expr)','Math.floor(expr)','Math.max(expr, expr)','Math.min(expr,expr)','Math.atan2(expr,expr)'].random(); },
    'number': function() { return (10*Math.random()).toFixed(2); },
    'var': function() { return ['x','y','t'].random(); }
};

var translate = {
    'Math.cos': 'cos',
    'Math.sin': 'sin',
    'Math.abs': 'abs',
    'Math.sqrt': 'sqrt',
    'Math.floor': 'flr',
    'Math.max': 'max',
    'Math.min': 'min',
    'Math.atan2': 'atan2'
};

var doTranslate = function(str) {
  Object.keys(translate).forEach(function(key) {
    str = str.replace(new RegExp(key, 'g'), translate[key]);
  });
  return str;
}

var genExpr = function() {
    var str = 'expr*expr*expr';
    var len = Math.floor(Math.random()*80+30);
    var iters = 0;
    while(str.length < len && iters < 50) {
        str = str.replace(/(expr)|(number)|(var)/g, function(repl) {
            return grammar[repl]();
        });
        iters++;
    }
    str = str.replace(/(expr)|(number)|(var)/g, function(repl) {
        if(Math.random() > 0.5) {
            return grammar['var']();
        } else {
            return grammar['number']();
        }
    });
    return str;
}


var colors = [
    'rgb(0,0,0)',
    'rgb(29,43,83)',
    'rgb(129,37,83)',
    'rgb(0,135,81)',
    'rgb(171,82,54)',
    'rgb(95,87,79)',
    'rgb(194,195,199)',
    'rgb(255,241,232)',
    'rgb(255,0,77)',
    'rgb(255,163,0)',
    'rgb(255,255,39)',
    'rgb(0,231,86)',
    'rgb(41,173,255)',
    'rgb(131,118,156)',
    'rgb(255,119,168)',
    'rgb(255,204,170)'
];

var i;
for(i=0; i<5; i++) {

var encoder = new GIF(w, h);
//encoder.createReadStream().pipe(fs.createWriteStream('test' + i + '.gif'));

encoder.start();
encoder.setRepeat(0);
encoder.setDelay(100);
encoder.setQuality(10);

var t, x, y;

var expr = genExpr();

ctx.fillStyle = '#000';
ctx.clearRect(0,0,w,h);

for(t=0; t<20; t++) {
    for(x=-w/2; x<w/2; x++) {
        for(y=-h/2; y<h/2; y++) {
            ctx.fillStyle = colors[mod(Math.abs(Math.floor(eval(expr))), colors.length)];
            ctx.fillRect(x+w/2, y+h/2, 1, 1);
        }
    }
    encoder.addFrame(ctx);
}

encoder.finish();
var buf = encoder.out.getData();
fs.writeFileSync('test' + i + '.gif', buf);
var tweet = doTranslate(expr) + ' #DZY';
console.log(tweet);

}

