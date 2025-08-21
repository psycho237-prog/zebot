function formatUptime(ms) {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)));
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    return parts.join(' ') || 'quelques instants';
}

const log = require('../logger')(module);

module.exports = {
    name: 'info',
    description: 'Affiche des informations et statistiques sur le bot.',
    adminOnly: false,
    run: async ({ sock, msg, db, startTime, replyWithTag }) => {
        const BOT_NAME = "PSYCHO BOT";
        const PREFIX = ".";
        const userCount = await db.getTotalUsers();
        const commandCount = await db.getTotalCommands();
        const uptimeString = formatUptime(Date.now() - startTime);
        const remoteJid = msg.key.remoteJid;

        log(`Commande reçue de ${remoteJid}`);

        let infoText = `╭───≼ ℹ️ *INFOS DU BOT* ≽───╮\n│\n`;
        infoText += `│  🤖 *Nom:* ${BOT_NAME}\n`;
        infoText += `│  👨‍💻 *Développeur:* PSYCHO\n`;
        infoText += `│  ⚙️ *Version:* 1.0.0\n`;
        infoText += `│  ◈ *Prefix:* \`${PREFIX}\`\n│\n`;
        infoText += `├─···──< 📊 *STATISTIQUES* >──···─┤\n│\n`;
        infoText += `│  ⏳ *En ligne depuis:* ${uptimeString}\n`;
        infoText += `│  👥 *Utilisateurs Vus:* ${userCount}\n`;
        infoText += `│  📈 *Commandes Traitées:* ${commandCount}\n│\n`;
        infoText += `╰───≼ XYBERCLAN ≽───╯`;

        await replyWithTag(sock, remoteJid, msg, infoText);
    }
};
