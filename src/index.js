const path = require('path');
const fs = require('fs');
const os = require('os');
const github = require('@actions/github');
const core = require('@actions/core');
const app = require("@octokit/app");
const exec = require('@actions/exec');
const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE, RUNNER_TEMP, JENKINS_USERNAME } = process.env;

const FLAG_OUTPUT_DIR = "-d";
const FLAG_VERBOSITY_LEVEL = "-v2";
const INSPECTION_XML = path.join(GITHUB_WORKSPACE, 'Default.xml');

const TEMP_DIR = path.join(os.tmpdir(), 'inspect');
fs.mkdirSync(TEMP_DIR);

const InspectionParser = require('./InspectionParser');
const DefaultRunner = require('./defaultRunner');

const octokit = new github.GitHub(GITHUB_TOKEN, { required: true });

console.log(INSPECTION_XML);
console.log(process.cwd());
if (!fs.existsSync(INSPECTION_XML)) {
    console.log("directory doesn't exist");
    process.exit();
}

async function doInspect() {
  console.log("Running the IDEA inspector");
  await exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh", [GITHUB_WORKSPACE, INSPECTION_XML, TEMP_DIR, FLAG_OUTPUT_DIR, GITHUB_WORKSPACE, FLAG_VERBOSITY_LEVEL]);
  console.log("Finished inspecting code");
  const parser = new InspectionParser();
  const runner = new DefaultRunner(TEMP_DIR, parser);
  return runner.run()
}


const githubClient = new github.GitHub(GITHUB_TOKEN);
console.log(github.context.repo)
const response = await github.checks.create({
  ...github.context.repo,
  name: github.context.action,
  head_sha: github.context.sha,
  started_at: new Date().toISOString(),
});
console.log(JSON.stringify(response));


doInspect()
  .then(annotations => {
    console.log(annotations);
    console.log("Done");
    process.exit(0)
  })
  .catch(err => {
    console.log("Oops!");
    console.log(err);
    process.exit(1)
  });
