import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import express from 'express';
import logFactory from './logger.mjs';

// --- Logger ---
const log = logFactory(module);

// --- Config serveur web ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send('Bot en ligne !'));
app.listen(PORT, () => log(`Serveur web actif sur le port ${PORT}`));

// --- Auth ---
const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

// --- Charger les commandes ---
const commands = new Map();
const commandsPath = path.join('./commands');
fs.readdirSync(commandsPath).forEach(file => {
    if (file.endsWith('.mjs')) {
        const command = await import(path.join(commandsPath, file));
        commands.set(command.default.name, command.default);
        log(`Commande chargée : ${command.default.name}`);
    }
});

// --- DB factice ---
const db = {
    getTotalUsers: async () => 0,
    getTotalCommands: async () => commands.size
};

// --- Démarrage du bot ---
const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
});

// --- Sauvegarde auto des credentials ---
sock.ev.on('creds.update', saveCreds);

// --- Gestion messages ---
sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const body = msg.message.conversation || msg.message?.extendedTextMessage?.text || '';
    if (!body.startsWith('-')) return;

    const args = body.trim().split(/ +/);
    const cmdName = args.shift().slice(1).toLowerCase();

    const command = commands.get(cmdName);
    if (!command) return;

    log(`[EXECUTION] Tentative d'exécution de la commande "${cmdName}" par ${msg.key.remoteJid}`);

    try {
        await command.run({
            sock,
            msg,
            args,
            commands,
            db,
            startTime: Date.now(),
            replyWithTag: async (sock, jid, msg, text) => {
                await sock.sendMessage(jid, { text }, { quoted: msg });
            }
        });
        log(`[EXECUTION] Succès de la commande "${cmdName}"`);
    } catch (err) {
        console.error(`[ERREUR FATALE] Un crash a eu lieu dans la commande "${cmdName}"`, err.message);
    }
});

// --- Gestion déconnexion ---
sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        log(`Déconnexion : ${reason}. Tentative de reconnexion...`);
    } else if (connection === 'open') {
        log('✅ Bot WhatsApp connecté avec succès !');
    }
});
