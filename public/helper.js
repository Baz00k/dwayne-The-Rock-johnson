$ = (i) => document.querySelector(i);

class Data {
    constructor(data) {
        this.data = data;
        this.id = socket.id;
    }
}

class State {
    constructor(gameState = 0,description = "", color = "black") {
        this.gameState = gameState;
        this.description = description;
        this.displayColor = color;
    }
}

class Message {
    constructor(id, message) {
        this.id = id;
        this.message = message;
    }
}

function rock() {
    game.setActive("#rock");
    socket.emit("data", new Data("kamien"));
}

function paper() {
    game.setActive("#paper");
    socket.emit("data", new Data("papier"));
}

function scissors() {
    game.setActive("#scissors");
    socket.emit("data", new Data("nozyce"));
}