'use strict';

var assert = require('assert');
const { Given, When, Then } = require("@cucumber/cucumber");
const { By, until } = require("selenium-webdriver");

Given(/^I try to search using khtv App/, async function () {
  await this.driver
    .wait(
      until.elementLocated(
        By.xpath(
          "/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.view.ViewGroup/android.support.v4.view.ViewPager/android.view.ViewGroup/android.widget.FrameLayout/android.support.v7.widget.RecyclerView/android.widget.FrameLayout[1]/android.widget.LinearLayout/android.widget.TextView"
        )
      ),
      30000
    )
    .click();
});

When(/^I search with keyword BrowserStack/, async function () {
  var insertTextSelector = await this.driver.wait(
    until.elementLocated(
      By.xpath(
        "/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout[1]/android.widget.FrameLayout[1]/android.view.ViewGroup/android.widget.LinearLayout/android.support.v7.widget.LinearLayoutCompat/android.widget.LinearLayout/android.widget.LinearLayout/android.widget.LinearLayout/android.widget.AutoCompleteTextView"
      ),
      30000
    )
  );
  await insertTextSelector.sendKeys("BrowserStack");
  await this.driver.sleep(5000);
});

Then(/^The search results should be listed/, async function () {
  var allProductsName = await this.driver.findElements(
    By.xpath(
      "/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout[1]/android.widget.FrameLayout[2]/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.ListView/android.widget.LinearLayout"
    )
  );

  assert(allProductsName.length > 0);
});
