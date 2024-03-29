// ==UserScript==
// @name         antd 官方文档自动深色模式
// @version      2.0.1
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://ant.design/
// @match        https://ant.design/*
// @match        https://ant-design.antgroup.com/*
// @match        https://ant-design.gitee.io/*
// @icon         https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/447698
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
    const url = new URL(location.href);
    const currentTheme = url.searchParams.get("theme");

    console.log({ isDarkMode, currentTheme });
    if (isDarkMode) {
      if (currentTheme === "dark") return;
      // url.searchParams.set("theme", "dark")
      // location.href = url
    } else {
      if (currentTheme !== "dark") return;
      // url.searchParams.delete("theme")
      // location.href = url
    }
    (await waitForElementToExist('[aria-label="Theme Switcher"]')).click();
    (await waitForElementToExist("button:has([id^=Dark],[id^=Light])")).click();
  }
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      toggle(e.matches);
    });
  // toggle();

  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const url = new URL(location.href);
  const currentTheme = url.searchParams.get("theme");

  console.log({ isDarkMode, currentTheme });
  if (isDarkMode) {
    if (currentTheme === "dark") return;
    url.searchParams.set("theme", "dark")
    location.href = url
  } else {
    if (currentTheme !== "dark") return;
    url.searchParams.delete("theme")
    location.href = url
  }
})();
