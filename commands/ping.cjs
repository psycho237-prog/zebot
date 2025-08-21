// commands/ping.cjs
module.exports = {
    name: 'ping',
    adminOnly: false,
    run: async ({ sock, msg, replyWithTag }) => {
        await replyWithTag(sock, msg.key.remoteJid, msg, 'Pong! 🏓');
    },
};
