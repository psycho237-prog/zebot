// commands/play.cjs
const log = require('../logger')(module);
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'play',
    description: 'Télécharge et envoie une vidéo/audio depuis YouTube.',
    adminOnly: false,
    run: async ({ sock, msg, args, replyWithTag }) => {
        const remoteJid = msg.key.remoteJid;

        if (!args.length) {
            return replyWithTag(sock, remoteJid, msg, '❌ Veuillez fournir un lien YouTube.');
        }

        const url = args[0];
        log(`Commande play reçue de ${remoteJid} avec URL : ${url}`);

        try {
            // Vérifie si l'URL est valide
            if (!ytdl.validateURL(url)) {
                return replyWithTag(sock, remoteJid, msg, '❌ URL YouTube invalide.');
            }

            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const stream = ytdl(url, { filter: 'audioonly' });

            const filePath = path.join('/tmp', `${Date.now()}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`);
            const writeStream = fs.createWriteStream(filePath);

            stream.pipe(writeStream);

            writeStream.on('finish', async () => {
                log(`Envoi du fichier audio "${title}" à ${remoteJid}`);
                await sock.sendMessage(remoteJid, {
                    audio: fs.readFileSync(filePath),
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${title}.mp3`
                }, { quoted: msg });

                fs.unlinkSync(filePath); // Supprime le fichier après envoi
                log(`Fichier "${title}" supprimé du serveur après envoi.`);
            });

            writeStream.on('error', (err) => {
                log('Erreur lors de l’écriture du fichier:', err);
                replyWithTag(sock, remoteJid, msg, '❌ Une erreur est survenue lors du téléchargement.');
            });

        } catch (err) {
            log('Erreur lors de la commande play:', err);
            replyWithTag(sock, remoteJid, msg, '❌ Impossible de traiter la commande play.');
        }
    }
};
