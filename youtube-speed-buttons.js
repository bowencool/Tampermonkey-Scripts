// ==UserScript==
// @name         YouTube Playback Speed Buttons
// @description  Adds playback speed buttons to youtube player control bar.
// @version      0.1.0
// @license      MIT
// @author       bowencool
// @match        https://www.youtube.com/watch*
// @namespace    https://www.youtube.com/
// @version      0.1.0
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==
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

function setPlayerSpeed(newSpeed) {
  document.getElementsByClassName("html5-main-video")[0].playbackRate =
    newSpeed;
}

async function main() {
  var menuR = await waitForElementToExist(".ytp-right-controls");

  if (typeof menuR !== "undefined" && menuR !== null) {
    [2, 1.5, 1.25, 1, 0.75, 0.5].forEach((speed) => {
      const button = document.createElement("button");
      button.innerText = `x${speed}`;
      button.classList.add("ytp-button", "ytp-menuitem");
      menuR.prepend(button);
    });
  }
}
main();
