const fs = require('fs');
const path = require('path');

class DefaultRunner {

  constructor(directory, parser) {
    this.directory = directory;
    this.parser = parser;
  }

  async run() {

    const results = await Promise.all(fs.readdirSync(this.directory)
      .filter(file => {
        const fullPath = path.join(this.directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
          console.debug("Skipping directory %s", fullPath);
          return false;
        } else if (file.startsWith('.')) {
          console.debug("Skipping dotfile %s", fullPath);
          return false;
        } else {
          return true;
        }
      })
      .map(file => {
        const fullPath = path.join(this.directory, file);
        console.log("Parsing %s", fullPath);
        return this.parser.parse(fullPath)
      }));

    return results
      .reduce(function(a, b) {
          return a.concat(b);
      }, [])
  }
}

module.exports = DefaultRunner;
