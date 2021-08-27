window.onload = function () {    
    // registerSW();

    window.game = new Game();
}

// // //
// var COLORS = ["red", "lime", "orange", "aqua", "fuchsia"];

class Game {
    constructor() {
        this.canvasElement = document.createElement("canvas");
        this.bg = "black";
        this.fg = "white";
        this.radius = 40;
        this.touchList = [];
        this.playerCount;
        this.timeout = 0;

        document.body.appendChild(this.canvasElement);
        this.start();
    }

    start() {
        
        canvas.addEventListener("touchstart", this.touchChange.bind(this));
        canvas.addEventListener("touchend", this.touchChange.bind(this));
        canvas.addEventListener("touchcancel", this.touchChange.bind(this));
        canvas.addEventListener("touchmove", this.touchMove.bind(this));

        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.resizeCanvas(this);
        if (this.bg) {
            document.body.style.background = this.bg;
        }
    }

    resizeCanvas() {
        var canvas = document.getElementById(this.canvasId);
        if (canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.draw();
        }
    }



    touchChange(event) {
        var self = this;
        this.currentEvent = event;
        event.preventDefault();
        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            switch (event.type) {
                case "touchstart":
                    storeTouch(this.touchList, copyTouch(touch));
                    break;
                case "touchend":
                case "touchcancel":
                    var index = findTouch(this.touchList, touch);
                    if (index < 0) {
                        throw new Error("Not found that identifier for end or cancel event.");
                    } else {
                        this.touchList[index] = null;
                    }
                    break;
                default:
                    throw new Error("unknown event.type");
                    break;
            }
        }
        this.draw();
        this.currentEvent = null;
        return true;
    }

    touchMove(event) {
        var self = this;
        this.currentEvent = event;
        event.preventDefault();

        var touches = event.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            var index = findTouch(this.touchList, touch);
            if (index < 0) {
                throw new Error("Unknown identifier.");
            } else {
                this.touchList[index] = copyTouch(touch);
            }
        }
        
        this.draw();
        this.currentEvent = null;
        return true;
    }

    draw() {
    var canvas = document.getElementById(this.canvasId);
        if (!canvas.getContext) {
            return;
        }
        var ctx = canvas.getContext("2d");
        
        if (this.bg) {
            ctx.fillStyle = this.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        for (var i = 0; i < this.touchList.length; ++i) {
            var touch = this.touchList[i];
            if (touch) {
                this.drawTouch(ctx, touch, this.fg);
            }
        }
    }
    
    drawTouch(ctx, touch, touchColor) {
        var px = touch.pageX;
        var py = touch.pageY;
        ctx.beginPath();
        ctx.arc(px, py, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = touchColor;
        ctx.fill();
    }
}

function storeTouch(array, touch) {
    for (var i = 0; i < array.length; ++i) {
        if (array[i] == null) {
            array[i] = touch;
            return i;
        }
    }
    array[i] = touch;
    return i;
}
function findTouch(array, touch) {
    for (var i = 0; i < array.length; ++i) {
        if (array[i] != undefined && array[i].identifier == touch.identifier) {
            return i;
        }
    }
    return -1;
}
function copyTouch(touch) {
    return { identifier: touch.identifier, radiusX: touch.radiusX, radiusY: touch.radiusY, pageX: touch.pageX, pageY: touch.pageY, screenX: touch.screenX, screenY: touch.screenY };
}