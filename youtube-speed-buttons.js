// ==UserScript==
// @name         YouTube Playback Speed Buttons
// @description  Adds playback speed buttons to youtube player control bar.
// @version      0.3.4
// @license      MIT
// @author       bowencool
// @match        https://www.youtube.com/*
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

function insertStyle() {
  const path = window.location.pathname;
  const isEmbed = path.startsWith("/embed");
  const head = document.head;
  const style = document.createElement("style");
  style.innerHTML = `
.speed-button {
  position: relative;
  top: ${isEmbed ? "-16px" : "-20px"};
  width: min-content!important;
  margin: 0 2px;
}
.speed-button.active::after {
  content: "";
  display: block;
  position: absolute;
  height: 3px;
  border-radius: 3px;
  left: 0;
  right: 0;
  bottom: 9px;
  background-color: #f00;
  color: white;
}
.speed-button:hover {
  color: white;
}
  `;
  head.appendChild(style);
  console.log({ style });
}
async function main() {
  const menuR = await waitForElementToExist(".ytp-right-controls");
  const video = await waitForElementToExist(".html5-main-video");
  console.log({ menuR, video });
  insertStyle();
  const storedPlaybackRate = parseFloat(
    sessionStorage.getItem("playback-rate"),
    10
  );

  let currentPlaybackRate = video.playbackRate;
  if (storedPlaybackRate > 0) {
    currentPlaybackRate = video.playbackRate = storedPlaybackRate;
  }
  [3, 2, 1.5, 1.25, 1, 0.75, 0.5, 0.1].forEach((speed) => {
    try {
      const button = document.createElement("button");
      button.innerText = `ⅹ${speed}`;
      button.classList.add("ytp-button", "speed-button");
      if (currentPlaybackRate === speed) {
        button.classList.add("active");
      }
      button.onclick = () => {
        video.playbackRate = speed;
        document
          .querySelectorAll(".speed-button")
          .forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        sessionStorage.setItem("playback-rate", speed);
      };
      menuR.prepend(button);
    } catch (error) {
      console.error(error);
    }
  });
}
main();
