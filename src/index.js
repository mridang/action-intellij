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

async function doInspect() {
  console.log("Running the IDEA inspector");

  await exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh", [GITHUB_WORKSPACE, INSPECTION_XML, TEMP_DIR, FLAG_OUTPUT_DIR, GITHUB_WORKSPACE, FLAG_VERBOSITY_LEVEL])

  console.log("Finished inspecting code");
  console.log(fs.existsSync(TEMP_DIR));

  const parser = new InspectionParser();
  fs.readdir(TEMP_DIR, function (err, files) { if (err) throw err;
    myfiles = [];
    files.forEach( function (file) {
      const fullPath = path.join(TEMP_DIR, file);
      console.log("Parsing %s", fullPath)
    });
    console.log(myfiles);
  });
}

try {
  doInspect()
  .then(ff => process.exit(1));
} catch {
  console.log("poop");
}
