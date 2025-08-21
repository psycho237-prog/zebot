module.exports = {
    name: "play",
    adminOnly: false,
    run: async ({ sock, msg, args, replyWithTag }) => {
        if (!args[0]) return replyWithTag(sock, msg.key.remoteJid, msg, "⚠️ Donne-moi le nom ou le lien !");
        await replyWithTag(sock, msg.key.remoteJid, msg, `🎵 Je joue : ${args.join(" ")}`);
    }
};
