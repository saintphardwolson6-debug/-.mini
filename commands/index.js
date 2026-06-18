const fs = require('fs');
const path = require('path');

// Dynamic loader for command files
const commands = new Map();

function loadCommands(dir = path.resolve(__dirname)) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) loadCommands(path.join(dir, file.name));
    if (file.isFile() && file.name.endsWith('.js')) {
      try {
        const cmd = require(path.join(dir, file.name));
        if (cmd && cmd.name) {
          commands.set(cmd.name, cmd);
        }
      } catch (err) {
        // ignore faulty command at load time
        console.error('Failed loading command', file.name, err.message);
      }
    }
  }
}

// initial load
loadCommands(path.resolve(__dirname));

module.exports = {
  get: (name) => commands.get(name),
  list: () => Array.from(commands.values())
};
