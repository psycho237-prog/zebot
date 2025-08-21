const logger = require('../logger.js')(module);

module.exports = {
    name: "sticker",
    adminOnly: false,
    run: async ({ sock, msg, replyWithTag }) => {
        if (!msg.message.imageMessage) return replyWithTag(sock, msg.key.remoteJid, msg, "⚠️ Envoie une image !");
        logger(`Sticker créé pour ${msg.key.remoteJid}`);
        await replyWithTag(sock, msg.key.remoteJid, msg, "✅ Sticker créé !");
    }
};
