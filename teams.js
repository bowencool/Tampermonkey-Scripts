// ==UserScript==
// @name         Teams自动深色模式
// @version      0.1.1
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://teams.microsoft.com/
// @match        https://teams.microsoft.com/_*
// @icon         https://statics.teams.cdn.office.net/hashed/favicon/prod/favicon-32x32-4102f07.png
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
    const link = document.querySelector('#themed-stylesheet[rel="stylesheet"]');
    const url = link.href;
    const currentThemeIsDark = url.includes("dark");
    console.log({ isDarkMode, currentThemeIsDark });
    if (isDarkMode) {
      if (currentThemeIsDark) return;
      (await waitForElementToExist("#settings-menu-button")).click();
      (
        await waitForElementToExist(
          '[data-tid="settingsDropdownOptionsButton"]'
        )
      ).click();
      (
        await waitForElementToExist(
          '[data-tid="optionsSettingsDialog-General"]'
        )
      ).click();
      (await waitForElementToExist('[data-tid="dark-theme"]')).click();
      (await waitForElementToExist('[data-tid="closeModelDialogBtn"]')).click();
    } else {
      if (!currentThemeIsDark) return;
      (await waitForElementToExist("#settings-menu-button")).click();
      (
        await waitForElementToExist(
          '[data-tid="settingsDropdownOptionsButton"]'
        )
      ).click();
      (
        await waitForElementToExist(
          '[data-tid="optionsSettingsDialog-General"]'
        )
      ).click();
      (await waitForElementToExist('[data-tid="default-theme"]')).click();
      (await waitForElementToExist('[data-tid="closeModelDialogBtn"]')).click();
    }
  }
  toggle();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      toggle(e.matches);
    });
})();
