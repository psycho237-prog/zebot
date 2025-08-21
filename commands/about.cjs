// commands/about.js
const log = require('../logger')(module);

module.exports = {
    name: 'about',
    description: 'Affiche une carte de visite stylisée du bot et de son créateur.',
    adminOnly: false,
    run: async ({ sock, msg, replyWithTag }) => {
        const remoteJid = msg.key.remoteJid;
        const BOT_NAME = 'PSYCHO BOT';
        const CREATOR_NAME = 'PSYCHO';
        // --- REMPLACEZ CES LIENS PAR LES VÔTRES ---
        const GITHUB_LINK = 'https://github.com/psycho237-prog';
        const LINKEDIN_LINK = 'https://www.linkedin.com/in/onana-gregoire-legrand-a18529282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app';
        // ------------------------------------------
        log(`Génération de la carte de visite pour ${remoteJid}`);

        try {
            let portfolioText = '';
            portfolioText += `      ╔══════════════════════╗\n`;
            portfolioText += `      ║          *${BOT_NAME}*          ║\n`;
            portfolioText += `      ╚══════════════════════╝\n\n`;
            portfolioText += `*「 Un assistant puissant et élégant pour votre groupe WhatsApp. 」*\n\n`;
            portfolioText += `     ┌ • *Développé par*\n`;
            portfolioText += `     └ ⋅ ${CREATOR_NAME}\n\n`;
            portfolioText += `     ┌ • *Technologie*\n`;
            portfolioText += `     └ ⋅ Node.js & Baileys\n\n`;
            portfolioText += `────────────────────────\n\n`;
            portfolioText += `👨‍💻 *Découvrez mon créateur :*\n`;
            portfolioText += `   ↳ _GitHub:_ ${GITHUB_LINK}\n`;
            portfolioText += `   ↳ _LinkedIn:_ ${LINKEDIN_LINK}\n\n`;
            portfolioText += `➡️ Tapez *.help* pour explorer mes commandes.`;

            let pfpUrl;
            try {
                pfpUrl = await sock.profilePictureUrl(sock.user.id, 'image');
            } catch { log('Impossible de récupérer la photo de profil, envoi du texte seul.'); }
            
            if (pfpUrl) {
                await sock.sendMessage(remoteJid, {
                    image: { url: pfpUrl },
                    caption: portfolioText,
                    contextInfo: {
                        externalAdReply: {
                            title: BOT_NAME,
                            body: `Développé par ${CREATOR_NAME}`,
                            sourceUrl: GITHUB_LINK
                        }
                    }
                }, { quoted: msg });
            } else {
                await replyWithTag(sock, remoteJid, msg, portfolioText);
            }
            log("Carte de visite envoyée.");

        } catch (error) {
            log('Erreur:', error.message);
            await replyWithTag(sock, remoteJid, msg, '❌ Erreur lors de la création de ma carte de visite.');
        }
    },
};
