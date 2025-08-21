// index.js
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const db = require('./database');
const startTime = new Date();

const AUTH_FOLDER = path.join(__dirname, "auth_info");
const PREFIX = "!";
const BOT_NAME = "PSYCHO BOT";
const BOT_TAG = `*${BOT_NAME}* 👨🏻‍💻`;

// --- Loader de commandes ---
const commands = new Map();
const commandFolder = path.join(__dirname, 'commands');
if (!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder);

const commandFiles = fs.readdirSync(commandFolder).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    try {
        const command = require(path.join(commandFolder, file));
        commands.set(command.name, command);
        console.log(`[CommandLoader] Commande chargée : ${command.name}`);
    } catch (error) {
        console.error(`[CommandLoader] Erreur de chargement de la commande ${file}:`, error);
    }
}

// --- Fonctions utilitaires ---
function replyWithTag(sock, jid, quoted, text) {
    return sock.sendMessage(jid, { text: `${BOT_TAG}\n\n${text}` }, { quoted });
}

function getMessageText(msg) {
    const m = msg.message;
    if (!m) return "";
    return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || "";
}

// --- Démarrage du bot ---
async function startBot() {
    console.log("Démarrage du bot WhatsApp...");
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using Baileys v${version.join(".")}, isLatest: ${isLatest}`);
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("------------------------------------------------");
            qrcode.generate(qr, { small: true });
            console.log("[QR Code] Scannez ce code avec WhatsApp.");
            console.log("------------------------------------------------");
        }
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connexion fermée:", lastDisconnect.error, ", reconnexion:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ Bot WhatsApp connecté avec succès !");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // --- Gestion des messages ---
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify" || !messages[0]?.message) return;
        const msg = messages[0];
        const remoteJid = msg.key.remoteJid;
        const senderId = msg.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : (remoteJid.endsWith('@g.us') ? msg.key.participant : remoteJid);

        await db.getOrRegisterUser(senderId, msg.pushName || "Unknown");

        const messageContent = getMessageText(msg);
        if (!messageContent?.startsWith(PREFIX)) return;

        const args = messageContent.slice(PREFIX.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = commands.get(commandName);
        if (!command) return;

        // --- Bloc try/catch pour chaque commande ---
        try {
            const isGroup = remoteJid.endsWith('@g.us');
            if (command.adminOnly) {
                if (!isGroup) return replyWithTag(sock, remoteJid, msg, "⛔ Commande réservée aux groupes.");
                
                const groupMetadata = await sock.groupMetadata(remoteJid);
                
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const botInGroup = groupMetadata.participants.find(p => p.id === botId);
                const botIsAdmin = botInGroup?.admin === 'admin' || botInGroup?.admin === 'superadmin';

                if (!botIsAdmin) {
                    return replyWithTag(sock, remoteJid, msg, "⚠️ Je ne peux pas exécuter cette commande car je ne suis pas administrateur de ce groupe.");
                }

                const senderIsAdmin = groupMetadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
                if (!senderIsAdmin) return replyWithTag(sock, remoteJid, msg, "⛔ Seuls les admins peuvent utiliser cette commande.");
            }
            
            console.log(`[EXECUTION] Tentative d'exécution de la commande "${commandName}" par ${senderId}`);
            await command.run({ sock, msg, args, replyWithTag, commands, db, startTime });
            console.log(`[EXECUTION] Succès de la commande "${commandName}"`);

            await db.incrementCommandCount(senderId);

        } catch (err) {
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.error(`[ERREUR FATALE] Un crash a eu lieu dans la commande "${commandName}"`);
            console.error('Message de l\'erreur:', err.message);
            console.error('Stack de l\'erreur:', err.stack);
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            
            try {
                await replyWithTag(sock, remoteJid, msg, "❌ Oups ! Une erreur critique est survenue. Le développeur a été notifié.");
            } catch (replyError) {
                console.error('[ERREUR FATALE] Impossible même de répondre à l\'utilisateur. Erreur:', replyError.message);
            }
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        // Ici tu peux gérer l'accueil des nouveaux membres si tu veux
    });
}

// --- Serveur web ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send({ status: "online", botName: BOT_NAME, uptime: (new Date() - startTime) / 1000 });
});
app.listen(PORT, () => {
    console.log(`[WebServer] Serveur web démarré et à l'écoute sur le port ${PORT}`);
    startBot();
});
