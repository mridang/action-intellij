const fs = require('fs');
const xml = require('xml2js');

class InspectionParser {

  async parse(path) {
    var data = fs.readFileSync(path, 'utf8');
    var result = await xml.parseStringPromise(data)
    return result.problems.problem
      .map(problem => {
        return {
          path: problem.file[0],
          start_line: problem.line[0],
          end_line: problem.line[0],
          annotation_level: "warning",
          message: problem.description[0]
        };
      });
  }
}

module.exports = InspectionParser;
