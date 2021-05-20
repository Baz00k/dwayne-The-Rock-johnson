let game;

const main = () => {

    game = new Game();
    game.init();

    socket.on("connect", () => {
        game.setState(game.states["CONNECTED"]);
        game.checkGame();
    });

    socket.on("connect_error", () => {
        game.setState(game.states["CONNECTION_ERROR"]);
        socket.connect();
    });

    socket.on("disconnect", () => {
        game.setState(game.states["DISCONNECTED"]);
        socket.connect();
    });

    socket.on("enemy_connect", (data) => {
        game.getEnemyID(data);
    });

    socket.on("winner", (data) => {
        game.checkWinner(data);
    });

    socket.on("enemy_disconnected", (data) => {
        game.enemyDisconnected();
    });

    socket.on("choice", (data) => {
        game.saveEnemyChoice(data.data);
    });

    socket.on("new_message", (message) => {
        game.displayMessage(message, "enemy");
    });

}