///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/////////////////////////      Le Jeu Casse-Brique    /////////////////////////
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

//variable pour le score
let score = 0;
let lives = 3;


// variables pour la balle
// coordonnées de départ du centre de la balle
let x = canvas.width / 2;
let y = canvas.height - 30;
let ballRadius = 10; // rayon de la balle

//déplacement balle de 2 et 2 à chaque itération de la fonction
let dx = 2; // déplacement vers la droite
let dy = -2; //"-2" car la balle est en bas et doit remonter

// variables pour la raquette
let paddleHeight = 15;
let paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2  //position de la raquette en centré

// variables du mur de briques
let brickRowCount = 3;     //nombre de lignes et colonnes du mur
let brickColumnCount = 5;
let brickWidth = ((canvas.width-70)/5);   //taille d'une brique
let brickHeight = 20;
let brickPadding = 10;   //espacement autour des briques et du mur
let brickOffsetTop = 30;
let brickOffsetLeft = 15;

// tableau de brique (r:row, c:colonne)
// la boucle parcours le tableau et créée les objets brick définis par une position x et y
let bricks = [];
for(let c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++) {
        // on donne 3 propriétés à l'objet brick (avec des valeurs par défaut)
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// variable état des touches, false par défaut --> on les mettra à true lors d'un appuie sur une touche
let rightPressed = false;
let leftPressed = false;


//création de la balle
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#89c05a";
    ctx.fill();
    ctx.strokeStyle = "#729a48";
    ctx.stroke();
    ctx.closePath();
}

//création de la raquette
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight);
    ctx.fillStyle = "#424242";
    ctx.fill();
    ctx.closePath();
}

//dessin des briques
//On parcourt le tableau pour dessiner les bricks
function drawBricks(){
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if (bricks[c][r].status === 1){  // la brique ne sera dessinée que si son statut vaut 1
                //calcul de la position de chaque brique
                let brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                let brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

//affichage du score et des vies
function drawScore(){
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#424242"
    ctx.fillText("Score: " + score, 8, 20) //paramètres : texte, x, y, widthmax)
}
function drawLives(){
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#424242"
    ctx.fillText("Lives: " + lives, canvas.width-68, 20) //paramètres : texte, x, y, widthmax)
}


function draw() {
    // fonction pour effacer les précédents contenus
    // paramètres : coordonnées du coin haut gauche et taille de la zone qui sera effacée
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall(); //on appelle la fonction de dessin de la balle
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // si après le prochain mouvement LE BORD de la balle aurait dû sortir du cadre,
    // alors on redéfinit le mouvement pour que la balle reparte dans l'autre sens

    // pour les bords Droit et gauche
    if ((x + dx + ballRadius > canvas.width) || (x + dx - ballRadius < 0)) {
        dx = -dx;
    }
    //la balle arrive au bord du haut
    if (y + dy - ballRadius < 0) {
        dy = -dy;
    } else if ((x > paddleX) && (x < paddleX + paddleWidth) && (y + dy + ballRadius > canvas.height - paddleHeight - 5)) {   //arrivée de la balle contre la raquette
        dy = -dy;
    } else if (y + dy + ballRadius > canvas.height) {  // la balle rencontre le bord du bas (donc loupe la raquette) : partie perdue
        lives--; //si on perd une partie : une vie en moins
        if(!lives) { // quand on a zero vie : game over
            alert("GAME OVER");
            document.location.reload();
            // clearInterval(interval); // Needed for Chrome to end game
        }
        else { // s'il reste des vies : la partie se relance avec la reinitialization de la position de la balle et de la raquette
            x = canvas.width/2;
            y = canvas.height-30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width-paddleWidth)/2;
        }
    }

    // actualisation de x et y pour créer le déplacement
    x += dx;
    y += dy;

    //déplacement de la raquette de 7px via la variable paddleX
    // SI l'état de la touche est true ET SI la raquette ne dépasse pas du cadre (ex : la position du coin haut gauche (paddleX) doit être sup à 0 pour qu'on puisse aller à gauche)
    // si l'une des conditions n'est pas remplie, la raquette ne bouge pas
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    requestAnimationFrame(draw); // la fonction s'exécute en boucle

}
//la fonction "draw()" est appelé toutes les 10 millisecondes
// let interval = setInterval(draw, 10);
draw();


///////////////////////////////////////////////////////////////////////////////////////
//////////////////////// GamePlay /////////////////////////////////////////////////////
// écouteur d'évènement : appuis sur les touches pour déplacer la raquette
document.addEventListener("keydown", keyDownHandler, false); // quand la touche sera enfoncée, la fonction keyDownHandler sera activée
document.addEventListener("keyup", keyUpHandler, false); // quand une touche cesse d'être enfoncé l'autre fct s'active
document.addEventListener("mousemove", mouseMoveHandler, false); //détection de mouvement de la souris

// quand une touche est enfoncée, les variables d'état des touches sont donc mis à 'true'
function keyDownHandler(e) {
    //les navigateurs utilisent 'ArrowRight' ou 'Right' pour les touches fléchées G et D
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "e") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
        leftPressed = true;
    }
}

