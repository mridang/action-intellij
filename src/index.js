const path = require('path');
const fs = require('fs');
const github = require('@actions/github');
const core = require('@actions/core');
const app = require("@octokit/app");
const exec = require('@actions/exec');
const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE, RUNNER_TEMP, JENKINS_USERNAME } = process.env

console.log(process.env);
const OUTPUT_DIR = "-d";
const VERBOSITY_LEVEL = "-v2";
const INSPECTION_XML = path.join(GITHUB_WORKSPACE, 'Default.xml');

const InspectionParser = require('./InspectionParser');

console.log(process.env);

console.log(INSPECTION_XML);
console.log(process.cwd());
if (!fs.existsSync(INSPECTION_XML)) {
    console.log("directory doesn't exist");
    process.exit();
}


exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh", [GITHUB_WORKSPACE, INSPECTION_XML, RUNNER_TEMP, OUTPUT_DIR, GITHUB_WORKSPACE, VERBOSITY_LEVEL])
const parser = new InspectionParser();
console.log("ran command");
console.log(fs.existsSync(OUTPUT_DIR));

fs.readdir(OUTPUT_DIR, function (err, files) { if (err) throw err;
  myfiles = [];
  files.forEach( function (file) {
    const fullPath = path.join(dir, file);
    console.log("Parsing %s", fullPath)
    parser.parse(fullPath)
    .then(result => {
      //console.log(result);
    });
  });
  //console.log(myfiles);
});


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

//run();


/*parser = new Parser():

checks = new Checks()
for file in directory.xml:
   checks.add(parser.parse(file))
api.post(checks);
*/
