module.exports = {
    name: "play",
    adminOnly: false,
    run: async ({ sock, msg, args, replyWithTag }) => {
        if (!args[0]) 
            return replyWithTag(sock, msg.key.remoteJid, msg, "⚠️ Donne un lien YouTube ou un nom de musique !");
        
        const query = args.join(" ");
        // Ici tu peux ajouter la logique yt-dlp pour télécharger ou streamer
        await replyWithTag(sock, msg.key.remoteJid, msg, `✅ Lecture demandée: ${query}`);
    }
};
