module.exports = {
  name: 'ping',
  description: 'Vérifie la latence',
  category: 'Général',
  ownerOnly: false,
  adminOnly: false,
  async run({ conn, msg, args, reply }) {
    const start = Date.now();
    await reply('🏓 Pong…');
    const latency = Date.now() - start;
    await reply(`🏓 Pong — ${latency} ms`);
  }
};
