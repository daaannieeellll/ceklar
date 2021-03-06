window.onload = function () {    

    registerSW();
    window.game = new Game();
    window.minigames =
        [
            new Randomizer()
        ];
}

let COLORS =
    [
        "#e6194B",
        "#f58231",
        "#ffe119",
        "#3cb44b",
        "#42d4f4",
        "#4363d8",
        "#dcbeff",
        "#f032e6",
        "#9A6324",
        "#aaffc3"
    ]

class Game {
    constructor() {
        this.canvas = document.createElement(
            "canvas",{
                width: window.innerWidth,
                height: window.innerHeight
            });
        this.bg = "black";
        this.resetTimeout = false;
        this.players = [];

        this.waitingInterval = 1500;
        this.abortController = new AbortController();


        document.body.appendChild(this.canvas);
        this.toggleEventlisteners();

        window.onresize = this.resizeCanvas.bind(this);
        this.resizeCanvas();
        if (this.bg) {
            document.body.style.background = this.bg;
        }
    }
    
    async wait (ms, abortSignal) {
        return new Promise( (resolve, reject) => {
            const timeout = setTimeout( () => {
                resolve();
            }, ms);

            abortSignal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject();
            } );
        });
    }

    toggleEventlisteners() {
        if (this.canvas.ontouchstart) {
            this.canvas.ontouchstart = null;
            this.canvas.ontouchend = null;
            this.canvas.ontouchcancel = null;
            this.canvas.ontouchmove = null;
        } else {
            this.canvas.ontouchstart = this.touchChange.bind(this);
            this.canvas.ontouchend = this.touchChange.bind(this);
            this.canvas.ontouchcancel = this.touchChange.bind(this);
            this.canvas.ontouchmove = this.touchMove.bind(this);
        }
    }

    touchChange(event) {
        var self = this;
        this.currentEvent = event;
        event.preventDefault;

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            switch (event.type) {
                case "touchstart":
                    console.log("new touch");
                    storePlayer(this.players, new Player(touches[i]));
                    break;
                case "touchend":
                case "touchcancel":
                    console.log("removed touch");
                    var index = findPlayer(this.players, touches[i]);
                    if (index >= 0) this.players[index] = null;
                    break;
                default:
                    break;
            }
        }

        this.draw();
        this.currentEvent = null;
        
        this.abortController.abort();
        this.abortController = new AbortController();
        this.wait(this.waitingInterval, this.abortController.signal)
            .then(() => {
                    this.startMiniGame();
                })
            .catch(()=>{});
        return true;
    }

    touchMove(event) {
        var self = this;
        this.currentEvent = event;
        event.preventDefault();

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var index = findPlayer(this.players, touches[i]);
            if (index >= 0) {
                this.players[index].info = touches[i];
            }
        }
        
        this.draw();
        this.currentEvent = null;
        return true;
    }

    resizeCanvas() {
        if (this.canvas.width != window.innerWidth || this.canvas.height != window.innerHeight) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.draw();
        }
    }

    draw() {
            if (!this.canvas.getContext)
                return;

            var ctx = this.canvas.getContext("2d");
            
            if (this.bg) {
                ctx.fillStyle = this.bg;
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
    
            for (var i = 0; i < this.players.length; ++i) {
                var player = this.players[i];
                if (player) this.drawTouch(ctx, player);
            }
    }

    drawTouch(ctx, player) {
        var px = player.info.pageX;
        var py = player.info.pageY;
        ctx.beginPath();
        ctx.arc(px, py, player.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = player.color;
        ctx.fill();
    }

    async startMiniGame() {
        if (this.players.length > 1)
        {
            this.toggleEventlisteners();
            window.minigames[0].start(this.canvas, this.players);
            this.toggleEventlisteners();
        }
    }

    

}

class Player {
    constructor(touch) {
        this.info = touch;
        
        this.color = "white";
        this.radius = 50;
    }
}

class Minigame {
    constructor() {
        this.bg = "black";
    }

    setContext(canvas, players) {
        this.canvas = canvas;
        this.players = players;
    }

    exit() {
        throw("Game ended");
    }

    toggleEventlisteners() {
        if (this.canvas.ontouchstart) {
            this.canvas.ontouchstart = null;
            this.canvas.ontouchend = null;
            this.canvas.ontouchcancel = null;
            this.canvas.ontouchmove = null;
        } else {
            this.canvas.ontouchstart = this.touchChange.bind(this);
            this.canvas.ontouchend = this.touchChange.bind(this);
            this.canvas.ontouchcancel = this.touchChange.bind(this);
            this.canvas.ontouchmove = this.touchChange.bind(this);
        }
    }

    draw() {
        if (!this.canvas.getContext)
            return;

        var ctx = this.canvas.getContext("2d");
        
        if (this.bg) {
            ctx.fillStyle = this.bg;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        for (var i = 0; i < this.players.length; ++i) {
            var player = this.players[i];
            if (player) this.drawTouch(ctx, player);
        }
    }

    drawTouch(ctx, player) {
        var px = player.info.pageX;
        var py = player.info.pageY;
        ctx.beginPath();
        ctx.arc(px, py, player.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = player.color;
        ctx.fill();
    }
}

class Randomizer extends Minigame {
    constructor() {
        super();
    }

    start(canvas, players) {
        this.setContext(canvas, players);
        this.toggleEventlisteners();
        this.canvas.ontouchcancel = this.exit;
        this.canvas.ontouchend = this.exit;

        this.players[Math.floor(Math.random() * this.players.length)].color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.draw();
        this.toggleEventlisteners();
    }

    touchChange(event) {
        var self = this;
        this.currentEvent = event;
        event.preventDefault;

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            switch (event.type) {
                case "touchstart":
                    console.log("new touch");
                    storePlayer(this.players, new Player(touches[i]));
                    break;
                case "touchend":
                case "touchcancel":
                    console.log("removed touch");
                    var index = findPlayer(this.players, touches[i]);
                    if (index >= 0) this.players[index] = null;
                    break;
                case "touchmove":
                    var index = findPlayer(this.players, touches[i]);
                    if (index >= 0) {
                        this.players[index].info = touches[i];
                    }
                    break;
                default:
                    break;
            }
        }

        this.draw();
        this.currentEvent = null;
        
        return true;
    }

}

/**
 * Game maakt speelbord en luistert naar touches.
 * 
 * loop
 *      Als het aantal touches na 5 seconden niet verandert
 *      en groter is dan 1, wordt een spel gestart.
 * pool
 * 
*/

function storePlayer(array, player) {
    for (var i = 0; i < array.length; i++)
        if (array[i] == null) {
            array[i] = player;
            return i;
        }
    array[i] = player;
    return i;
}
function findPlayer(array, touch) {
    for (var i = 0; i < array.length; i++)
        if (array[i] != undefined && array[i].info.identifier == touch.identifier)
            return i;
    return -1;
}

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        }
        catch (e) {
            console.log(`SW registration failed`);
        }
    }
}
    