// ==UserScript==
// @name         antd 官方文档自动深色模式
// @version      1.0.1
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://ant.design/
// @match        https://ant.design/*
// @match        https://ant-design.antgroup.com/*
// @match        https://ant-design.gitee.io/*
// @icon         https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/447698
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// @run-at       document-start
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