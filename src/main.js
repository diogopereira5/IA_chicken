const socket = io();

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const sprites = new Image();
sprites.src = './assets/chicken.png';

const eggImg = new Image();
eggImg.src = './assets/egg.png';

const sound = new Audio();
sound.src = './assets/sound.mp3';

var keyPLayer = false;
var chickens = [];
var eggs = [];
var frames = 0;
const population = 1;
var positionPlayer = null;

document.addEventListener("keypress", (e) => {

    for (let i = 0; i < chickens.length; i++) {
        if (chickens[i].id == keyPLayer) {
            positionPlayer = i;
        }
    }

    try {
        switch (e.key) {
            case " ":
                if (keyPLayer != false) break;
                // for (let i = 0; i < population; i++) {
                //     chickens.push(createChicken());
                // }
                socket.emit('create-chicken', createChicken());
                break;
            case 'd': //direita
                move(chickens[positionPlayer], spritesPositions[0]);
                break;
            case 'a': //esquerda 
                move(chickens[positionPlayer], spritesPositions[1]);
                break;
            case 'w': //cima
                move(chickens[positionPlayer], spritesPositions[2]);
                break;
            case 's': //baixo
                move(chickens[positionPlayer], spritesPositions[3]);
                break;
        }
    } catch (err) { }
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
        id: keyPLayer,
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

function move(chicken, spritePositions) {

    let colided = colide(chicken);

    if (colided) return;

    if (chicken.direction != spritePositions.direction) {
        chicken.spritX = spritePositions.spritX;
        chicken.spritY = spritePositions.spritY;
        chicken.direction = spritePositions.direction;
    }

    //move pernas
    chicken.spritX += chicken.size;

    //anda x passos
    if (chicken.direction == "Right") {
        chicken.positionX += chicken.speed;
    } else if (chicken.direction == "Left") {
        chicken.positionX -= chicken.speed;
    } else if (chicken.direction == "Up") {
        chicken.positionY -= chicken.speed;
    } else if (chicken.direction == "Down") {
        chicken.positionY += chicken.speed;
    }

    if (chicken.spritX >= (chicken.size * 3)) {
        chicken.spritX = 0;
    }

    socket.emit('update-chickens', chicken);

}

function colide(chicken) {
    var space = 10;
    if (
        ((chicken.positionX + chicken.size) >= canvas.width - space) ||
        (chicken.positionX <= space) ||
        ((chicken.positionY + chicken.size) >= canvas.height - space) ||
        (chicken.positionY <= space)
    ) {
        return true;
        console.log('bateu')
    }
    return false;
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

    socket.on('draw', (chicken) => {
        chickens = chicken;
    });

    context.clearRect(0, 0, canvas.width, canvas.height)

    // drawEgg();
    drawChicken();
    // moveChickens();

    requestAnimationFrame(loop);

}

socket.on('connect', async () => {
    console.log(socket.id);
    keyPLayer = socket.id;
    socket.emit('create-chicken', createChicken());
});

loop();