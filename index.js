var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
var axesHelper = new THREE.AxesHelper( 100 );
// scene.add( axesHelper );

var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setClearColor ( 0xffffff );
document.body.appendChild( renderer.domElement );

camera.position.x = 1000;
camera.position.y = 1500;
camera.position.z = 1500;

var control = new THREE.OrbitControls(camera, renderer.domElement);
control.target.set(0,-500, 0)
control.enableDamping = true;
control.dampingFactor = 0.25;
control.enableZoom = true;
control.enableKeys = false;

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



num_cube = 3
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
is_animating = false
is_playing = true
cube_arr = []

var cube_geo = new THREE.BoxGeometry( cube_size, cube_size, cube_size );

var block_geo_horizontal = new THREE.BoxGeometry( cube_size, cube_size, cube_size * (num_cube+2) + margin * (num_cube+1) );
var block_geo_vertical = new THREE.BoxGeometry( cube_size * (num_cube+2) + margin * (num_cube+1), cube_size, cube_size );

var block_left = new THREE.Mesh(block_geo_horizontal, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));
var block_right = new THREE.Mesh(block_geo_horizontal, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));
var block_top = new THREE.Mesh(block_geo_vertical, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));
var block_bottom = new THREE.Mesh(block_geo_vertical, new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false } ));

block_left.position.z = block_left.geometry.parameters.depth/2 + first_pos_z - (cube_size + margin)
block_left.position.x = block_left.geometry.parameters.width/2 + first_pos_x - (cube_size + margin)
block_right.position.z = block_right.geometry.parameters.depth/2 + first_pos_z - (cube_size + margin)
block_right.position.x = block_right.geometry.parameters.width/2 + first_pos_x + (cube_size + margin) * num_cube
block_top.position.z = block_top.geometry.parameters.depth/2 + first_pos_z - (cube_size + margin)
block_top.position.x = block_top.geometry.parameters.width/2 + first_pos_x - (cube_size + margin)
block_bottom.position.z = block_bottom.geometry.parameters.depth/2 + first_pos_z + (cube_size + margin) * num_cube
block_bottom.position.x = block_bottom.geometry.parameters.width/2 + first_pos_x - (cube_size + margin)

scene.add(block_left);
scene.add(block_right);
scene.add(block_top);
scene.add(block_bottom);

new_game()

function animate(time){
    requestAnimationFrame( animate );

    renderer.render(scene, camera);
    control.update();
    
    TWEEN.update();
}

animate()

function new_game(){
    if (cube_arr.length > 0)
        for (i=0; i<Math.pow(num_cube, 2); i++)
            scene.remove(cube_arr[i].geometry)
    cube_arr = []
    for (i=0; i<Math.pow(num_cube, 2); i++)
        cube_arr.push(null);
    random_generate(true)
    is_playing = true
}

function random_generate(first_time=false){
    const initial_number = [2, 4]
    var null_position = []
    var selected_position = []
    for (i=0; i<Math.pow(num_cube, 2); i++){
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
        number = initial_number[Math.round(Math.random()*(initial_number.length-1))]
        cube_arr[val] = {
            number: number,
            geometry: create_cube(val, number)
        }
        scene.add(cube_arr[val].geometry)
    })

    count_score()
}

function create_cube(index, number){
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
    position = get_position(index)
    cube.position.x = position.x
    cube.position.z = position.z
    return cube
}

function count_score(){
    var score = 0
    cube_arr.forEach(function(item){
        if (item!=null)
            score += item.number
    });
    document.getElementById("score").innerHTML = score
}

