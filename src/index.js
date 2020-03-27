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


const octokit = new github.GitHub(core.getInput("myToken", { required: true }));
const {data} = octokit.checks.create({
  ...github.context.repo,
  name: github.context.action,
  head_sha: github.context.sha,
  started_at: new Date().toISOString()
})

doInspect()
  .then(annotations => {
    console.log(annotations);
    console.log("Done");

    await octokit.checks.update({
      ...github.context.repo,
      check_run_id: data.id,
      completed_at: new Date().toISOString(),
      conclusion: "success",
      output:
      {
        summary: "summary",
        title: "title",
        annotations: annotations
      },
      status: "completed"
    })
    .then(response => {
      console.log(response)
      process.exit(0)
    })
  })
  .catch(err => {
    console.log("Oops!");
    console.log(err);
    process.exit(1)
  });
