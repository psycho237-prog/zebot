// commands/play.js
const Youtube = require('youtube-sr').default;
const ytDlpExec = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const log = require('../logger')(module)
// --- NOUVEAU : On importe le chemin vers ffmpeg ---
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg');

module.exports = {
    name: 'play',
    description: "Recherche et envoie une chanson depuis YouTube.",
    adminOnly: false,
    run: async ({ sock, msg, args, replyWithTag }) => {
        const query = args.join(" ");
        const remoteJid = msg.key.remoteJid;
        log(`Commande reçue de ${remoteJid}. Recherche: "${query}"`);

        if (!query) {
            return replyWithTag(sock, remoteJid, msg, "Veuillez entrer le nom d'une chanson.");
        }

        const audioPath = path.join(__dirname, `../temp_audio_${Date.now()}.mp3`);

        try {
            await replyWithTag(sock, remoteJid, msg, `🔎 Recherche de "${query}"...`);
            log(`Lancement de la recherche sur YouTube...`);
            
            const video = await Youtube.searchOne(query);
            if (!video) {
                return replyWithTag(sock, remoteJid, msg, "Aucun résultat trouvé.");
            }
            log(`Vidéo trouvée: "${video.title}"`);

            await replyWithTag(sock, remoteJid, msg, `⏳ Téléchargement et conversion de *${video.title}*...`);
            log(`Lancement du téléchargement avec yt-dlp...`);

            await ytDlpExec(video.url, {
                output: audioPath,
                extractAudio: true,
                audioFormat: 'mp3',
                format: 'bestaudio/best',
                // --- LA CORRECTION EST ICI ---
                ffmpegLocation: ffmpegPath // On indique à yt-dlp où trouver ffmpeg
            });
            log(`Téléchargement et conversion terminés.`);

            if (fs.existsSync(audioPath)) {
                log(`Fichier audio trouvé. Envoi...`);
                await sock.sendMessage(remoteJid, {
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4'
                }, { quoted: msg });
                log(`Audio envoyé.`);
            } else {
                throw new Error("Le fichier audio n'a pas été créé par yt-dlp.");
            }

        } catch (error) {
            log("Erreur dans le bloc principal:", error.message);
            await replyWithTag(sock, remoteJid, msg, "❌ Une erreur est survenue lors du téléchargement.");
        } finally {
            if (fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
                log(`Fichier temporaire supprimé: ${audioPath}`);
            }
        }
    }
};