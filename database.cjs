const users = {};

module.exports = {
    getOrRegisterUser: async (id, name) => {
        if (!users[id]) users[id] = { name, commandsUsed: 0 };
        return users[id];
    },
    incrementCommandCount: async (id) => {
        if (!users[id]) users[id] = { name: 'Unknown', commandsUsed: 0 };
        users[id].commandsUsed++;
    },
};
