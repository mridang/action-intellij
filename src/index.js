const path = require('path');
const fs = require('fs');
const os = require('os');
const github = require('@actions/github');
const core = require('@actions/core');
const app = require("@octokit/app");
const exec = require('@actions/exec');
const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE, RUNNER_TEMP, JENKINS_USERNAME } = process.env

console.log(process.env);
const FLAG_OUTPUT_DIR = "-d";
const FLAG_VERBOSITY_LEVEL = "-v2";
const INSPECTION_XML = path.join(GITHUB_WORKSPACE, 'Default.xml');
const TEMP_DIR = os.tmpdir();

const InspectionParser = require('./InspectionParser');

console.log(process.env);

console.log(INSPECTION_XML);
console.log(process.cwd());
if (!fs.existsSync(INSPECTION_XML)) {
    console.log("directory doesn't exist");
    process.exit();
}

async function doInspect() {
  console.log("will run command");
  await exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh", [GITHUB_WORKSPACE, INSPECTION_XML, TEMP_DIR, FLAG_OUTPUT_DIR, GITHUB_WORKSPACE, FLAG_VERBOSITY_LEVEL])
  exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh", [GITHUB_WORKSPACE, INSPECTION_XML, TEMP_DIR, FLAG_OUTPUT_DIR, GITHUB_WORKSPACE, FLAG_VERBOSITY_LEVEL])
  .then(function(dee) {
    console.log("poop")
  })
  const parser = new InspectionParser();
  console.log("ran command");
  console.log(fs.existsSync(TEMP_DIR));


  fs.readdir(TEMP_DIR, function (err, files) { if (err) throw err;
    myfiles = [];
    files.forEach( function (file) {
      const fullPath = path.join(TEMP_DIR, file);
      console.log("Parsing %s", fullPath)

    });
    console.log(myfiles);
  });
}



async function run() {
    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // myToken: ${{ secrets.GITHUB_TOKEN }
    // https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret
    console.log(GITHUB_SHA);
    console.log(GITHUB_EVENT_PATH);
    console.log(GITHUB_TOKEN);
    console.log(GITHUB_WORKSPACE);

    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);


    //const octokit = new github.GitHub("86e7f7fbbd33b0ae8c1a0666dd559c8a5243d7fd");

    const { data: pullRequest } = await octokit.checks.create({
      owner: "mridang",
      repo: "helloworld",
      name: "IntelliJ",
      head_sha: "54955a05ed2e01f72499dd3dd3de460f7260c94e"
    })

    console.log(pullRequest);
}

try {
  doInspect();
} catch {
  console.log("poop");
}

//run();


/*parser = new Parser():

checks = new Checks()
for file in directory.xml:
   checks.add(parser.parse(file))
api.post(checks);
*/
process.exit(1);
