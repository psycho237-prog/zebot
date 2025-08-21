const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require("qrcode");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const tar = require("tar");
const db = require('./database');
const startTime = new Date();

const AUTH_FOLDER = path.join(__dirname, "auth_info");
const PREFIX = "/";   
const BOT_NAME = "PSYCHO BOT";
const BOT_TAG = `*${BOT_NAME}* 👨🏻‍💻`;

let lastQr = null;

// --- Décompression automatique de auth_info.tar.xz ---
const tarPath = path.join(__dirname, "auth_info.tar.xz");
if (fs.existsSync(tarPath) && !fs.existsSync(AUTH_FOLDER)) {
    console.log("[Auth] Décompression de auth_info.tar.xz...");
    tar.x({ file: tarPath, C: __dirname })
       .then(() => console.log("[Auth] Décompression terminée ✅"))
       .catch(err => console.error("[Auth] Erreur :", err));
}

// --- Loader de commandes ---
const commands = new Map();
const commandFolder = path.join(__dirname, 'commands');
if (!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder);

const commandFiles = fs.readdirSync(commandFolder).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    try {
        const command = require(path.join(commandFolder, file));
        commands.set(command.name, command);
        console.log(`[CommandLoader] Commande chargée : ${command.name}`);
    } catch (err) {
        console.error(`[CommandLoader] Erreur de chargement ${file}:`, err);
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
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    const sock = makeWASocket({ version, auth: state, logger: pino({ level: "silent" }) });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            lastQr = await qrcode.toDataURL(qr);
            console.log("[QR Code] Nouveau QR disponible sur /qr");
        }
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === "open") lastQr = null;
    });

    sock.ev.on("creds.update", saveCreds);

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

        try {
            const isGroup = remoteJid.endsWith('@g.us');
            if (command.adminOnly && !isGroup) return replyWithTag(sock, remoteJid, msg, "⛔ Commande réservée aux groupes.");
            console.log(`[EXECUTION] Commande "${commandName}" par ${senderId}`);
            await command.run({ sock, msg, args, replyWithTag, commands, db, startTime });
            await db.incrementCommandCount(senderId);
        } catch (err) {
            console.error(`[ERREUR] Commande "${commandName}":`, err);
            try { await replyWithTag(sock, remoteJid, msg, "❌ Une erreur critique est survenue."); } catch {}
        }
    });
}

// --- Serveur web ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send({ status:"online", botName:BOT_NAME, uptime:(new Date()-startTime)/1000 }));
app.get('/qr', (req, res) => res.send(lastQr ? `<img src="${lastQr}" />` : "✅ Bot déjà connecté ou QR non généré."));
app.listen(PORT, () => { console.log(`[WebServer] Port ${PORT}`); startBot(); });
