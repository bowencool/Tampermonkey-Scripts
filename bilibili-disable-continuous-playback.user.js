// ==UserScript==
// @name         禁止 Bilibili 连播
// @name:en      Disable continuous playback for Bilibili
// @version      1.0.3
// @description:en  Disable continuous playback for Bilibili video.
// @description     禁止 Bilibili 视频的连续播放。
// @namespace    https://bilibili.com/
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/527708
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @require      https://cdn.jsdelivr.net/gh/bowencool/Tampermonkey-Scripts@b65b677146fdf0d0af884371a943d7f4a65f6ec8/shared/waitForElementToExist.js
// ==/UserScript==

(async function () {
  // B站页面是SSR的，这里需要等待客户端接管完成
  await waitForElementToExist("img.bili-avatar-img");
  const el = await waitForElementToExist(".continuous-btn .switch-btn.on");
  el.click();
})();
