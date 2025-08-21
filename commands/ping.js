// commands/ping.js
const log = require('../logger')(module);
module.exports = {
    name: 'ping',
    description: 'Vérifie si le bot est en ligne.',
    adminOnly: false,
    run: async ({ sock, msg, replyWithTag }) => {
        const remoteJid = msg.key.remoteJid;
        log(`Commande reçue de ${remoteJid}`);
        await replyWithTag(sock, remoteJid, msg, "🚀 Pong ! Je suis en ligne.");
    }
};  