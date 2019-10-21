const path = require('path');
const fs = require('fs');
const os = require('os');
const github = require('@actions/github');
const core = require('@actions/core');
const app = require("@octokit/app");
const exec = require('@actions/exec');
const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE, RUNNER_TEMP, JENKINS_USERNAME } = process.env

const FLAG_OUTPUT_DIR = "-d";
const FLAG_VERBOSITY_LEVEL = "-v2";
const INSPECTION_XML = path.join(GITHUB_WORKSPACE, 'Default.xml');

const TEMP_DIR = path.join(os.tmpdir(), 'inspect');
fs.mkdirSync(TEMP_DIR)

const InspectionParser = require('./InspectionParser');

console.log(INSPECTION_XML);
console.log(process.cwd());
if (!fs.existsSync(INSPECTION_XML)) {
    console.log("directory doesn't exist");
    process.exit();
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ?
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};

async function doInspect() {
  console.log("Running the IDEA inspector");

  await exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh", [GITHUB_WORKSPACE, INSPECTION_XML, TEMP_DIR, FLAG_OUTPUT_DIR, GITHUB_WORKSPACE, FLAG_VERBOSITY_LEVEL])

  console.log("Finished inspecting code");
  console.log(fs.existsSync(TEMP_DIR));

  walkDir(TEMP_DIR, function(filePath) {
    console.log(filePath);
  });

  const parser = new InspectionParser();
  fs.readdirSync(TEMP_DIR)
  .filter(file => {
    const fullPath = path.join(TEMP_DIR, file);
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
  .forEach(file => {
    console.log("Parsing %s", fullPath)
    //parser.parse()
  });
}

try {
  doInspect()
  .then(ff => process.exit(1));
} catch {
  process.exit(1)
}
