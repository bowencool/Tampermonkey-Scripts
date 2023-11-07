// ==UserScript==
// @name         hupu redirection
// @description  redirect to desktop version
// @namespace    hupu
// @version      0.2
// @author       bowencool
// @match        https://m.hupu.com/bbs/*.html
// @icon         http://hupu.com/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    const path = window.location.href;
    const match = path.match(/\/bbs\/(\d+).html/);
    if (match) {
      window.location.href = `https://bbs.hupu.com/${match[1]}.html`;
    }
  }
})();
