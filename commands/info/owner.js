module.exports = {
  name: 'owner',
  description: 'Contact du propriétaire',
  category: 'Info',
  ownerOnly: false,
  adminOnly: false,
  async run({ conn, msg, args, reply }) {
    const owner = process.env.OWNER_NUMBER || '';
    await reply(`👑 Owner : +${owner}`);
  }
};
