// ==UserScript==
// @name         IBKR盈透证券自动深色模式
// @version      1.0.0
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://www.ibkr.com.cn/
// @match        https://www.ibkr.com.cn/portal*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ibkr.com
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/000000
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @require      https://raw.githubusercontent.com/bowencool/Tampermonkey-Scripts/main/shared/cookie.js
// @require      https://raw.githubusercontent.com/bowencool/Tampermonkey-Scripts/main/shared/waitForElementToExist.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  async function toggle(
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    const currentTheme = getCookie("IB_THEME")?.toLowerCase();
    console.log({ isDarkMode, currentTheme });
    if (isDarkMode) {
      if (currentTheme === "dark") return;
      (await waitForElementToExist(".one-head-menu button")).click();
      Array.from(document.querySelectorAll("button.one-user-btn"))
        .find((el) => ["Dark", "深色"].includes(el.textContent))
        ?.click();
    } else {
      if (currentTheme === "light") return;
      (await waitForElementToExist(".one-head-menu button")).click();
      Array.from(document.querySelectorAll("button.one-user-btn"))
        .find((el) => ["Light", "浅色"].includes(el.textContent))
        ?.click();
    }
  }

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      toggle(e.matches);
    });

  toggle();
})();
