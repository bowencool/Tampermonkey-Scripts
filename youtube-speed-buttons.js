// ==UserScript==
// @name         YouTube Playback Speed Buttons
// @description  Adds playback speed buttons to youtube player control bar.
// @version      0.1.2
// @license      MIT
// @author       bowencool
// @match        https://www.youtube.com/watch*
// @namespace    https://www.youtube.com/
// @author       bowencool
// @license      MIT
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-end
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
function insertStyle() {
  const head = document.head;
  const style = document.createElement("style");
  style.innerHTML = `
.speed-button {

}
.speed-button.active, .speed-button:hover {
  color: white;
}
  `;
  head.appendChild(style);
  console.log({ style });
}
async function main() {
  const menuR = await waitForElementToExist(".ytp-right-controls");
  console.log({ menuR });
  insertStyle();
  if (typeof menuR !== "undefined" && menuR !== null) {
    [2, 1.5, 1.25, 1, 0.75, 0.5].forEach((speed) => {
      const button = document.createElement("button");
      button.innerText = `x${speed}`;
      button.classList.add("ytp-button speed-button");
      button.onclick = () => setPlayerSpeed(speed);
      menuR.prepend(button);
      console.log(button);
    });
  }
}
main();
