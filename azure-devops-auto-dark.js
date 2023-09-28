// ==UserScript==
// @name         Azure devops auto dark mode
// @version      0.1.1
// @description  Automatically switch the dark mode according to the system settings, which uses the official style
// @namespace    https://dev.azure.com/
// @match        https://dev.azure.com/*
// @icon         https://cdn.vsassets.io/content/icons/favicon.ico
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

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

  async function toggle(
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    /* 有两个事件会触发，而且有循环，必须加判断 */
    const bgColor = window.getComputedStyle(document.body).backgroundColor;

    const currentThemeIsDark = bgColor !== "rgb(255, 255, 255)";
    console.log({ isDarkMode, currentThemeIsDark });
    if (isDarkMode) {
      if (currentThemeIsDark) return;
      (await waitForElementToExist('[aria-label="User settings"]')).click();
      (await waitForElementToExist("#__bolt-changeThemeLink")).click();
      (
        await waitForElementToExist("#theme-ms-vss-web-vsts-theme-dark")
      ).click();
      (await waitForElementToExist('.theme-panel [aria-label="Close"]')).click();
    } else {
      if (!currentThemeIsDark) return;
      (await waitForElementToExist('[aria-label="User settings"]')).click();
      (await waitForElementToExist("#__bolt-changeThemeLink")).click();
      (
        await waitForElementToExist("#theme-ms-vss-web-vsts-theme")
      ).click();
      (await waitForElementToExist('.theme-panel [aria-label="Close"]')).click();
    }
  }
  toggle();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      toggle(e.matches);
    });
})();
