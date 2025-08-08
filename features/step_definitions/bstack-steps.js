'use strict';

var assert = require('assert');
const { Given, When, Then } = require("@cucumber/cucumber");
const { By, until, Key } = require("selenium-webdriver");

async function ensureNativeContext(driver) {
  try {
    const contexts = await driver.getContexts();
    const current = await driver.getContext();
    if (Array.isArray(contexts) && contexts.includes('NATIVE_APP') && current !== 'NATIVE_APP') {
      await driver.switchContext('NATIVE_APP');
    }
  } catch (e) {}
}

Given(/^I dismiss the Braze in-app message$/, async function () {
  // Try in WEBVIEW first (autoWebview may have switched already)
  try {
    const contexts = await this.driver.getContexts();
    const webview = Array.isArray(contexts) ? contexts.find((c) => c.includes('WEBVIEW')) : undefined;
    if (webview) {
      try {
        const current = await this.driver.getContext();
        if (current !== webview) {
          await this.driver.switchContext(webview);
        }
      } catch (e) {}
    }
    await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//*[contains(translate(normalize-space(.),'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),'CONTINUE')]")
        ),
        8000
      )
      .click();
  } catch (e) {
    // If not present, continue silently
  } finally {
    await ensureNativeContext(this.driver);
  }
});

When(/^I open the drawer and navigate to Search$/, async function () {
  await ensureNativeContext(this.driver);
  let clickedButton = false;
  try {
    // Preferred: find ImageButton inside Toolbar regardless of content-desc
    const toolbarButton = await this.driver
      .wait(
        until.elementLocated(
          By.xpath("//androidx.appcompat.widget.Toolbar//android.widget.ImageButton")
        ),
        1500
      );
    await toolbarButton.click();
    clickedButton = true;
  } catch (e) {
    try {
      const menuButton = await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//android.widget.ImageButton[@content-desc='Open navigation drawer' or @content-desc='Navigate up' or contains(@content-desc,'drawer') or contains(@content-desc,'Navigate')]")
          ),
          1500
        );
      await menuButton.click();
      clickedButton = true;
    } catch (e2) {}
  }

  if (!clickedButton) {
    // Fallback: open drawer by a left-edge drag gesture across the screen
    const win = await this.driver.manage().window().getRect();
    const startX = 3;
    const centerY = Math.floor(win.height * 0.25);
    const endX = Math.floor(win.width * 0.85);
    try {
      await this.driver.executeScript("mobile: dragGesture", {
        startX,
        startY: centerY,
        endX,
        endY: centerY,
        speed: 600,
      });
    } catch (e) {
      // Older drivers: try swipeGesture as a last resort
      await this.driver.executeScript("mobile: swipeGesture", {
        left: 0,
        top: Math.floor(win.height * 0.15),
        width: Math.max(1, Math.floor(win.width * 0.3)),
        height: Math.max(1, Math.floor(win.height * 0.5)),
        direction: "right",
        percent: 0.98,
      });
    }
    await this.driver.sleep(800);
  }
  const findSearchElement = async () => {
    // Try direct text match first
    let els = await this.driver.findElements(
      By.xpath("//*[@text='Search' or contains(translate(@text,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'search')]")
    );
    if (els.length > 0) return els[0];

    // Fallback: iterate all TextViews and match by retrieved text (handles trimmed/ellipsized text)
    els = await this.driver.findElements(By.className('android.widget.TextView'));
    for (const el of els) {
      try {
        const label = (await el.getText()) || '';
        if (label.trim().toLowerCase().includes('search')) {
          return el;
        }
      } catch (e) {}
    }
    return null;
  };

  // Try quickly without scrolling
  let searchEl = await findSearchElement();
  if (searchEl) {
    await searchEl.click();
    return;
  }

  // Scroll within the left side panel area until found
  const win = await this.driver.manage().window().getRect();
  const left = 10;
  const width = Math.floor(win.width * 0.6);
  const top = Math.floor(win.height * 0.2);
  const height = Math.floor(win.height * 0.6);

  for (let attempt = 0; attempt < 8; attempt++) {
    searchEl = await findSearchElement();
    if (searchEl) {
      await searchEl.click();
      return;
    }
    try {
      await this.driver.executeScript("mobile: swipeGesture", {
        left,
        top,
        width,
        height,
        direction: "up",
        percent: 0.85,
      });
    } catch (e) {
      await this.driver.executeScript("mobile: dragGesture", {
        startX: left + Math.floor(width * 0.5),
        startY: top + Math.floor(height * 0.9),
        endX: left + Math.floor(width * 0.5),
        endY: top + Math.floor(height * 0.1),
        speed: 600,
      });
    }
    await this.driver.sleep(400);
  }

  // Final check
  searchEl = await findSearchElement();
  if (searchEl) {
    await searchEl.click();
    return;
  }
  throw new Error("Could not find 'Search' item after opening the drawer and scrolling");
});

// Removed brittle absolute XPath step that is no longer used.

When(/^I search with keyword "([^"]*)"$/, async function (keyword) {
  const input = await this.driver.wait(
    until.elementLocated(
      By.xpath("//*[contains(@resource-id,'id/searchEdit')]")
    ),
    30000
  );
  await input.click();
  try { await input.clear(); } catch (e) {}
  await input.sendKeys(keyword, Key.ENTER);
  await this.driver.sleep(2000);
});

Then(/^The search results should be listed/, async function () {
  const recycler = await this.driver.wait(
    until.elementLocated(
      By.xpath("//*[contains(@resource-id,'id/recyclerView')]")
    ),
    15000
  );

  // If a "no results" view exists and is visible, fail early
  const noResultsCandidates = await this.driver.findElements(
    By.xpath("//*[contains(@resource-id,'id/noResults')]")
  );
  if (noResultsCandidates.length > 0) {
    const visible = await noResultsCandidates[0].isDisplayed();
    if (visible) {
      assert(false, 'No results were returned for the search query');
    }
  }

  // Wait until RecyclerView has at least one child item
  let items = [];
  const timeoutAt = Date.now() + 15000;
  do {
    items = await this.driver.findElements(
      By.xpath("//*[contains(@resource-id,'id/recyclerView')]/*")
    );
    if (items.length > 0) break;
    await this.driver.sleep(500);
  } while (Date.now() < timeoutAt);

  assert(items.length > 0, 'Expected at least one search result in recyclerView');
});
