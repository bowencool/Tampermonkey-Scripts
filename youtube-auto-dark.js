// ==UserScript==
// @name         YouTube auto dark mode
// @version      0.4.4
// @description  Automatically switch the dark mode according to the system settings, which uses the official style
// @namespace    https://youtube.com/
// @match        https://www.youtube.com/*
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
