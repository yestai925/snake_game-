//board
var blockSize = 25;
var rows = 20;
var cols = 20;
var board;
var context; 
//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;
var velocityX = 0;
var velocityY = 0;
var snakeBody = [];
//food
var foodX;
var foodY;
var gameOver = false;
var score = 0;
var maxScore = 0 ;
var gamePaused = false;
var backgroundMusic = document.getElementById("backgroundMusic");
var eatSound = document.getElementById("eatSound");
eatSound.play();
var specialBlockX;
var specialBlockY;
var specialBlockActive = false;
var specialBlockTimer;
var specialBlockTimerStartTime; // 记录特殊方块生成的时间


window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board
    placeFood();
    document.addEventListener("keyup", changeDirection);
    };
    // update();
    setInterval(update, 1000/7); //100 milliseconds 
    document.addEventListener("click", function() {
        backgroundMusic.play();
    });
    document.addEventListener("keyup", function(e) {
        if (e.code === "Space") {
            e.preventDefault(); // 阻止默认行为
            togglePause(); // 按下空格键时切换暂停状态
        } else {
            changeDirection(e);
        }
    });

function update() {
    if (gameOver) {
        return;
    }
    context.fillStyle="black";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle="red";
    context.fillRect(foodX, foodY, blockSize, blockSize);
    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
        score++; // Add points when the snake eats food
        updateScore(); // Update the HTML element that displays the score
        updateMaxScore(); // Update high score
        eatSound.play();
    }

    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }
    context.fillStyle="lime";
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    //game over conditions
    // Move snake to the opposite side if it goes out of bounds
    if (snakeX < 0) {
    snakeX = cols * blockSize;
    } else if (snakeX >= cols * blockSize) {
    snakeX = 0;
    }

    if (snakeY < 0) {
    snakeY = rows * blockSize;
    } else if (snakeY >= rows * blockSize) {
    snakeY = 0;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
            alert("Game Over");
        }
    }

    
    if (gamePaused) {
        return; // If the game is paused, update logic is not executed
    }

    if (score > 0 && score % 10 === 0) {
        increaseSnakeSpeed();
    }

    updateSpecialBlock(); // Update special blocks
    
}

function moveSnake(speed) {
    // Calculate the distance the snake should move each frame based on its speed
    var distanceX = speed * (velocityX * blockSize);
    var distanceY = speed * (velocityY * blockSize);

    // Update snake location
    snakeX += distanceX;
    snakeY += distanceY;
}

function updateScore() {
    document.getElementById("score").innerText = score % 1000;
    updateMaxScore(); 
}

// Update the HTML element with the highest score
function updateMaxScore() {
    if (score > maxScore) {
        maxScore = score;
        document.getElementById("max-score").innerText = maxScore;
    }
}

function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
    else if(e.code === "Space"){
        togglePause();
    }
    else if(e.code === "KeyR"){
        restartGame();
    }
}


function togglePause() {
    gamePaused = !gamePaused;

    if (gamePaused) {
        showPauseWindow();
    } else {
        hidePauseWindow();
    }
}



function showPauseWindow() {
    alert("Game Paused. Press Space to resume.");
}
function hidePauseWindow() {
}

function gameOverFunc() {
    gameOver = true;
    alert("Game Over");
    
     backgroundMusic.pause(); //This feature is temporarily not working
    // Save the highest score from the previous round
    updateMaxScore();
}
function updateSpecialBlock() {
    if (!specialBlockActive) {
        if (score > 0 && score % 5 === 0) {
            specialBlockX = Math.floor(Math.random() * cols) * blockSize;
            specialBlockY = Math.floor(Math.random() * rows) * blockSize;
            specialBlockActive = true;

            //Set a 5-second timer to control the existence time of special blocks
            specialBlockTimer = setTimeout(function () {
                specialBlockActive = false;
                placeFood(); // Reposition regular blocks
                clearInterval(specialBlockTimer);
            }, 5000);

            // The timer starts when the special block is generated
            startSpecialBlockTimer();
        }
    }

    if (specialBlockActive) {
        context.fillStyle = "orange"; // Set the color of special blocks
        context.fillRect(specialBlockX, specialBlockY, blockSize, blockSize);

        // Detect whether the snake has eaten a special block
        if (snakeX === specialBlockX && snakeY === specialBlockY) {
            specialBlockActive = false;
            placeFood(); //Reposition regular blocks

            // Calculate the time it takes to eat a special block
            var currentTime = new Date().getTime();
            var elapsedTime = currentTime - specialBlockTimerStartTime;

            // If eaten within 2 seconds, add 5 points; otherwise, add 3 points after 2 seconds
            if (elapsedTime <= 2000) {
                score += 5;
            } else {
                score += 3; //This feature is temporarily not working
            }

            updateScore();
            clearTimeout(specialBlockTimer);
        }
    }
}



function restartGame() {
    // Reset game state
    gameOver = false;
    score = 0;
    snakeBody = [];

    // Reset the position of the snake head
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;

    // Clear canvas after restarting
    context.clearRect(0, 0, board.width, board.height);
    
    // Update displayed scores
    updateScore();

    // Save the highest score from the previous round
    updateMaxScore();

    // Reposition food
    placeFood();
}

function startSpecialBlockTimer() {
    specialBlockTimerStartTime = new Date().getTime();
}


function placeFood() {
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;

    startSpecialBlockTimer(); // Starts the timer for special blocks when food is placed
}