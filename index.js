var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var axesHelper = new THREE.AxesHelper( 100 );
scene.add( axesHelper );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor ( 0xffffff );
document.body.appendChild( renderer.domElement );

camera.position.x = 35;
camera.position.y = 70;
camera.position.z = 70;

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



cube_arr = {}

first_pos_x = 0
first_pos_z = 0
cube_size = 5
margin = 2

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


for (i=0; i < 25; i++){
    var cube = new THREE.Mesh(cube_geo, new THREE.MeshPhongMaterial( { color: 0xff0000, wireframe: false } ));
    cube_arr[i] = cube
    cube.position.x = (i % 5 * (cube_size + margin)) + (first_pos_x + 0.5 * cube_size )
    cube.position.z = (Math.floor(i / 5) * (cube_size + margin)) + (first_pos_z + 0.5 * cube_size )
    scene.add(cube)
}

console.log(cube_arr)

function animate(time){
    requestAnimationFrame( animate );

    renderer.render(scene, camera);
}

animate()