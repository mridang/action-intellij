const fs = require('fs');
const xml = require('xml2js');

class InspectionParser {

  parse(path) {
    var data = fs.readFileSync(path, 'utf8');
    return xml.parseStringPromise(data)
    .then(result => {
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
    });
  }
}

module.exports = InspectionParser;
