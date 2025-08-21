const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const log = require('../logger')(module);

module.exports = {
    name: 'extract',
    description: "Extrait et renvoie un média 'vue unique' (image, vidéo, ou audio).",
    adminOnly: false,
    run: async ({ sock, msg, replyWithTag }) => {
        const remoteJid = msg.key.remoteJid;
        log(`Commande reçue de ${remoteJid}`);

        try {
            const context = msg.message?.extendedTextMessage?.contextInfo;
            if (!context || !context.quotedMessage) return replyWithTag(sock, remoteJid, msg, '❌ Veuillez répondre à un média vue unique.');
            
            let quoted = context.quotedMessage;
            const stanzaId = context.stanzaId;
            const hasNoKey = !(quoted.imageMessage?.mediaKey || quoted.videoMessage?.mediaKey || quoted.audioMessage?.mediaKey);
            if (stanzaId && hasNoKey) {
                log('Rechargement du message complet...');
                const fullMsg = await sock.loadMessage(remoteJid, stanzaId);
                quoted = fullMsg.message;
                if (!quoted) throw new Error('Rechargement échoué.');
            }

            const isDirectViewOnce = quoted.imageMessage?.viewOnce || quoted.videoMessage?.viewOnce || quoted.audioMessage?.viewOnce;
            const wrapperViewOnce = quoted?.viewOnceMessage?.message || quoted?.viewOnceMessageV2?.message;
            const finalMessage = isDirectViewOnce ? quoted : wrapperViewOnce;
            if (!finalMessage) return replyWithTag(sock, remoteJid, msg, '❌ Message non compatible.');

            let mediaMessage, mediaType;
            if (finalMessage.imageMessage) { mediaMessage = finalMessage.imageMessage; mediaType = 'image'; } 
            else if (finalMessage.videoMessage) { mediaMessage = finalMessage.videoMessage; mediaType = 'video'; }
            else if (finalMessage.audioMessage) { mediaMessage = finalMessage.audioMessage; mediaType = 'audio'; }
            if (!mediaMessage) return replyWithTag(sock, remoteJid, msg, '❌ Impossible de trouver le média.');

            log(`Extraction d'un média de type "${mediaType}"...`);
            const stream = await downloadContentFromMessage(mediaMessage, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            if (buffer.length === 0) return replyWithTag(sock, remoteJid, msg, '⚠️ Le téléchargement a échoué.');
            const caption = '👁️‍🗨️ Média à vue unique capturé !';
            if (mediaType === 'image') await sock.sendMessage(remoteJid, { image: buffer, caption }, { quoted: msg });
            else if (mediaType === 'video') await sock.sendMessage(remoteJid, { video: buffer, caption }, { quoted: msg });
            else if (mediaType === 'audio') await sock.sendMessage(remoteJid, { audio: buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });

            log('Média extrait avec succès.');
        } catch (err) {
            log('Erreur:', err.message);
            await replyWithTag(sock, remoteJid, msg, '⚠️ Une erreur est survenue lors de l\'extraction.');
        }
    }
};
