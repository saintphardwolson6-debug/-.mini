const chalk = require('chalk');

function ts() { return new Date().toISOString(); }

module.exports = {
  info: (...args) => console.log(chalk.cyan(`[INFO ${ts()}]`), ...args),
  warn: (...args) => console.log(chalk.yellow(`[WARN ${ts()}]`), ...args),
  error: (...args) => console.error(chalk.red(`[ERROR ${ts()}]`), ...args),
  success: (...args) => console.log(chalk.green(`[SUCCESS ${ts()}]`), ...args),
  debug: (...args) => console.log(chalk.gray(`[DEBUG ${ts()}]`), ...args),
  connection: (...args) => console.log(chalk.magenta(`[CONN ${ts()}]`), ...args)
};
