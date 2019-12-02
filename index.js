var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
var axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );

var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor ( 0xffffff );
document.body.appendChild( renderer.domElement );

camera.position.x = 1200;
camera.position.y = 2000;
camera.position.z = 2000;

var control = new THREE.OrbitControls(camera, renderer.domElement);
control.enableDamping = true;
control.dampingFactor = 0.25;
control.enableZoom = true;

var keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
keyLight.position.set(-100, 0, 100);

var toplight = new THREE.DirectionalLight(0xffffff, 1.0);
toplight.position.set(0, 100, 100);

var fillLight = new THREE.DirectionalLight(0xffffff, 0.75);
fillLight.position.set(100, -100, 100);

var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();

scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);
scene.add(toplight);



cube_arr = []
for (i=0; i<25; i++)
    cube_arr.push(null);

first_pos_x = 0
first_pos_z = 0
cube_size = 200
margin = 50
var colors = {
    2:'#9c2f1c',
    4:'#9c5e1c',
    8:'#9c981c',
    16:'#6d9c1c',
    32:'#409c1c',
    64:'#1c9c49',
    128:'#1c9c8d',
    256:'#1c629c',
    512:'#1c229c',
    1024:'#451c9c',
    2048:'#7e1c9c',
    4096:'#9c1c4f'
};

var cube_geo = new THREE.BoxGeometry( cube_size, cube_size, cube_size );

var block_geo_horizontal = new THREE.BoxGeometry( cube_size, cube_size, cube_size * 7 + margin * 6 );
var block_geo_vertical = new THREE.BoxGeometry( cube_size * 7 + margin * 6, cube_size, cube_size );

var block_left = new THREE.Mesh(block_geo_horizontal, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));
var block_right = new THREE.Mesh(block_geo_horizontal, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));
var block_top = new THREE.Mesh(block_geo_vertical, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));
var block_bottom = new THREE.Mesh(block_geo_vertical, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));

block_left.position.z = block_left.geometry.parameters.depth/2 + first_pos_z - (cube_size + margin)
block_left.position.x = block_left.geometry.parameters.width/2 + first_pos_x - (cube_size + margin)
block_right.position.z = block_right.geometry.parameters.depth/2 + first_pos_z - (cube_size + margin)
block_right.position.x = block_right.geometry.parameters.width/2 + first_pos_x + (cube_size + margin) * 5
block_top.position.z = block_top.geometry.parameters.depth/2 + first_pos_z - (cube_size + margin)
block_top.position.x = block_top.geometry.parameters.width/2 + first_pos_x - (cube_size + margin)
block_bottom.position.z = block_bottom.geometry.parameters.depth/2 + first_pos_z + (cube_size + margin) * 5
block_bottom.position.x = block_bottom.geometry.parameters.width/2 + first_pos_x - (cube_size + margin)

console.log(block_left.geometry.parameters)

scene.add(block_left);
scene.add(block_right);
scene.add(block_top);
scene.add(block_bottom);

random_generate(true)

function animate(time){
    requestAnimationFrame( animate );

    renderer.render(scene, camera);
}

animate()

function random_generate(first_time=false){
    var null_position = []
    var selected_position = []
    for (i=0; i<25; i++){
        if (cube_arr[i] == null)
            null_position.push(i)
    }
    var num_box_to_generate = Math.ceil( Math.random() * (null_position.length>4 ? 4:null_position.length) )
    if (first_time && num_box_to_generate <= 1)
        num_box_to_generate += 1
    for (i=0; i<num_box_to_generate; i++){
        selected_position.push(...null_position.splice(Math.random()*null_position.length, 1))
    }
    
    selected_position.forEach(function(val, idx){
        cube_arr[val] = create_cube(val, 4096)
        scene.add(cube_arr[val])
    })
}

function create_cube(position, number){
    var cube_color = colors[number]
    const texture = getTexture(cube_size, cube_size, 20, 125, number.toString(), "#ffffff", "Bold 80px Arial", cube_color);
    var materials = [
        new THREE.MeshPhongMaterial( { color: cube_color, wireframe: false } ),
        new THREE.MeshPhongMaterial( { color: cube_color, wireframe: false } ),
        new THREE.MeshLambertMaterial({map: texture}),
        new THREE.MeshPhongMaterial( { color: cube_color, wireframe: false } ),
        new THREE.MeshPhongMaterial( { color: cube_color, wireframe: false } ),
        new THREE.MeshPhongMaterial( { color: cube_color, wireframe: false } ),
    ];
    console.log(texture);
    var cube = new THREE.Mesh(cube_geo, new THREE.MeshFaceMaterial( materials ));
    cube.position.x = (position % 5 * (cube_size + margin)) + (first_pos_x + 0.5 * cube_size )
    cube.position.z = (Math.floor(position / 5) * (cube_size + margin)) + (first_pos_z + 0.5 * cube_size )
    return cube
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
        case 4: left = 15;
            break;
    }
    
    var canvas = document.createElement('canvas');
    canvas.width = Twidth;
    canvas.height = Theight;
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