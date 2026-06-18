require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const { startWhatsApp } = require('./lib/waClient');

const app = express();
const PORT = process.env.PORT || 20813;

app.get('/', (req, res) => res.send(`${process.env.BOT_NAME || 'Bot'} - en ligne`));
app.get('/pair', (req, res) => res.send('Pairing: ouvrez le QR dans le terminal ou utilisez la route dédiée.'));

app.listen(PORT, () => {
  logger.connection(`Server listening on ${PORT}`);
  startWhatsApp();
});

// anti-crash
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
});
process.on('unhandledRejection', (err) => {
  logger.error('unhandledRejection', err);
});
