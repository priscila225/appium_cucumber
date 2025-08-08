'use strict';

const { Builder, Capabilities } = require("selenium-webdriver");
const { Before, After, AfterAll } = require("@cucumber/cucumber");
const { generate: generateHtmlReport } = require('multiple-cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

var createBrowserStackSession = function(){
  return new Builder().
    usingServer('http://localhost:4444/wd/hub').
    build();
}

Before(function (scenario, callback) {
  var world = this;
  world.driver = createBrowserStackSession();
  callback();
});

After(function(scenario, callback){
  // Don't generate report here - it should be done after all scenarios
  this.driver.quit().then(function(){
    callback();
  });
});

// Generate HTML report after ALL scenarios complete
AfterAll(function(callback) {
  console.log('Generating HTML report...');
  
  // Create directories if they don't exist
  const jsonDir = './report/json-output/';
  const reportPath = './report/report/';
  
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
  }
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true });
  }
  
  // Check if the JSON file exists
  const jsonFile = path.join(jsonDir, 'report.json');
  if (!fs.existsSync(jsonFile)) {
    console.log('No JSON report file found, skipping HTML generation');
    callback();
    return;
  }
  
  // Read the JSON file to verify it has content
  try {
    const jsonContent = fs.readFileSync(jsonFile, 'utf8');
    const jsonData = JSON.parse(jsonContent);
    console.log(`Found JSON report with ${jsonData.length || 0} scenarios`);
  } catch (error) {
    console.log('JSON file exists but is empty or invalid, skipping HTML generation');
    callback();
    return;
  }
  
  try {
    generateHtmlReport({
      jsonDir: jsonDir,
      reportPath: reportPath,
      pageTitle: `CoreApps Android - ${moment().tz('America/New_York').format('YYYY-MM-DD[T]HH:mm')} - Test Report`,
      metadata: {
        browser: {
          name: 'chrome',
          version: 'latest'
        },
        device: 'Samsung Galaxy S22 Ultra',
        platform: {
          name: 'android',
          version: '12.0'
        }
      },
      customData: {
        title: 'CoreApps Android App Test Report',
        data: [
          { label: 'Project', value: 'CoreApps Android' },
          { label: 'Release', value: '1.0.0' },
          { label: 'Execution Start Time', value: new Date().toISOString() }
        ]
      },
      // Ensure it processes the single JSON file
      displayDuration: true,
      displayReportTime: true,
      displayMetadata: true,
      displayCustomData: true
    });
    console.log('TML report generated successfully');
  } catch (error) {
    console.error('Error generating HTML report:', error.message);
    console.error('Error details:', error);
  }
  
  callback();
});