function get_position(index){
    return {
        x : (index % num_cube * (cube_size + margin)) + (first_pos_x + 0.5 * cube_size ),
        z : (Math.floor(index / num_cube) * (cube_size + margin)) + (first_pos_z + 0.5 * cube_size ),
    }
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

function check_game_over(){
    for (y=0; y<num_cube; y++){
        for (x=0; x<num_cube; x++){
            pos = num_cube*y + x
            if (cube_arr[pos] == null)
                return false

            if (y > 0 && cube_arr[pos].number == cube_arr[pos-num_cube].number)
                return false
                
            if (y < num_cube-1 && cube_arr[pos].number == cube_arr[pos+num_cube].number)
                return false

            if (x > 0 && cube_arr[pos].number == cube_arr[pos-1].number)
                return false

            if (x < num_cube-1 && cube_arr[pos].number == cube_arr[pos+1].number)
                return false
        }
    }
    is_playing = false
    alert("Game Over!\nScore : "+document.getElementById("score").innerHTML)
    new_game()
    return true
}

function swipe_animation(cube, position_target, onComplete=null){
    var tween = new TWEEN.Tween(cube.position).to(position_target, 500)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .onUpdate(function(){
                        is_animating = true;
                    });
    tween.onComplete(function(){
        if (onComplete != null)
            onComplete()
        is_animating = false
    });
    return tween;
}

function combine_animation(cube, cube_target, new_cube){
    var tween = swipe_animation(cube, cube_target.position, function(){
        scene.remove(cube)
        scene.remove(cube_target)
        scene.add(new_cube)
    });
    return tween;
}

document.addEventListener("keydown", function(e){
    if(is_animating) return;

    switch(e.keyCode){
        case 37:
            //left
            if (!is_playing) return
            is_animating = true
            is_joined = false
            last_joined = false
            tween = null
            for (i=0; i<Math.pow(num_cube, 2); i++){
                if(last_joined) {last_joined = false; continue;}
                if(cube_arr[i] == null || i % num_cube == 0) continue;

                for (j=i-1; j>=Math.floor(i/num_cube)*num_cube; j--){
                    if (cube_arr[j] == null) continue;
                    if (cube_arr[j].number != cube_arr[i].number) break;

                    cube_arr[j].number += cube_arr[i].number
                    var new_cube = create_cube(j, cube_arr[j].number)
                    combine_animation(cube_arr[i].geometry, cube_arr[j].geometry, new_cube).start()

                    cube_arr[j].geometry = new_cube
                    cube_arr[i] = null
                    last_joined = true;
                    is_joined = true;
                    break;
                }
            }

            delay = is_joined?500:0
            is_moved = false
            var temp = []
            for (i=0; i<Math.pow(num_cube, 2); i++) temp.push(null);
            var idx = 0
            for (i=0; i<Math.pow(num_cube, 2); i++){
                if(i % num_cube == 0){
                    idx = i
                }
                if(cube_arr[i] == null) continue;
                temp[idx] = cube_arr[i]
                
                swipe_animation(cube_arr[i].geometry, get_position(idx)).delay(delay).start()
                if (i != idx)
                is_moved = true
                idx++
            }

            cube_arr = temp
            delay += is_moved?500:0
            if (is_moved || is_joined)
                setTimeout(random_generate, delay)
            is_animating = false
            check_game_over()
            break;
        case 38:
            //top
            if (!is_playing) return
            is_animating = true
            is_joined = false
            last_joined = false
            tween = null
            for (x=0; x<num_cube; x++){
                for (y=0; y<num_cube; y++){
                    i = num_cube*y + x
                    
                    if(last_joined) {last_joined = false; continue;}
                    if(cube_arr[i] == null || y == 0) continue;

                    for (v=y-1; v>=0; v--){
                        j = num_cube*v + x
                        
                        if (cube_arr[j] == null) continue;
                        if (cube_arr[j].number != cube_arr[i].number) break;

                        cube_arr[j].number += cube_arr[i].number
                        var new_cube = create_cube(j, cube_arr[j].number)
                        combine_animation(cube_arr[i].geometry, cube_arr[j].geometry, new_cube).start()

                        cube_arr[j].geometry = new_cube
                        cube_arr[i] = null
                        last_joined = true;
                        is_joined = true;
                        break;
                    }
                }
            }

            delay = is_joined?500:0

            is_moved = false
            var temp = []
            for (i=0; i<Math.pow(num_cube, 2); i++) temp.push(null);
            var idx = 0, idx_i = 0
            for (x=0; x<num_cube; x++){
                for (y=0; y<num_cube; y++){
                    i = num_cube*y + x
                    
                    if(y == 0){
                        idx_i = y
                        idx = num_cube*idx_i + x
                    }

                    if(cube_arr[i] == null) continue;
                    temp[idx] = cube_arr[i]
                    
                    swipe_animation(cube_arr[i].geometry, get_position(idx)).delay(delay).start()
                    if (i != idx)
                        is_moved = true
                    idx_i++
                    idx = num_cube*idx_i + x
                }
            }

            cube_arr = temp
            delay += is_moved?500:0
            if (is_moved || is_joined)
                setTimeout(random_generate, delay)
            is_animating = false
            check_game_over()
            break;
        case 39:
            //right
            if (!is_playing) return
            is_animating = true
            is_joined = false
            last_joined = false
            tween = null
            for (i=Math.pow(num_cube, 2)-1; i>=0; i--){
                if(last_joined) {last_joined = false; continue;}
                if(cube_arr[i] == null || i % num_cube == num_cube-1) continue;

                for (j=i+1; j<=Math.floor(i/num_cube)*num_cube + (num_cube-1); j++){
                    if (cube_arr[j] == null) continue;
                    if (cube_arr[j].number != cube_arr[i].number) break;

                    cube_arr[j].number += cube_arr[i].number
                    var new_cube = create_cube(j, cube_arr[j].number)
                    combine_animation(cube_arr[i].geometry, cube_arr[j].geometry, new_cube).start()

                    cube_arr[j].geometry = new_cube
                    cube_arr[i] = null
                    last_joined = true;
                    is_joined = true;
                    break;
                }
            }

            delay = is_joined?500:0
            is_moved = false
            var temp = []
            for (i=0; i<Math.pow(num_cube, 2); i++) temp.push(null);
            var idx = Math.pow(num_cube,2) - 1
            for (i=idx; i>=0; i--){
                if(i % num_cube == num_cube - 1){
                    idx = i
                }
                if(cube_arr[i] == null) continue;
                temp[idx] = cube_arr[i]
                
                swipe_animation(cube_arr[i].geometry, get_position(idx)).delay(delay).start()
                if (i != idx)
                    is_moved = true
                idx--
            }

            cube_arr = temp
            delay += is_moved?500:0
            if (is_moved || is_joined)
                setTimeout(random_generate, delay)
            is_animating = false
            check_game_over()
            break;
        case 40:
            //bottom
            if (!is_playing) return
            is_animating = true
            is_joined = false
            last_joined = false
            tween = null
            for (x=num_cube-1; x>=0; x--){
                for (y=num_cube-1; y>=0; y--){
                    i = num_cube*y + x
                    
                    if(last_joined) {last_joined = false; continue;}
                    if(cube_arr[i] == null || y == num_cube-1) continue;

                    for (v=y+1; v<num_cube; v++){
                        j = num_cube*v + x
                        
                        if (cube_arr[j] == null) continue;
                        if (cube_arr[j].number != cube_arr[i].number) break;

                        cube_arr[j].number += cube_arr[i].number
                        var new_cube = create_cube(j, cube_arr[j].number)
                        combine_animation(cube_arr[i].geometry, cube_arr[j].geometry, new_cube).start()

                        cube_arr[j].geometry = new_cube
                        cube_arr[i] = null
                        last_joined = true;
                        is_joined = true;
                        break;
                    }
                }
            }

            delay = is_joined?500:0

            is_moved = false
            var temp = []
            for (i=0; i<Math.pow(num_cube, 2); i++) temp.push(null);

            var idx = 0, idx_i = 0
            for (x=num_cube-1; x>=0; x--){
                for (y=num_cube-1; y>=0; y--){
                    i = num_cube*y + x
                    
                    if(y == num_cube-1){
                        idx_i = y
                        idx = num_cube*idx_i + x
                    }

                    if(cube_arr[i] == null) continue;
                    temp[idx] = cube_arr[i]
                    
                    swipe_animation(cube_arr[i].geometry, get_position(idx)).delay(delay).start()
                    if (i != idx)
                        is_moved = true
                    idx_i--
                    idx = num_cube*idx_i + x
                }
            }

            cube_arr = temp
            delay += is_moved?500:0
            if (is_moved || is_joined)
                setTimeout(random_generate, delay)
            is_animating = false
            check_game_over()
            break;
    }
})