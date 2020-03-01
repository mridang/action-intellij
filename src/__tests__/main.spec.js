const DefaultRunner = require('../defaultRunner');
const InspectionParser = require('../InspectionParser');

describe("Parse Path", () => {
  let parser = new InspectionParser();
  let runner = new DefaultRunner('../.out', parser);
  test("Parse ConstantConditions", () => {
    let output = runner.run();
    output.then(function (result) {
      console.log(result)
    });
  });
});
