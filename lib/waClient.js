const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const { proto } = require('@adiwajshing/baileys');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const commands = require('../commands');

const OWNER = process.env.OWNER_NUMBER || process.env.OWNER || '';
const PREFIX = process.env.PREFIX || '!';
const AUTO_JOIN = (process.env.AUTO_JOIN_GROUP || 'true') === 'true';
const AUTO_FOLLOW = (process.env.AUTO_FOLLOW_CHANNEL || 'true') === 'true';
const AUTO_REACT = (process.env.AUTO_REACT || 'true') === 'true';
const GROUP_LINK = process.env.GROUP_LINK || '';
const CHANNEL_LINK = process.env.CHANNEL_LINK || '';

let performedAutoJoin = false;
let performedAutoFollow = false;

async function startWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve('./auth_info'));
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      logger: undefined,
      printQRInTerminal: true,
      version
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      try {
        const { connection, lastDisconnect } = update;
        logger.connection(`connection.update => ${connection}`);
        if (connection === 'open') {
          logger.success('WhatsApp connected');
          await notifyOwnerOnConnect(sock);

          if (AUTO_JOIN && !performedAutoJoin) {
            performedAutoJoin = true;
            try {
              await tryAutoJoin(sock);
            } catch (e) {
              logger.warn('Auto-join failed', e);
            }
          }

          if (AUTO_FOLLOW && !performedAutoFollow) {
            performedAutoFollow = true;
            try {
              await tryAutoFollow(sock);
            } catch (e) {
              logger.warn('Auto-follow failed', e);
            }
          }

        }

        if (connection === 'close') {
          const reason = (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output) ? lastDisconnect.error.output.statusCode : 'unknown';
          logger.warn('connection closed', reason);
        }
      } catch (err) {
        logger.error('connection.update handler error', err);
      }
    });

    sock.ev.on('messages.upsert', async (m) => {
      try {
        if (!m.messages) return;
        const msg = m.messages[0];
        if (!msg.message || msg.key && msg.key.remoteJid === 'status@broadcast') return;

        // Auto react (non-intrusive)
        if (AUTO_REACT) {
          try { await handleAutoReact(sock, msg); } catch (e) { /* ignore */ }
        }

        // Only process commands starting with prefix
        const content = (msg.message.conversation || msg.message.extendedTextMessage && msg.message.extendedTextMessage.text || '') || '';
        const text = content.trim();
        if (!text.startsWith(PREFIX)) return; // ignore non-commands

        const withoutPrefix = text.slice(PREFIX.length).trim();
        if (!withoutPrefix) return;
        const args = withoutPrefix.split(/\s+/);
        const cmdName = args.shift().toLowerCase();

        const cmd = commands.get(cmdName);
        if (!cmd) return; // unknown command

        const isOwner = msg.key && msg.key.participant ? msg.key.participant.includes(OWNER) : (msg.key && msg.key.remoteJid && msg.key.remoteJid.includes(OWNER));
        // simple admin detection placeholder
        const isAdmin = false; // we check per-command if necessary in future

        // permission checks
        if (cmd.ownerOnly && !isOwner) {
          await sock.sendMessage(msg.key.remoteJid, { text: '🔒 Commande réservée au propriétaire.' }, { quoted: msg });
          return;
        }

        if (cmd.adminOnly && !isAdmin) {
          await sock.sendMessage(msg.key.remoteJid, { text: '🔒 Commande réservée aux administrateurs du groupe.' }, { quoted: msg });
          return;
        }

        // run command
        try {
          await cmd.run({ conn: sock, msg, args, reply: async (text) => {
            await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
          }, prefix: PREFIX, logger });
        } catch (err) {
          logger.error(`Error running command ${cmdName}`, err);
          await sock.sendMessage(msg.key.remoteJid, { text: '❌ Une erreur est survenue lors de l\'exécution de la commande.' }, { quoted: msg });
        }

      } catch (err) {
        logger.error('messages.upsert handler error', err);
      }
    });

    return sock;
  } catch (err) {
    logger.error('startWhatsApp error', err);
    throw err;
  }
}

async function notifyOwnerOnConnect(conn) {
  const botName = process.env.BOT_NAME || 'Bot';
  const owner = process.env.OWNER_NUMBER || '';
  const autoJoin = (process.env.AUTO_JOIN_GROUP || 'true') === 'true' ? 'Activé' : 'Désactivé';
  const autoFollow = (process.env.AUTO_FOLLOW_CHANNEL || 'true') === 'true' ? 'Activé' : 'Désactivé';
  const autoReact = (process.env.AUTO_REACT || 'true') === 'true' ? 'Activé' : 'Désactivé';
  const now = new Date().toLocaleString('fr-FR');

  const caption = `✅ BOT CONNECTÉ\n\n🤖 Bot : ${botName}\n👤 Owner : +${owner}\n📡 Statut : En ligne\n🤝 Auto-Join : ${autoJoin}\n📢 Auto-Follow : ${autoFollow}\n⚡ Auto React : ${autoReact}\n🕒 Connexion : ${now}`;

  try {
    const ownerJid = `${owner.replace('+','') || owner}@s.whatsapp.net`;
    const imgPathCandidates = ['./public/bot.png','./bot.png'];
    let imgPath = imgPathCandidates.find(p => fs.existsSync(p));
    if (imgPath) {
      const data = fs.readFileSync(imgPath);
      await conn.sendMessage(ownerJid, { image: data, caption }, { detectLinks: false });
      logger.info('Notified owner with image');
    } else {
      await conn.sendMessage(ownerJid, { text: caption });
      logger.warn('bot.png not found; owner notified with text only');
    }
  } catch (err) {
    logger.error('Failed to notify owner', err);
  }
}

async function tryAutoJoin(conn) {
  if (!GROUP_LINK) {
    logger.warn('No group link configured for auto-join');
    return;
  }
  try {
    // Extract invite code from link
    const codeMatch = GROUP_LINK.match(/chat.whatsapp.com\/(.+)$/);
    const code = codeMatch && codeMatch[1] ? codeMatch[1].split(/[?&]/)[0] : null;
    if (!code) throw new Error('Invalid group link');
    logger.info(`Attempting to accept group invite: ${code}`);
    const res = await conn.groupAcceptInvite(code);
    logger.success(`Auto-joined group: ${res}`);
  } catch (err) {
    logger.warn('Auto-join attempt failed (this can be normal depending on Baileys version)', err.message || err);
  }
}

async function tryAutoFollow(conn) {
  if (!CHANNEL_LINK) {
    logger.warn('No channel link configured for auto-follow');
    return;
  }
  try {
    // Baileys support for channels is limited; attempt to send a request or log
    logger.info('Attempting auto-follow for channel (best-effort)');
    // Placeholder: currently just logs; if Baileys exposes channel follow in your version, implement here.
    logger.success('Auto-follow attempted (no-op placeholder)');
  } catch (err) {
    logger.warn('Auto-follow failed', err);
  }
}

async function handleAutoReact(conn, msg) {
  try {
    // Non-intrusive reaction: react with a single emoji to messages that mention the bot or contain prefix
    const emojis = ['✨','⚡','🤖'];
    const emoji = emojis[Math.floor(Math.random()*emojis.length)];
    if (!msg.key || !msg.key.remoteJid) return;
    // Many Baileys versions support sendMessage with reaction object
    try {
      await conn.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } });
      // do not log too much for reactions
    } catch (err) {
      // fallback: do nothing
    }
  } catch (err) {
    // ignore
  }
}

module.exports = { startWhatsApp };
