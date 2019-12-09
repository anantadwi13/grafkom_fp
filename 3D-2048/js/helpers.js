function get3DArray(n){
    var arr = [];
    for(var i = 0;i<n;++i){
        arr[i] = [];
        for(var j = 0; j < n; ++j)
            arr[i][j] = [];
    }
    return arr;
}

function getCanvas(Twidth, Theight){
    var canvas = document.createElement('canvas');
    canvas.width = Twidth;
    canvas.height = Theight;
    return canvas;
}

function getTexture(Twidth, Theight, left, top, text, style, font, backColor) {
    switch(text.length)
    {
        case 1: left = 75;
            break;
        case 2: left = 55;
            break;
        case 3: left = 30;
            break;
    }
    var canvas = getCanvas(Twidth,Theight);
    var g = canvas.getContext('2d');

    g.font = font;
    g.fillStyle = backColor;
    g.fillRect(0,0,Twidth,Theight);
    g.fillStyle = style;
    g.fillText(text, left, top);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function getCube(a,b,c, texture){
    return new THREE.Mesh(
        new THREE.BoxGeometry(a,b,c),
        new THREE.MeshLambertMaterial({map: texture, transparent:true, opacity:1})
    );
}

function getRandomNumber(range){
    return Math.floor((Math.random()*1000)%range);
}

function convertToCanvasCoordinates(x,cubeNum,cubeWidth){
    return (x-((cubeNum-1)*0.5))*cubeWidth;
}

function deleteArrayItem(arr,obj){
    for (var n = 0 ; n < arr.length ; n++) {
        if (arr[n] == obj) {
            var removedObj = arr.splice(n,1);
            removedObj = null;
            break;
        }
    }
}