module.exports = {
  name: 'menu',
  description: 'Affiche le menu principal',
  category: 'Général',
  ownerOnly: false,
  adminOnly: false,
  async run({ conn, msg, args, reply }) {
    const botName = process.env.BOT_NAME || 'Bot';
    const owner = process.env.OWNER_NUMBER || '';
    const prefix = process.env.PREFIX || '!';
    const cmds = require('../index');
    const total = cmds.list().length;

    const text = `╔════════════════════════════╗\n║  ${botName}  ║\n╚════════════════════════════╝\n\n📋 MENU PRINCIPAL\n• Liste des commandes\n\nℹ️ INFORMATIONS\n🤖 Bot: ${botName}\n👑 Owner: ${owner}\n📋 Prefix: ${prefix}\n📊 Commandes: ${total}`;
    await reply(text);
  }
};
