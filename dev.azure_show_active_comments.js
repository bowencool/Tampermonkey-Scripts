// ==UserScript==
// @name         PR 默认显示 Active Comments
// @version      0.1.2
// @description  默认显示 active comments，不用每次都点一下
// @namespace    https://dev.azure.com/
// @match        https://dev.azure.com/*/pullrequest/*
// @icon         https://cdn.vsassets.io/content/icons/favicon.ico
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(async function () {
  "use strict";

  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  function waitForElementToExist(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        subtree: true,
        childList: true,
      });
    });
  }

  const button = await waitForElementToExist(
    ".repos-activity-filter-dropdown button"
  );
  for (let i = 0; i < 10; i++) {
    button.click();
    const isActive = button.classList.contains("active");
    if (isActive) {
      break;
    }
    await sleep(500);
  }
  const dropDownId = button.getAttribute("aria-controls");
  const dropDownOption = await waitForElementToExist(`#${dropDownId} #__bolt-active_comments`);
  dropDownOption.click();
})();
