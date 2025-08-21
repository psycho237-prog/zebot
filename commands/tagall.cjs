module.exports = {
    name: "tagall",
    description: "Mentionne tous les membres du groupe avec un message personnalisé",
    adminOnly: true,
    run: async ({ sock, msg, args, replyWithTag }) => {
        const remoteJid = msg.key.remoteJid;
        if (!remoteJid.endsWith("@g.us")) {
            return replyWithTag(sock, remoteJid, msg, "⛔ Cette commande ne fonctionne que dans les groupes.");
        }

        try {
            const groupMetadata = await sock.groupMetadata(remoteJid);
            const participants = groupMetadata.participants.map(p => p.id);

            const customText = args.length > 0 ? args.join(" ") : "📢 Attention tout le monde !";
            
            const CHUNK_SIZE = 50;
            for (let i = 0; i < participants.length; i += CHUNK_SIZE) {
                const chunk = participants.slice(i, i + CHUNK_SIZE);
                await sock.sendMessage(remoteJid, {
                    text: customText,
                    mentions: chunk
                });
            }

            replyWithTag(sock, remoteJid, msg, `✅ Tous les membres ont été mentionnés (${participants.length}).`);

        } catch (error) {
            console.error("[TAGALL] Erreur:", error);
            replyWithTag(sock, remoteJid, msg, "❌ Une erreur est survenue lors du tag de tous les membres.");
        }
    },
};
