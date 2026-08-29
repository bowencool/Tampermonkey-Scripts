// ==UserScript==
// @name         Copy link as / 复制链接为指定格式
// @name:en      Copy link as
// @name:zh-CN   复制链接为指定格式
// @name:zh-HK   複製連結為指定格式
// @description  Copy current page link as markdown/html/docx format
// @description:zh-CN  将当前页面链接复制为 Markdown、HTML 或 Word（DOCX）格式
// @description:zh-HK  將目前頁面的連結複製為 Markdown、HTML 或 Word（DOCX）格式
// @namespace    all
// @version      1.1.1
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

  const language = navigator.language.toLowerCase();
  const isTraditionalChinese = language.startsWith("zh-hant") || /^zh-(tw|hk|mo)/.test(language);
  const labels = isTraditionalChinese
    ? {
        markdown: "複製為 Markdown 格式",
        html: "複製為 HTML 格式",
        docx: "複製為 Word（DOCX）格式"
      }
    : language.startsWith("zh")
      ? {
          markdown: "复制为 Markdown 格式",
          html: "复制为 HTML 格式",
          docx: "复制为 Word（DOCX）格式"
        }
      : {
          markdown: "Copy link as Markdown",
          html: "Copy link as HTML",
          docx: "Copy link as Word (DOCX)"
        };

  GM_registerMenuCommand(labels.markdown, function () {
    GM_setClipboard(`[${top.document.title}](${top.location.href})`, "text")
  }, {
    accessKey: "md",
    autoClose: true
  });

  GM_registerMenuCommand(labels.html, function () {
    GM_setClipboard(`<a href="${top.location.href}">${top.document.title}</a>`, "text")
  }, {
    accessKey: "html",
    autoClose: true
  });

  GM_registerMenuCommand(labels.docx, function () {
    GM_setClipboard(`<a href="${top.location.href}">${top.document.title}</a>`, "html")
  }, {
    accessKey: "rich",
    autoClose: true
  });

})();
