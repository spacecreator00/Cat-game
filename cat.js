window.addEventListener('keydown', (e) => {
    if (e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
    }
});

let title = document.querySelector(".game-title");
let fieldRecord = document.querySelector(".record");
let playBtn = document.querySelector(".play");
let hintControl = document.querySelector(".press-enter");

let board;
let boardWidth = 750;
let boardHeight = 398;
let context;

let catWidth = 88;
let catHeight = 94;
let catX = 50;
let catY = boardHeight - catHeight;

let cat = {
    x: catX,
    y: catY,
    width: catWidth,
    height: catHeight
}

let catImg;
let background;

let gameObstaclesArray = [];

let obstacle1Width = 63;
let obstacle2Width = 70;
let obstacle3Width = 102;
let obstacleHeight = 70;
let obstacleX = 700;
let obstacleY = boardHeight - obstacleHeight;
let obstacle1Img;
let obstacle2Img;
let obstacle3Img;

let velocityX = -8;
let velocityY = 0;
let gravity = .4;

let gameOver = false;
let score = 0;
let catImages = ['./img/cat_run1.png', './img/cat_run2.png'];
let indexImagesItem = 0;
let intervalRun;

function playGame() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    fieldRecord.textContent = localStorage.getItem('record');
    background = new Image();
    background.src = "./img/bg.png";
    background.onload = function () {
        context.drawImage(background, 0, 0);
    }

    catImg = new Image();

    obstacle1Img = new Image();
    obstacle1Img.src = "./img/petuh.png";

    obstacle2Img = new Image();
    obstacle2Img.src = "./img/pumpkin.png";

    obstacle3Img = new Image();
    obstacle3Img.src = "./img/bush.png";

    catRun();
    requestAnimationFrame(update);
    setInterval(placeObstacles, 1000);

    document.addEventListener("keydown", catJump);
}

window.onload = playGame;

function catRun() {
    if (gameOver) {
        return;
    }

    intervalRun = setInterval(() => {
        catImg.src = catImages[indexImagesItem];

        catImg.onload = function () {
            context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);
        }

        indexImagesItem++;
        if (indexImagesItem >= catImages.length) {
            indexImagesItem = 0;
        }
    }, 300);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    cat.y = Math.min(cat.y + velocityY, catY);
    context.drawImage(background, 0, 0);
    context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);

    for (let i = 0; i < gameObstaclesArray.length; i++) {
        let obstacle = gameObstaclesArray[i];

        obstacle.x += velocityX;
        context.drawImage(obstacle.img, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        if (detectCollision(cat, obstacle)) {
            gameOver = true;
            clearInterval(intervalRun);

            title.textContent = 'Game over';
        }
    }

    context.fillStyle = "black";
    context.font = "20px courier";
    score++;

    if (gameOver) {
        let record = localStorage.getItem('record');

        if (!record) {
            localStorage.setItem('record', score);
        }

        if (record && score > record) {
            localStorage.setItem('record', score);
            fieldRecord.textContent = score;
            fieldRecord.classList.add('blink');
            hintControl.classList.add('blink');

            setTimeout(() => {
                fieldRecord.classList.remove('blink')
                hintControl.classList.remove('blink')
            }, 3000);
        }

        hintControl.classList.add('blink');

        setTimeout(() => {
            hintControl.classList.remove('blink')
        }, 1000);

        playBtn.style.display = 'block';
        hintControl.style.display = 'block';
    }

    context.fillText(score, 5, 20);
}

function catJump(e) {
    if (gameOver) {
        return;
    }

    if ((e.code === "Space" || e.code === "ArrowUp") && cat.y === catY) {
        clearInterval(intervalRun);

        velocityY = -10;

        catImg = new Image();
        catImg.src = "./img/cat_jump.png";
        catImg.onload = function () {
            context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);
        }
    }

    setTimeout(() => {
        catRun();
    }, 450);
}

function placeObstacles() {
    if (gameOver) {
        return;
    }

    let obstacle = {
        img: null,
        x: obstacleX,
        y: obstacleY,
        width: null,
        height: obstacleHeight
    }

    let placeObstacleChance = Math.random(); //0 - 0.9999...

    if (placeObstacleChance > .90) { //10% obstacle3
        obstacle.img = obstacle3Img;
        obstacle.width = obstacle3Width;
        gameObstaclesArray.push(obstacle);
    } else if (placeObstacleChance > .70) { //30% obstacle2
        obstacle.img = obstacle2Img;
        obstacle.width = obstacle2Width;
        gameObstaclesArray.push(obstacle);
    } else if (placeObstacleChance > .50) { //50% obstacle1
        obstacle.img = obstacle1Img;
        obstacle.width = obstacle1Width;
        gameObstaclesArray.push(obstacle);
    }

    if (gameObstaclesArray.length > 5) {
        //удаяем первый элемент массива, не допускаем постоянный рост массива
        gameObstaclesArray.shift();
    }
}

function detectCollision(cat, obstacle) {
    return cat.x < obstacle.x + obstacle.width &&  //верхний левый угол cat не достигает верхнего правого угла obstacle
        cat.x + cat.width > obstacle.x &&   //верхний правый угол cat проходит через верхний левый угол obstacle
        cat.y < obstacle.y + obstacle.height &&  //верхний левый угол cat не достигает нижнего левого угла obstacle
        cat.y + cat.height > obstacle.y; //нижний левый угол cat проходит через верхний левый угол obstacle
}

playBtn.addEventListener('click', function () {
    location.reload();
});

document.addEventListener('keydown', function (e) {
    if (e.code === "Enter" && gameOver) {
        location.reload();
    }
});