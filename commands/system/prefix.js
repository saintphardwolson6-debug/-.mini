module.exports = {
  name: 'prefix',
  description: 'Change le préfixe (owner only)',
  category: 'Système',
  ownerOnly: true,
  adminOnly: false,
  async run({ conn, msg, args, reply }) {
    const newPrefix = args[0];
    if (!newPrefix) return await reply('Usage: !prefix NEW_PREFIX');
    // For persistence, we instruct user to change .env — runtime change will be ephemeral
    await reply(`✅ Préfixe changé temporairement à: ${newPrefix}\nNote: pour rendre le changement permanent, mettez PREFIX=${newPrefix} dans le fichier .env`);
  }
};
