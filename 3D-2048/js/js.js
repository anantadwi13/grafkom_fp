var colors = {
    2:'Grey',
    4:'Tomato',
    8:'Green',
    16:'Blue',
    32:'Gold',
    64:'wWhite',
    128:'BlueViolet',
    256:'Bisque',
    512:'Chocolate',
    1024:'CornflowerBlue',
    2048:'DarkCyan',
    4096:'GreenYellow',
};

(function () {
    var scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }),  // ({ alpha: true }),
    light = new THREE.AmbientLight(0xAAAAAA),
    camera = null,
    mainCanvas = renderer.domElement,
    group = new THREE.Group(),
    cubeNum = 4,
    newCubeNumPerClick = 1,
    cubeWidth = 30,
    multiSum = false,
    fallTime = 150,
    rotateTime = 300,
    rotateDegree= Math.PI/2,
    currentDirection = "",
    trackBallControll,
    gravityTweens =[],
    sumTweens =[],
    rotateTween, cubes,
    isAnimating = false;
    gameNum = 0, maxScore = 0, score = 0;
    var isPlaying = 0;

    function onkeydown( e ) {
        e.preventDefault();
        // console.log(isAnimating)
        if(isAnimating)
            return;
        switch (e.which) {
            /* left */     
            case 37: { 
                rotateCube('z',rotateDegree,rotateTime);
                currentDirection = "left";
                isAnimating = true;
            }
            break;
            /* up */     
            case 38: {
                rotateCube('x',-rotateDegree,rotateTime);
                currentDirection = "up";
                isAnimating = true;
            }
            break;
            /*right*/    
            case 39: {
                rotateCube('z',-rotateDegree,rotateTime);
                currentDirection = "right";
                isAnimating = true;
            }
            break;
            /* down */    
            case 40: {
                rotateCube('x',rotateDegree,rotateTime);
                currentDirection = "down";
                isAnimating = true;
            }
            break;
            default: return;
        }
        // console.log(currentDirection);
    }

    function resetCamera(){
        camera.position.z = 200;
        camera.position.x = 150;
        camera.position.y = 150;

        camera.rotation.set( 0, 0, 0, 'XYZ' );
        camera.lookAt(group.position);
        camera.fov = (cubeNum*cubeWidth) / 2.6;
        camera.updateProjectionMatrix();
    }

    function updateGameNum(){
        var gameNum = getGameNum();
        setGameNum(++gameNum);
        $('#gameNum').find('+span').text(getGameNum());
    }

    function newGame(){
        if (isPlaying == 0) {
            var myAudio = new Audio('../sound/ingame.mp3');
            myAudio.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
            myAudio.play();
            isPlaying = 1;
        }
        if(isAnimating)
            return;
        updateGameNum();
        cubeNum = document.getElementById('cubeNum').value;
        cubes = get3DArray(cubeNum);
        // console.log(cubes)
        score = 0;
        $('#score').find('+span').text(score);
        fallTime = cubeNum > 5 ? 70 : 140;
        newCubeNumPerClick = $('#newCubeNumPerClick').val();
        multiSum = $("#multiSum").find("+input[type='checkbox']").prop('checked');

        score = 0;
        $('#sore').find('+span').text(score);

        resetCamera();

        scene.remove(group);
        group = new THREE.Group();
        scene.add(group);
        addNewCubes();
    }

    function initEvents(){
        $('#resetCamera').on('click',resetCamera);
        $('#newGame').on('click',newGame);
        $(document).on('keydown',onkeydown);
    }

    function onRotationCompleted(){
        group.rotation = new THREE.Vector3(0,0,0);
        cubes = getRotatedArray(currentDirection);
        updateScene();

        rotateTween = null;
        gravity();
    }

    function resetMoved(){
        for (var x = 0; x < cubeNum; x++)
            for(var y = 0; y<cubeNum; y++)
                for (var z = 0; z < cubeNum; z++)
                    if(cubes[x][y][z] != undefined)
                        delete cubes[x][y][z].moved;
    }

    function getCubesNumToSum(){
        var addedNum = 0;
        for (var y = cubeNum-1; y>0; y--)
            for (var x = 0; x < cubeNum; x++)
                for (var z = 0; z < cubeNum; z++) {
                    if (cubes[x][y][z] != undefined &&
                        cubes[x][y-1][z] != undefined &&
                        cubes[x][y][z].number == cubes[x][y-1][z].number &&
                        cubes[x][y][z].moved == undefined &&
                        cubes[x][y-1][z].moved == undefined
                    ) {
                        addedNum++;
                    }
                }
        return addedNum;
    }

    function getCubesNumToMove(){
        var movedNum = 0;
        for (var x = 0; x < cubeNum; x++)
            for(var y = 1; y<cubeNum; y++)
                for (var z = 0; z < cubeNum; z++)
                    if (cubes[x][y][z] != undefined && cubes[x][y - 1][z] == undefined)
                        movedNum++;

        return movedNum;
    }

    function onSumAndGravityComplete(){
        isAnimating = false;
        resetMoved();
        addNewCubes();
    }

    cekSound = 0; level_score = 200;
    function updateScore(curScore){
        score += curScore;
        if (score>200 && score%level_score<(level_score/2) && cekSound == 0) {
            cekSound = 1; level_score *= 2;
            var audio = new Audio('../sound/increase_score.mp3');
            audio.play();
        }
        else if (score%level_score<(level_score/2) && cekSound == 1) {
        }
        else {
            cekSound = 0;
        }
        scoreLabel = $('#score').find('+span').text(score);
        if(score > getMaxScore()) {
            setMaxScore(score);
            $('#maxScore').find('+span').text(score);
        }
    }

    function sum(){
        var addedNum = 0;
        for (var y = 1; y < cubeNum; y++)
            for (var x = 0; x < cubeNum; x++)
                for (var z = 0; z < cubeNum; z++) {
                    if (cubes[x][y][z] != undefined && cubes[x][y-1][z] != undefined && 
                        cubes[x][y][z].number == cubes[x][y-1][z].number && cubes[x][y][z].moved == undefined &&
                        cubes[x][y-1][z].moved == undefined
                    )
                    {
                        addedNum++;

                        var nextCube = cubes[x][y-1][z];
                        var cube = cubes[x][y][z];
                        cube.number*=2;

                        updateScore(cube.number);

                        if(!multiSum){
                            cube.moved = true;
                            nextCube.moved = true;
                        }
                        var tween = new TWEEN.Tween(cube.position);
                        tween.to({'y': cube.position.y-cubeWidth},fallTime);

                        (function(e,x,y,z, tween){
                            tween.onComplete(function(){
                                group.remove(cubes[x][y-1][z]);

                                cubes[x][y-1][z] = cubes[x][y][z];
                                cubes[x][y][z] = undefined;

                                var tempTxtr = getTexture(200,200,10,125,cubes[x][y-1][z].number.toString(),"white", "Bold 80px Arial",colors[cubes[x][y-1][z].number]);
                                cubes[x][y-1][z].material = new THREE.MeshLambertMaterial({map: tempTxtr, transparent:true, opacity:1});
                                cubes[x][y-1][z].material.needsUpdate = true;

                                deleteArrayItem(sumTweens,tween);
                                if(sumTweens.length == 0)
                                    sum();
                            });
                        })(cube,x,y,z,tween);
                        sumTweens.push(tween);
                    }
                }

        if(addedNum == 0 && getCubesNumToMove() > 0)
            gravity();
        else
        if(addedNum == 0)
            onSumAndGravityComplete();

        for (x = 0; x < sumTweens.length; x++)
            sumTweens[x].easing(TWEEN.Easing.Linear.None).start();
    }

    function gravity(){
        var movedNum = 0;

        for (var x = 0; x < cubeNum; x++){
            for(var y = 1; y<cubeNum; y++){
                for (var z = 0; z < cubeNum; z++){

                    if (cubes[x][y][z] != undefined && cubes[x][y-1][z]==undefined){
                        movedNum++;

                        var cube = cubes[x][y][z];
                        var tween = new TWEEN.Tween(cube.position);
                        tween.to({'y': cube.position.y-cubeWidth},fallTime);

                        (function(e,x,y,z, tween){
                            tween.onComplete(function(){
                                cubes[x][y-1][z] = cubes[x][y][z];
                                cubes[x][y][z] = undefined;
                                deleteArrayItem(gravityTweens,tween);

                                if(gravityTweens.length == 0)
                                    gravity();
                            });
                        })(cube,x,y,z,tween);

                        gravityTweens.push(tween);
                    }
                }
            }
        }

        if(movedNum == 0 && getCubesNumToSum() > 0)
            sum();
        else
        if(movedNum == 0)
            onSumAndGravityComplete();

        for (x = 0; x < gravityTweens.length; x++)
            gravityTweens[x].easing(TWEEN.Easing.Linear.None).start();
    }

    function updateScene(){
        scene.remove(group);
        group = new THREE.Group();

        for (var x = 0; x < cubeNum; x++)
            for (var y = 0; y < cubeNum; y++)
                for (var z = 0; z < cubeNum; z++)
                    if (cubes[x][y][z] != undefined)
                        group.add(cubes[x][y][z]);

        group.updateMatrix();
        scene.add(group);
    }

    function rotateCube(axis, degree, duration){
        // allows change the values of the properties of an object in a smooth way
        rotateTween = new TWEEN.Tween(group.rotation);
        switch (axis)
        {
            case 'z':
            {
                rotateTween.to({'z' : group.rotation.z+degree}, duration);
            }
            break;
            case 'y':
            {
                rotateTween.to({'y' : group.rotation.y+degree}, duration);
            }
            break;
            case 'x':
            {
                rotateTween.to({'x' : group.rotation.x+degree}, duration);
            }
            break;
        }
        rotateTween.onComplete(onRotationCompleted);
        rotateTween.easing( TWEEN.Easing.Quadratic.InOut).start(); //Effect accelerating
    }

    function initScene(){
        $('#maxScore').find('+span').text(getMaxScore());
        $('#gameNum').find('+span').text(getGameNum());

        document.getElementById("game").appendChild(renderer.domElement);
        scene.add(light);
        camera = new THREE.PerspectiveCamera(
            45,1,1,1000
        );
        trackBallControll = new THREE.OrbitControls(camera, mainCanvas);
        scene.add(camera);
        render();
        initEvents();
        newGame();
    }

    function render(){
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        TWEEN.update();
        renderer.render(scene,camera);
        requestAnimationFrame(render);
    }

    function getFreePoints(){
        var freePoints = [];
        for (var x = 0; x < cubeNum; x++)
            for (var y = 0; y < cubeNum; y++)
                for (var z = 0; z < cubeNum; z++)
                    if (cubes[x][y][z] == undefined)
                        if(y==0 || cubes[x][y-1][z] != undefined)
                            freePoints.push(new THREE.Vector3(x,y,z));
        // console.log(freePoints);
        return freePoints;
    }

    function addNewCubes(){
        if(isAnimating)
            return;
        var num = newCubeNumPerClick;
        count_freePoints = getFreePoints().length;
        console.log(count_freePoints, getFreePoints());
        if(count_freePoints < num){
            var audio = new Audio('../sound/gameover.mp3');
            audio.play();
            alert("Game Over! Your Score: "+score);
            newGame();
        }
        for(var i = 0; i< num; i++)
            addNewCube();
    }

    function getCubeNumber(){
        if(Date.now() % 3 == 0)
            return 4;
        return 2
    }

    function addNewCube(){
        var freePoints = getFreePoints();
        var number = getRandomNumber(freePoints.length);
        var cubeNumber = getCubeNumber();

        var vec = freePoints[number];
        var tempTexture = getTexture(200,200,10,125,cubeNumber.toString(),"white", "Bold 80px Arial",colors[cubeNumber]);
        var cube = getCube(cubeWidth,cubeWidth,cubeWidth,tempTexture);
        cube.number = cubeNumber;
        group.add(cube);
        cubes[vec.x][vec.y][vec.z] = cube;

        cube.position.x = convertToCanvasCoordinates(vec.x, cubeNum, cubeWidth);
        cube.position.y = convertToCanvasCoordinates(vec.y, cubeNum, cubeWidth);
        cube.position.z = convertToCanvasCoordinates(vec.z, cubeNum, cubeWidth);
    }

    function getRotatedArray(dir){
        var tempArr= get3DArray(cubeNum);
        var coef = (cubeNum-1)*0.5;
        switch (dir)
        {
            case "right":
            {
                for (var x= 0; x < cubeNum; x++)
                {
                    for (var y = 0; y < cubeNum; y++)
                    {
                        for (var z = 0; z < cubeNum; z++)
                        {
                            tempArr[x][y][z] =cubes[cubeNum - y - 1][x][z];
                            if (tempArr[x][y][z] != undefined)
                            {
                                tempArr[x][y][z].position.x = (x-coef)*cubeWidth;
                                tempArr[x][y][z].position.y = (y-coef)*cubeWidth;
                                tempArr[x][y][z].position.z = (z-coef)*cubeWidth;
                            }
                        }
                    }
                }
            }
            break;
            case "left":
            {
                for (var x = 0; x < cubeNum; x++) {
                    for (var y = 0; y < cubeNum; y++) {
                        for (var z = 0; z < cubeNum; z++) {
                            tempArr[cubeNum - y - 1][ x][ z] = cubes[x][ y][ z];
                            if (tempArr[cubeNum - y - 1][x][z] != undefined)
                            {
                                tempArr[cubeNum - y - 1][x][z].position.x = ((cubeNum - y - 1)-coef)*cubeWidth;  //
                                tempArr[cubeNum - y - 1][x][z].position.y = (x-coef)*cubeWidth;
                                tempArr[cubeNum - y - 1][x][z].position.z = (z-coef)*cubeWidth;
                                // console.log(tempArr[cubeNum - y - 1][x][z].position);
                            }
                        }
                    }
                }
            }
            break;
            case "up":
            {
                for (var x = 0; x < cubeNum; x++) {
                    for (var y = 0; y < cubeNum; y++) {
                        for (var z = 0; z < cubeNum; z++) {
                            tempArr[x][ z][ cubeNum - y - 1] = cubes[x][ y][ z];
                            if (tempArr[x][ z][ cubeNum - y - 1] != undefined)
                            {
                                tempArr[x][ z][ cubeNum - y - 1].position.x = (x-coef)*cubeWidth;
                                tempArr[x][ z][ cubeNum - y - 1].position.y = (z-coef)*cubeWidth;
                                tempArr[x][ z][ cubeNum - y - 1].position.z = ((cubeNum - y - 1)-coef)*cubeWidth;
                            }
                        }
                    }
                }
            }
            break;
            case "down":
            {
                for (var x = 0; x < cubeNum; x++) {
                    for (var y = 0; y < cubeNum; y++) {
                        for (var z = 0; z < cubeNum; z++) {
                            tempArr[x] [y] [z] = cubes[x][ z][ cubeNum - y - 1];
                            if (tempArr[x][ y][ z] != undefined) {
                                tempArr[x][ y][ z].position.x = (x-coef)*cubeWidth;
                                tempArr[x][ y][ z].position.y = (y-coef)*cubeWidth;
                                tempArr[x][ y][ z].position.z = (z-coef)*cubeWidth;
                            }
                        }
                    }
                }
            }
            break;
        }
        return tempArr;
    }

    function getMaxScore(){
        return maxScore;
    }
    function setMaxScore(n){
        maxScore = n;
    }
    function getGameNum(){
        return gameNum;
    }
    function setGameNum(n){
        gameNum = n;
    }
    $(document).ready(initScene);
})();