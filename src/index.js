const path = require('path');
const fs = require('fs');
const github = require('@actions/github');
const core = require('@actions/core');
const app = require("@octokit/app");
const exec = require('@actions/exec');
const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE } = process.env

const InspectionParser = require('./InspectionParser');


console.log(__dirname);
const dir = path.join(__dirname, '.out');
if (!fs.existsSync(path)) {
    console.log("directory doesn't exist");
    process.exit();
}
exec.exec("/home/ijinspector/idea-IC/bin/inspect.sh . ./Default.xml . -d . -v2")
const parser = new InspectionParser();

fs.readdir(dir, function (err, files) { if (err) throw err;
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

run();


/*parser = new Parser():

checks = new Checks()
for file in directory.xml:
   checks.add(parser.parse(file))
api.post(checks);
*/
