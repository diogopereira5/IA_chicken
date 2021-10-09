const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const sprites = new Image();
sprites.src = './assets/chicken.png';

const eggImg = new Image();
eggImg.src = './assets/egg.png';

const sound = new Audio();
sound.src = './assets/sound.mp3';

var chickens = [];
var eggs = [];
var frames = 0;
const population = 50;

document.addEventListener("keypress", (e) => {

    switch (e.key) {
        case " ":
            if (chickens.length != 0) break;
            for (let i = 0; i < population; i++) {
                chickens.push(createChicken());
            }
            break;
        // case "a":
        //     chickens[0].positionX -= 10;
        //     break;
        // case "d":
        //     chickens[0].positionX += 10;
        //     break;
        // case "w":
        //     chickens[0].positionY -= 10;
        //     break;
        // case "s":
        //     chickens[0].positionY += 10;
        //     break;

    }
});

const spritesPositions = [
    {
        direction: "Right",
        spritX: 0,
        spritY: 32,
    },
    {
        direction: "Left",
        spritX: 0,
        spritY: 96,
    },
    {
        direction: "Up",
        spritX: 0,
        spritY: 0,
    },
    {
        direction: "Down",
        spritX: 0,
        spritY: 64,
    }
];

function createChicken() {
    const random = Math.floor(Math.random() * 4);
    const size = 32;
    const sourceSize = 32;
    const speed = 3;

    let chicken = {
        direction: spritesPositions[random].direction,
        spritX: spritesPositions[random].spritX,
        spritY: spritesPositions[random].spritY,
        size,
        sourceSize,
        positionX: Math.random() * (canvas.width - size),
        positionY: Math.random() * (canvas.height - size),
        speed,
        laidEgg: false,
    };

    return chicken;
}

function drawChicken() {

    chickens && chickens.map(({ spritX, spritY, sourceSize, positionX, positionY, size }) => {
        context.drawImage(
            sprites,
            spritX, spritY,
            sourceSize, sourceSize,
            positionX, positionY,
            size, size,
        );
    });
}

function drawEgg() {
    eggs && eggs.map((egg) => {
        context.drawImage(
            eggImg,
            egg.x, egg.y,
            12, 12,
        );
    });
}

function moveChickens() {
    frames++;

    chickens.map((chicken, index) => {
        if (frames % 10 == 0) {

            const random = Math.floor(Math.random() * 4);
            const newDirection = Math.floor(Math.random() * 4);

            if (chicken.direction == spritesPositions[random].direction) {
                //virar para novo lado
                chicken.spritX = spritesPositions[newDirection].spritX;
                chicken.spritY = spritesPositions[newDirection].spritY;
                chicken.direction = spritesPositions[newDirection].direction;
            }

            //muda imagem
            chicken.spritX += chicken.sourceSize;

            let move = chicken.speed;

            //colisão
            let space = 10;

            if (
                ((chicken.positionX + chicken.size) >= canvas.width - space) ||
                (chicken.positionX <= space) ||
                ((chicken.positionY + chicken.size) >= canvas.height - space) ||
                (chicken.positionY <= space)
            ) {
                let newdirection = null;
                if (chicken.direction == "Right") newdirection = 1;
                if (chicken.direction == "Left") newdirection = 0;
                if (chicken.direction == "Up") newdirection = 3;
                if (chicken.direction == "Down") newdirection = 2;
                chicken.spritX = spritesPositions[newdirection].spritX;
                chicken.spritY = spritesPositions[newdirection].spritY;
                chicken.direction = spritesPositions[newdirection].direction;
            }

            //anda um passo
            switch (chicken.direction) {
                case "Up":
                    chicken.positionY -= move;
                    break;
                case "Down":
                    chicken.positionY += move;
                    break;
                case "Right":
                    chicken.positionX += move;
                    break;
                case "Left":
                    chicken.positionX -= move;
                    break;
            }

            //zera o numero de passos para o primeiro da spite
            if (chicken.spritX >= (32 * 3)) chicken.spritX = 0;

            // selecionar uma galinha para bota um ovo
            const chickenSelect = Math.floor(Math.random() * chickens.length);
            if (index == chickenSelect && chicken.laidEgg == false) {
                eggs.push(
                    {
                        x: chicken.positionX + (chicken.size / 2),
                        y: chicken.positionY + (chicken.size / 2),
                    }
                );
                chicken.laidEgg = true;
            }

        }
    })


    if (frames >= 60) frames = 0;
}


function loop() {

    context.clearRect(0, 0, canvas.width, canvas.height)

    // drawEgg();
    drawChicken();
    moveChickens();

    requestAnimationFrame(loop);

}

loop();