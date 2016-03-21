//Test n°1 - Screen size - https://trac.torproject.org/projects/tor/ticket/14098
var aWidth = screen.availWidth;
var aHeight = screen.availHeight;
var height = screen.height;
var width = screen.width;

var commonWidths = [800,1024,1152,1280,1440,1600,1680,1920,2560,3840];
var commonHeights = [600,720,768,800,900,1024,1050,1080,1200,1440,1600,2160];

var div = document.getElementById("test1");
var res1 = "Size:"+width+"x"+height+"<br>";
if((aWidth==1000 && aHeight==1000) || (width%200==0 && height%100==0 && width==2*height)){
    res1 += "Your browser is the Tor browser at one of the recommended size." ;
} else if(commonWidths.indexOf(width)> -1 && commonHeights.indexOf(height) > -1){
    res1 += "Your browser is not the Tor browser." ;
} else {
    res1 += "Your browser is probably the Tor browser but it is not at at one of the recommended size (1000x1000 or a multiple of 200x100).";
}
div.innerHTML =  res1;


//Test n°2 - Emoji test - Test that emojis are working - https://trac.torproject.org/projects/tor/ticket/18172
//Test the pixels line by line until the first line with a non-white pixel is found
//If a pixel of this line is different than RGBA(0,0,0,255), it means the emoji is working
//Aliasing will produce a pixel that is not purely black (not 100% opaque)
div = document.getElementById("test2");

var can1 = document.getElementById("can1");
var ctx1 = can1.getContext('2d');
ctx1.font = "20pt no-real-font-123";
ctx1.textBaseline = 'top';
ctx1.fillText("\ud83d\ude03", 0, 0);

var firstLineFound = false;
var emoji = false;
var nbLine = 0;
while(!firstLineFound && nbLine < 30){
    var data = ctx1.getImageData(0,nbLine,30,1).data;
    for(var i=0; i<data.length && !firstLineFound; i++){
        if(data[i] != 0){
            firstLineFound = true;
            if(data[i] != 255){
                emoji = true;
            }
        }
    }
    nbLine += 1;
}

if(emoji){
    div.innerHTML = "Emoji working";
} else {
    div.innerHTML = "Emoji not working";
}


//Test n°3
//Trackpad/mouse detection - http://jcarlosnorte.com/security/2016/03/06/advanced-tor-browser-fingerprinting.html
function scrollListener(e) {
    deltas.push(Math.max(e.deltaX, e.deltaY, e.deltaZ));
    if (deltas.length > 15) {
        var nbMultiple3 = 0;
        for (var i = 0; i < deltas.length; i++) {
            var nb = deltas[i];
            if (nb != 0 && nb % 3 == 0) {
                nbMultiple3 += 1;
            }
        }
        div = document.getElementById("test3");
        var res3 = "deltas : "+deltas.toString()+"<br>";
        if (nbMultiple3 > 3) {
            res3 += "Mouse detected (probably)";
        } else {
            res3 += "Trackpad detected (probably)";
        }
        div.innerHTML = res3;

        document.body.removeEventListener("wheel", scrollListener);
        document.getElementById("res").style.visibility = 'visible';
        document.getElementById("scroll").style.visibility = 'hidden';
    }
}
if(navigator.userAgent.indexOf("Chrome") == -1) {
    var deltas = [];
    document.body.addEventListener("wheel", scrollListener);
} else {
    document.getElementById("test3").innerHTML = "Chrome not supported";
    document.getElementById("res").style.visibility = 'visible';
    document.getElementById("scroll").style.visibility = 'hidden';
}

//Test n°4 - Test Canvas - Custom
//Test to see if the fallback font presents differences between devices
canvas = document.createElement("canvas");
ctx = canvas.getContext('2d');
ctx.font = "20pt no-real-font-123";

var res4 = "Font parameter : '20pt no-real-font-123'<br>";
res4 += "Size of 'Cwm fjordbank glyphs vext quiz' : "+ctx.measureText("Cwm fjordbank glyphs vext quiz").width;

//Emoji size between devices if emoji is present
if(emoji){
    res4 += "<br>Size of emoji with open mouth : "+ctx.measureText("\ud83d\ude03").width;
}
document.getElementById("test4").innerHTML = res4;


//Test n°5 - OS leak (Firefox problem) with Fonts size - Custom
ctx.font = "750pt no-real-font-123";
var size750 = ctx.measureText("A").width;
ctx.font = "1500pt no-real-font-123";
var size1500 = ctx.measureText("A").width;
ctx.font = "2000pt no-real-font-123";
var size2000 = ctx.measureText("A").width;

var res5;
if(size750 == size1500){
    res5 = "Firefox on Linux detected";
} else if(size1500 == size2000){
    if(size1500%1>0){
        res5 = "Firefox on Mac detected";
    } else {
        res5 = "Firefox on Windows detected";
    }
} else if(size750%1 >0){
    res5 = "Chrome on Windows or Mac detected (probably)";
} else {
    res5 = "Chrome on Linux detected (probably)";
}
document.getElementById("test5").innerHTML = res5;


//Test n°6 - OS leak (Firefox problem) with Date - https://trac.torproject.org/projects/tor/ticket/15473
var dateString = new Date().toLocaleString();
var res6 = dateString.toString() + "<br>";
if(navigator.userAgent.indexOf("Chrome") == -1) {
    var dateFormat = new Date().toLocaleFormat();
    res6 += dateFormat.toString() + "<br>";
    if(dateString == dateFormat){
        res6 += "Windows detected (probably)"
    }
}
document.getElementById("test6").innerHTML = res6;

//Test n°7 - OS leak (Firefox problem) with Math routine - https://trac.torproject.org/projects/tor/ticket/13018
function asinh(x) {
    if (x === -Infinity) {
        return x;
    } else {
        return Math.log(x + Math.sqrt(x * x + 1));
    }
}
function acosh(x) {
    return Math.log(x + Math.sqrt(x * x - 1));
}
function atanh(x) {
    return Math.log((1+x)/(1-x)) / 2;
}
function cbrt(x) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
}
function cosh(x) {
    var y = Math.exp(x);
    return (y + 1 / y) / 2;
}
function expm1(x) {
    return Math.exp(x) - 1;
}
function log1p(x) {
    return Math.log(1 + x);
}
function sinh(x){
    var y = Math.exp(x);
    return (y - 1/y) / 2;
}
function tanh(x) {
    if(x === Infinity) {
        return 1;
    } else if(x === -Infinity) {
        return -1;
    } else {
        var y = Math.exp(2 * x);
        return (y - 1) / (y + 1);
    }
}
var res7 = "asinh(1) = "+asinh(1)+"<br>";
res7 += "acosh(1e300) = "+acosh(1e300)+"<br>";
res7 += "atanh(0.5) = "+atanh(0.5)+"<br>";
res7 += "expm1(1)) = "+expm1(1)+"<br>";
res7 += "cbrt(100) = "+cbrt(100)+"<br>";
res7 += "log1p(10) = "+log1p(10)+"<br>";
res7 += "sinh(1) = "+sinh(1)+"<br>";
res7 += "cosh(10) = "+cosh(10)+"<br>";
res7 += "tanh(1)  = "+tanh(1) +"<br>";

document.getElementById("test7").innerHTML = res7;

////////////////////////////////////////////
//Test n°8 - JS benchmarking
//Test n°9 - Build ID??
//if("Firefox" in navigator.userAgent && navigator.buildID == "20000101000000"){
//    console.log("You are using Tor Browser on Windows");
//}

