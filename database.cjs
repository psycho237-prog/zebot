const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, 'users.json');

function loadUsers() {
    if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '{}');
    return JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

module.exports = {
    getOrRegisterUser: async (id, name) => {
        const users = loadUsers();
        if (!users[id]) users[id] = { name, commandsUsed: 0 };
        saveUsers(users);
        return users[id];
    },
    incrementCommandCount: async (id) => {
        const users = loadUsers();
        if (users[id]) users[id].commandsUsed += 1;
        saveUsers(users);
    }
};
