// ==UserScript==
// @name         自动显示 Bilibili 视频字幕
// @name:en      Show subtitle of Bilibili video by default
// @version      1.0.0
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

GM_addStyle(`
.transcript-box {
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 12px 16px;
  max-height: 50vh;
  overflow: scroll;
  margin-bottom: 20px;
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

  // B站页面是SSR的，如果插入过早，页面 js 检测到实际 Dom 和期望 Dom 不一致，会导致重新渲染
  await sleep(1500);
  const video = await waitForElementToExist("video");
  const transcriptBox = document.createElement("div");
  transcriptBox.className = "transcript-box";
  // const oldfanfollowEntry = await waitForElementToExist("#oldfanfollowEntry");
  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const lastActiveLine = document.querySelector(".transcript-line.active");
    const lineBoxes = lastActiveLine
      ? [lastActiveLine, lastActiveLine.nextSibling]
      : document.querySelectorAll(".transcript-line");

    for (let i = 0; i < lineBoxes.length; i++) {
      const currentLine = lineBoxes[i];
      const from = +currentLine.getAttribute("data-from");
      const to = +currentLine.getAttribute("data-to");
      // console.log({ i, from, to, currentTime }, currentLine);
      if (currentTime >= to || currentTime <= from) {
        // Remove the 'active' class
        if (currentLine.classList.contains("active")) {
          currentLine.classList.remove("active");
        }
      }
      if (currentTime > from && currentTime < to) {
        const targetPosition =
          currentLine.offsetTop - transcriptBox.clientHeight * 0.5;
        transcriptBox.scrollTo(0, targetPosition);
        // Add the 'active' class to the current line
        currentLine.classList.add("active");
        break;
      }
    }
  });
  // B站 页面是SSR的，如果插入过早
  await showTranscript(subtitles[0]);
  const danmukuBox = await waitForElementToExist("#danmukuBox");
  danmukuBox.parentNode.insertBefore(transcriptBox, danmukuBox);

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
      // timeLink.setAttribute("data-index", line.index);
      timeLink.textContent = parseTime(line.from);
      timeLink.addEventListener("click", () => {
        video.currentTime = line.from;
      });
      let lineDiv = document.createElement("div");
      lineDiv.className = "transcript-line";
      lineDiv.setAttribute("data-from", line.from);
      lineDiv.setAttribute("data-to", line.to);
      lineDiv.appendChild(timeLink);
      let span = document.createElement("span");
      span.className = "transcript-line-content";
      span.textContent = line.content;

      lineDiv.appendChild(span);
      transcriptBox.appendChild(lineDiv);
    }
  }
})();
