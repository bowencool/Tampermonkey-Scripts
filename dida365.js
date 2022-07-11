// ==UserScript==
// @name         滴答清单自动深色模式
// @version      0.3.9
// @description  根据系统设置自动切换深色模式，深色用的是官方的样式
// @namespace    https://dida365.com/
// @match        https://dida365.com/webapp/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dida365.com
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/447649
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    toggle(e.matches);
  });

  function toggle(isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches) {
    /* 有两个事件会触发，而且有循环，必须加判断 */
    const currentTheme = document.body.getAttribute("data-theme")
    console.log({ isDarkMode, currentTheme })
    if (isDarkMode) {
      if (currentTheme === "night-dark-theme") return
      document.body.setAttribute("data-theme", "night-dark-theme")
      document.body.classList.add("dark")
    } else {
      if (currentTheme !== "night-dark-theme") return
      document.body.setAttribute("data-theme", "white-theme")
      document.body.classList.remove("dark")
    }
  }
  /*
  document.addEventListener("DOMContentLoaded", function(event) { console.log("DOM fully loaded and parsed"); });
  window.addEventListener('load', (event) => {
    toggle();
    console.log('page is fully loaded');
  });
  setTimeout
*/
  const observer = new MutationObserver(() => {
    /* 页面半身是异步设置的，太傻逼了 */
    console.log(
      'attr changed',
      {
        className: document.body.className,
        dataTheme: document.body.getAttribute("data-theme")
      }
    )
    toggle();
    // observer.disconnect();
    // console.log('disconnected.');
  })
  observer.observe(document.body, { attributes: true, childList: false, subtree: false })

})();