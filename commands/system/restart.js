module.exports = {
  name: 'restart',
  description: 'Redémarre le bot (owner only)',
  category: 'Système',
  ownerOnly: true,
  adminOnly: false,
  async run({ conn, msg, args, reply, logger }) {
    await reply('🔁 Redémarrage en cours...');
    logger.info('Owner requested restart — exiting process');
    process.exit(0);
  }
};
