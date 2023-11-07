// ==UserScript==
// @name         hupu redirection
// @description  redirect to desktop version
// @namespace    hupu
// @version      0.1
// @author       bowencool
// @match        https://m.hupu.com/bbs/*.html
// @icon         http://hupu.com/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";
  const path = window.location.href;
  const match = path.match(/\/bbs\/(\d+).html/);
  if (match) {
    window.location.href = `https://bbs.hupu.com/${match[1]}.html`;
  }
})();
