// ==UserScript==
// @name         antd redirection
// @description  重定向到国内镜像
// @namespace    antd
// @version      1.0.0
// @author       bowencool
// @match        https://ant.design/*
// @icon         https://ant-design.antgroup.com/favicon.ico
// @grant        none
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/485132
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";
  if (window.location.hostname === "ant.design") {
    window.location.hostname = `ant-design.antgroup.com`;
  }
})();
