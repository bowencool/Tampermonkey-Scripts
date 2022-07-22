// ==UserScript==
// @name         ProComponents 官方文档自动深色模式
// @version      0.1.1
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://procomponents.ant.design/
// @match        https://procomponents.ant.design/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=procomponents.ant.design
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function toggle(isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches) {
    const button = document.querySelector(".procomponents_dark_theme_view button")
    const currentTheme = button.getAttribute("aria-checked")
    console.log({ isDarkMode, currentTheme })
    if (isDarkMode) {
      if (currentTheme === "true") return
      button.click();
    } else {
      if (currentTheme === "false") return
      button.click();
    }
  }
  toggle()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    toggle(e.matches);
  });
})();