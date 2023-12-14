// ==UserScript==
// @name         自动显示 Bilibili 视频字幕
// @name:en      Show subtitle of Bilibili video by default
// @version      0.1.6
// @description:en  Automatically display Bilibili video subtitles/transcript by default
// @description     默认自动显示Bilibili视频字幕/文稿
// @namespace    https://bilibili.com/
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/482165
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        GM_addStyle
// ==/UserScript==

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

async function request(url, options) {
  return fetch(`https://api.bilibili.com${url}`, {
    ...options,
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.code != 0) {
        throw new Error(data.message);
      }
      return data.data;
    });
}

GM_addStyle(`
.transcript-box {
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 12px 16px;
  max-height: 50vh;
  overflow: scroll;
  margin: 20px 0;
  pointer-events: initial;
}
.transcript-line {
    display: flex;
}
.transcript-line:hover {
  background-color: #0002;
}
.transcript-line.active {
  font-weight: bold;
  background-color: #0002;
}

.transcript-line-time {
    flex: none;
    overflow: hidden;
    width:66px;
    user-select: none;
    corsur: pointer;
    color: var(--bpx-fn-hover-color,#00b5e5);
}

.transcript-line-content {
    // white-space: nowrap;
}

`);

const MUSIC_FILTER_RATE = 0.85;

function fixNumber(n) {
  return n.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

function parseTime(t) {
  t = parseInt(t);
  return `${fixNumber(parseInt(t / 60))}:${fixNumber(t % 60)}`;
}

(async function () {
  "use strict";

  const bvid = window.location.pathname.match(/\/video\/(\w+)/)?.[1];
  if (!bvid) return;

  let curPage = new URLSearchParams(window.location.search).get("p") - 1;
  if (!curPage || curPage == -1) {
    curPage = 0;
  }
  const videoInfo = await request("/x/web-interface/view?bvid=" + bvid);
  const {
    subtitle: { subtitles = [] },
  } = await request(
    `/x/player/v2?aid=${videoInfo.aid}&cid=${videoInfo.pages[curPage].cid}`
  );
  console.log("subtitles", subtitles);
  if (subtitles.length == 0) return console.log("没有字幕");
  const video = await waitForElementToExist("video");
  const transcriptBox = document.createElement("div");
  transcriptBox.className = "transcript-box";
  // const danmukuBox = await waitForElementToExist("#danmukuBox");
  const oldfanfollowEntry = await waitForElementToExist("#oldfanfollowEntry");
  oldfanfollowEntry.parentNode.insertBefore(transcriptBox, oldfanfollowEntry);
  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const timeLinks = document.querySelectorAll(".transcript-line-time");

    for (let i = 0; i < timeLinks.length; i++) {
      const timeLink = timeLinks[i];
      const from = +timeLink.getAttribute("data-from");
      const to = +timeLink.getAttribute("data-to");
      console.log(i, currentTime, from, to, timeLink.parentElement);
      if (currentTime >= to || currentTime <= from) {
        // Remove the 'active' class
        if (timeLink.parentNode.classList.contains("active")) {
          timeLink.parentNode.classList.remove("active");
        }
      }
      if (currentTime > from && currentTime < to) {
        const targetPosition =
          timeLink.parentNode.offsetTop - transcriptBox.clientHeight * 0.5;
        transcriptBox.scrollTo(0, targetPosition);
        // Add the 'active' class to the current line
        timeLink.parentNode.classList.add("active");
        break;
      }
    }
  });
  await showTranscript(subtitles[0]);

  async function showTranscript(subtitleInfo) {
    console.log("showTranscript", subtitleInfo);
    const { body: lines } = await fetch(
      subtitleInfo.subtitle_url.replace(/^\/\//, "https://")
    ).then((res) => res.json());
    console.log("lines", lines);
    for (let line of lines) {
      if (line.music && line.music > MUSIC_FILTER_RATE) {
        continue;
      }
      let timeLink = document.createElement("a");
      timeLink.className = "transcript-line-time";
      timeLink.setAttribute("data-from", line.from);
      timeLink.setAttribute("data-to", line.to);
      // timeLink.setAttribute("data-index", line.index);
      timeLink.textContent = parseTime(line.from);
      timeLink.addEventListener("click", () => {
        video.currentTime = line.from;
      });
      let lineDiv = document.createElement("div");
      lineDiv.className = "transcript-line";
      lineDiv.appendChild(timeLink);
      let span = document.createElement("span");
      span.className = "transcript-line-content";
      span.textContent = line.content;

      lineDiv.appendChild(span);
      transcriptBox.appendChild(lineDiv);
    }
  }
})();
