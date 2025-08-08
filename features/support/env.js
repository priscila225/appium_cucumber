'use strict';

const { setDefaultTimeout, setWorldConstructor } = require("@cucumber/cucumber");

setDefaultTimeout(30 * 1000);  // Reduced from 60 seconds to 30 seconds

// Configure Cucumber to output JSON format for HTML report generation
const common = [
  '--format', 'json:report/json-output/report.json',
  '--format', 'progress'
];

module.exports = {
  default: common.join(' ')
};
