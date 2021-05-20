var choices = ["kamien", "papier", "nozyce"];
var map = {};

choices.forEach(function (choice, i) {
    map[choice] = {};
    map[choice][choice] = 0;
    map[choice][choices[(i + 1) % 3]] = 1;
    map[choice][choices[(i + 2) % 3]] = 2;
})

function compare(user1, user2) {
    let winner = (map[user1['choice']])[user2['choice']];
    if (winner == 2) {
        return user1['id'];
    } else if (winner == 1) {
        return user2['id']
    } else {
        return "remis"
    }

}

exports.compare = compare

