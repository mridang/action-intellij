const fs = require('fs');
const xml = require('xml2js');
const prefix = "file://$PROJECT_DIR$/"

class InspectionParser {

  async parse(path) {
    let data = fs.readFileSync(path, 'utf8');
    let result = await xml.parseStringPromise(data);
    return result.problems.problem
      .map(problem => {
        return {
          path: problem.file[0].replace(prefix, ""),
          start_line: problem.line[0],
          end_line: problem.line[0],
          annotation_level: "warning",
          message: problem.description[0]
        };
      });
  }
}

module.exports = InspectionParser;
