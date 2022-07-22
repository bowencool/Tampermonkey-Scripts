// ==UserScript==
// @name         antd 官方文档自动深色模式
// @version      0.1.2
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://ant.design/
// @match        https://ant.design/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ant.design
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(function () {
  'use strict';


  function toggle(isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches) {
    const url = new URL(location.href)
    const currentTheme = url.searchParams.get('theme')

    console.log({ isDarkMode, currentTheme })
    if (isDarkMode) {
      if (currentTheme === "dark") return
      url.searchParams.set("theme", "dark")
      location.href = url
    } else {
      if (currentTheme !== "dark") return
      url.searchParams.delete("theme")
      location.href = url
    }
  }
  toggle()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    toggle(e.matches);
  });
})();