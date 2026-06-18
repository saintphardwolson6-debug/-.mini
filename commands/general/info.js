module.exports = {
  name: 'info',
  description: 'Informations détaillées du bot',
  category: 'Général',
  ownerOnly: false,
  adminOnly: false,
  async run({ conn, msg, args, reply }) {
    const botName = process.env.BOT_NAME || 'Bot';
    const owner = process.env.OWNER_NUMBER || '';
    const text = `🤖 ${botName}\n👤 Owner: +${owner}\n🔧 Version: 1.0.0\n📡 Statut: En ligne`;
    await reply(text);
  }
};
