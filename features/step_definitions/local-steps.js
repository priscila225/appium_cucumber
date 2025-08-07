'use strict';

var assert = require('assert');
const { When, Then } = require("@cucumber/cucumber");
const { By, until } = require("selenium-webdriver");

When(/^I start test on the Local Sample App$/, async function () {
  await this.driver.wait(
    until.elementLocated(
      By.xpath(
        '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[2]/android.view.ViewGroup/android.widget.Button'
      )
    ), 30000
  ).click();
});

Then(/^I should see "([^"]*)"$/, async function (sourceMatch) {
  var textElement = await this.driver.wait(
    until.elementLocated(
      By.xpath(
        '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[2]/android.view.ViewGroup/android.widget.TextView'
      ), 30000
    )
  ).getText();

  assert(textElement.includes('The active connection is wifi'));
  assert(textElement.includes('Up and running'));
});
