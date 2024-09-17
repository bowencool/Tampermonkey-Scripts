// ==UserScript==
// @name         微信读书自动深色模式
// @version      1.0.1
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://weread.qq.com/
// @match        https://weread.qq.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=weread.qq.com
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/477034
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  async function toggle(
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    const currentThemeIsWhite =
      document.body.classList.contains("wr_whiteTheme");
    console.log({ isDarkMode, currentThemeIsWhite });
    if (isDarkMode) {
      if (currentThemeIsWhite) {
        document.cookie = "wr_theme=dark; path=/; domain=.weread.qq.com;";
        if (location.pathname.startsWith("/web/reader")) {
          // const button = await waitForElementToExist(
          //   ".readerControls_item.dark"
          // );
          // button.click();
          location.reload();
        } else {
          document.body.classList.remove("wr_whiteTheme");
        }
      }
    } else {
      if (!currentThemeIsWhite) {
        document.cookie = "wr_theme=white; path=/; domain=.weread.qq.com;";
        if (location.pathname.startsWith("/web/reader")) {
          location.reload();
        } else {
          document.body.classList.add("wr_whiteTheme");
        }
      }
    }
  }
  toggle();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      toggle(e.matches);
    });
})();
