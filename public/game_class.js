class Game {
    constructor() {
        this.state = undefined;
        this.playerID = undefined;
        this.enemyID = undefined;
        this.enemyChoice = undefined;
        this.started = false;
        this.status_paragraph = $("#status");
        this.enemyBoard = $("#enemy-board");
        this.score_paragraph = $("#score");
        this.enemy = false;
        this.score = [0, 0];
        this.states = {
            "CONNECTING": new State(0, "Łączenie z serwerem..."),
            "CONNECTED": new State(0, "Połączono, czekanie na przeciwnika..."),
            "DISCONNECTED": new State(0, "Rozłączono z serwerem, trwa próba ponownego połączenia...", "red"),
            "ENEMY_CONNECTED": new State(0, "Znaleziono przeciwnika, rozpoczynanie gry..."),
            "ENEMY_DISCONNECTED": new State(0, "Przeciwnik się rozłączył, szukanie nowego przeciwnika...", "red"),
            "NEW_ENEMY": new State(0, "Znaleziono nowego przeciwnika, zerowanie wyniku..."),
            "ERROR": new State(0, "Wystąpił wewnętrzny błąd gry, proszę czekać...", "red"),
            "CONNECTION_ERROR": new State(0, "Błąd połączenia z serwerem, trwa próba ponowenego połączenia...", "red"),
            "IN_GAME": new State(1, "W trakcie rozgrywki")
        }
    }

    init = () => {
        this.setState(this.states["CONNECTING"]);
        this.connectChat();
    }

    startGame = () => {
        this.setButtons(true);
        this.score = [0, 0];
        this.updateScore();
        this.setState(this.states["IN_GAME"]);
    }

    setButtons = (state) => {
        if (state) {
            $("#paper").addEventListener("click", paper);
            $("#rock").addEventListener("click", rock);
            $("#scissors").addEventListener("click", scissors);

            $("#paper").classList.add("active");
            $("#rock").classList.add("active");
            $("#scissors").classList.add("active");
        } else {

            $("#paper").removeEventListener("click", paper);
            $("#rock").removeEventListener("click", rock);
            $("#scissors").removeEventListener("click", scissors);

            $("#paper").classList.remove("active");
            $("#rock").classList.remove("active");
            $("#scissors").classList.remove("active");
        }
    }

    checkGame = () => {
        if (this.state) {
            this.updateScore();
        } else if (!this.state) {
            if (!this.playerID) {
                this.playerID = socket.id;
            } else if (!socket.connected) {
                this.setState(this.states["DISCONENCTED"]);
                this.setEnemyBoard(false);
                socket.connect();
            } else if (!this.started && socket.connected && this.enemy) {
                this.started = true;
                this.startGame();
            } else if (this.started && socket.connected && !this.enemy) {
                this.enemyDisconnected();
            }
        }
    }

    saveEnemyChoice = (choice) => {
        this.enemyChoice = choice;
    }

    checkWinner = (data) => {
        if (data == "remis") {
            this.score[0] += 1;
            this.score[1] += 1;
        } else if (data == this.playerID) {
            this.score[0] += 1;
        }
        else if (data == this.enemyID) {
            this.score[1] += 1;
        } else {
            this.setState(this.states["ERROR"]);
        }

        if (this.enemyChoice) {
            switch (this.enemyChoice) {
                case "papier":
                    $("#paper_enemy").classList.add("chosen");
                    break;

                case "kamien":
                    $("#rock_enemy").classList.add("chosen");
                    break;

                case "nozyce":
                    $("#scissors_enemy").classList.add("chosen");
                    break;

                default:
                    break;
            }
        }

        this.updateScore();
        setTimeout(this.resetBoard, 1000);
    }

    resetBoard = () => {
        this.setButtons(true);
        $("#paper").classList.remove("chosen");
        $("#rock").classList.remove("chosen");
        $("#scissors").classList.remove("chosen");

        $("#paper_enemy").classList.remove("chosen");
        $("#rock_enemy").classList.remove("chosen");
        $("#scissors_enemy").classList.remove("chosen");
    }

    updateScore = () => {
        this.score_paragraph.innerText = this.score[0] + " : " + this.score[1];
    }

    setState = (newState = this.states["ERROR"]) => {
        this.status_paragraph.innerText = newState.description;
        this.status_paragraph.style.color = newState.displayColor;
        this.state = newState.gameState;
    }

    getEnemyID = (data) => {
        let temp = data[0].id;
        if (temp == this.playerID) this.getEnemy(data[1].id);
        else this.getEnemy(temp);
    }

    getEnemy = (ID) => {
        if (ID != this.enemyID && this.enemyID) {
            this.setEnemyBoard(false);
            this.setState(this.states["NEW_ENEMY"]);
            this.score = [0, 0];
            this.updateScore();
            this.enemyID = ID;
            setTimeout(() => this.getEnemy(this.enemyID), 3000);
            setTimeout(() => this.setState(this.states["IN_GAME"]), 3000);
            return;
        }
        this.enemyID = ID;
        this.enemy = true;
        this.setEnemyBoard(true);
        this.setState(this.states["ENEMY_CONNECTED"]);
        this.checkGame();
    }

    enemyDisconnected = () => {
        this.enemy = false;
        this.setState(this.states["ENEMY_DISCONNECTED"]);
        this.setEnemyBoard(false);
        $("#chat_history").innerHTML = "";
    }

    setActive = (e) => {
        $(e).classList.add("chosen");
        this.setButtons(false);
    }

    setEnemyBoard = (state) => {
        if (state) {
            this.enemyBoard.classList.remove("hidden");
        } else {
            this.enemyBoard.classList.add("hidden");
        }

    }

    connectChat = () => {
        $("#chat").addEventListener("submit", (e) => {
            e.preventDefault();
            let message = $("#message_input").value;
            socket.volatile.emit("chat", new Message(this.enemyID, message));
            this.displayMessage(message, "player");
            $("#message_input").value = "";
        });
    }

    displayMessage = (message, who) => {
        if(!message) return;
        let p = document.createElement("p");
        let n = document.createTextNode(message);
        p.appendChild(n);
        let d = document.createElement("div");
        d.appendChild(p);
        d.classList.add(who, "chat_message");
        $("#chat_history").insertBefore(d, $("#chat_history").firstChild);
    }

    reload = () => {
        setTimeout(() => window.location.reload(true), 3000);
    }

}