// quand la touche est relâchée, on repasse l'état des touches à 'false' (les touches ne sont plus actives, on arrête les mouvements)
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "e") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
        leftPressed = false;
    }
}

// mise à jour de la position de la raquette en fonction des coordonnées de la souris
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft; //position de la souris sur l'écran mais par rapport au canvas
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

//////////////////////////////////////////////////////////////////////////////////////
// fonction qui va parcourir le tableau représentant le mur de brique
// compare la position des brique avec celle de la balle (qui a pour coordonnées x et y) pour savoir s'il y a collision
function collisionDetection() {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            //pour plus de praticité, on crée un objet brick qui est la brique qu'on est en train "d'étudier"
            let b = bricks[c][r];
            if (b.status === 1){
                // si la balle est dans la brique, alors elle change de direction
                // la balle doit être à l'intérieur des 4 côtés de la brique
                let condition1 = x+ballRadius > b.x;
                let condition2 = x-ballRadius < b.x+brickWidth;
                let condition3 = y+ballRadius > b.y;
                let condition4 = y-ballRadius < b.y+brickHeight;

                if(condition1 && condition2 && condition3 && condition4) {
                    dy = -dy;
                    b.status = 0; //le statut de la balle change et elle ne sera plus dessinée (elle disparait)
                    score++; //le score augmente de 1 à chaque brique détruite
                    // message si la partie est gagnée
                    if(score === brickRowCount*brickColumnCount) {
                        alert("C'est gagné, Bravo!");
                        document.location.reload();
                        // clearInterval(interval); // Needed for Chrome to end game
                    }
                }
            }
        }
    }
}


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////      Canvas de test    ////////////////////////////

//on stock l'élément html "myCanvas" dans une variable pour pouvoir l'utiliser
var canvas2 = document.getElementById("myCanvas2");
var ctx2 = canvas2.getContext("2d");

//création d'un rectangle rouge
//objet créé entre beginPath() et closePath()
ctx2.beginPath();
// rect() --> notre forme sera un rectangle
// Les 2 premiers chiffres définissent le point de départ de la forme (angle haut gauche)
// les 2 autres définissent sa taille
ctx2.rect(20, 40, 50, 50);

ctx2.fillStyle = "#FF0000"; //stock une couleur
ctx2.fill(); //utilise la couleur stockée pour remplir la forme

ctx2.closePath();

// création d'un cercle
ctx2.beginPath();
// arc --> forme 'arrondie'
// x et y = coordonnée du CENTRE de la forme
// radius = rayon
// start angle et endAngle : angle de départ et de fin (en radiant)
ctx2.arc(240, 160, 30, 0, Math.PI * 2, false);
ctx2.fillStyle = "green";
ctx2.fill();
ctx2.closePath();

// Rectangle avec seulement le bord en couleur
ctx2.beginPath();
ctx2.rect(160, 10, 100, 40);
ctx2.strokeStyle = "rgba(0, 0, 255, 0.5)";
ctx2.stroke(); //contour au lieu de remplissage
ctx2.closePath();


ctx2.font = "bold 16px Arial";
ctx2.fillStyle = "#4b791e"
ctx2.fillText("Score", 8, 20) //paramètres : texte, x, y, widthmax)
