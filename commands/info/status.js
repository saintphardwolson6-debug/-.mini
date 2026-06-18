module.exports = {
  name: 'status',
  description: 'Statut du bot',
  category: 'Info',
  ownerOnly: false,
  adminOnly: false,
  async run({ conn, msg, args, reply }) {
    const now = new Date().toLocaleString('fr-FR');
    const autoJoin = (process.env.AUTO_JOIN_GROUP || 'true') === 'true' ? 'Activé' : 'Désactivé';
    const autoFollow = (process.env.AUTO_FOLLOW_CHANNEL || 'true') === 'true' ? 'Activé' : 'Désactivé';
    const autoReact = (process.env.AUTO_REACT || 'true') === 'true' ? 'Activé' : 'Désactivé';
    const text = `📡 Statut : En ligne\n🤝 Auto-Join : ${autoJoin}\n📢 Auto-Follow : ${autoFollow}\n⚡ Auto React : ${autoReact}\n🕒 ${now}`;
    await reply(text);
  }
};
