// ==UserScript==
// @name         YouTube自动深色模式
// @version      0.3.9
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://youtube.com/
// @match        https://www.youtube.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      toggle(e.matches);
    });

  function toggle(
    isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    /* 有两个事件会触发，而且有循环，必须加判断 */
    const currentTheme = document.querySelector("html").getAttribute("dark");
    console.log({ isDarkMode, currentTheme });
    if (isDarkMode) {
      if (currentTheme !== null) return;
      document.querySelector("html").setAttribute("dark", "");
    } else {
      if (currentTheme === null) return;
      document.querySelector("html").removeAttribute("dark");
    }
  }
})();
