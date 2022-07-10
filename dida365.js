// ==UserScript==
// @name         Auto dark
// @namespace    https://dida365.com/
// @version      0.2
// @description  switch dark theme follow the system
// @author       You
// @match        https://dida365.com/webapp/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dida365.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    toggle(e.matches);
  });

  function toggle(isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches) {
    /* 有两个事件会触发，而且有循环，必须加判断 */
    const dataTheme = document.body.getAttribute("data-theme")
    console.log({ isDarkMode, dataTheme })
    if (isDarkMode) {
      if (dataTheme === "night-dark-theme") return
      document.body.setAttribute("data-theme", "night-dark-theme")
      document.body.classList.add("dark")
    } else {
      if (dataTheme !== "night-dark-theme") return
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