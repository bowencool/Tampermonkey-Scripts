// ==UserScript==
// @name         Copy link as
// @description  Copy current page link as markdown/html/docx format
// @namespace    all
// @version      1.0.2
// @author       bowencool
// @match        *://*/*
// @icon         https://i.imgur.com/TuVUZlQ.png
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @license      MIT
// @homepageURL  https://greasyfork.org/en/scripts/571737
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  GM_registerMenuCommand("Copy link as markdown format", function (event) {
    GM_setClipboard(`[${top.document.title}](${top.location.href})`, "text")
  }, {
    accessKey: "md",
    autoClose: true
  });

  GM_registerMenuCommand("Copy link as html format", function (event) {
    GM_setClipboard(`<a href="${top.location.href}">${top.document.title}</a>`, "text")
  }, {
    accessKey: "html",
    autoClose: true
  });

  GM_registerMenuCommand("Copy link as word(docx) format", function (event) {
    GM_setClipboard(`<a href="${top.location.href}">${top.document.title}</a>`, "html")
  }, {
    accessKey: "rich",
    autoClose: true
  });

})();
