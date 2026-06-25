// ==UserScript==
// @name         V2EX 自动签到
// @version      1.0.0
// @description  每天按 UTC 日期自动领取 V2EX 每日登录奖励。
// @namespace    https://www.v2ex.com/
// @match        https://v2ex.com/*
// @match        https://*.v2ex.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=v2ex.com
// @author       bowencool
// @license      MIT
// @homepageURL  https://github.com/bowencool/Tampermonkey-Scripts
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const LOG_PREFIX = "[V2EX 自动签到]";
  const ATTEMPT_DATE_KEY = "v2ex_auto_signin_attempt_utc_date";
  const DONE_DATE_KEY = "v2ex_auto_signin_done_utc_date";
  const LAST_STATUS_KEY = "v2ex_auto_signin_last_status";
  const DAILY_PATH = "/mission/daily";

  function getTodayUTC() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function writeStatus(status) {
    localStorage.setItem(
      LAST_STATUS_KEY,
      JSON.stringify({ status, checkedAt: new Date().toISOString() })
    );
  }

  function markAttempted(status) {
    const today = getTodayUTC();
    localStorage.setItem(ATTEMPT_DATE_KEY, today);
    writeStatus(status);
  }

  function markDone(status) {
    const today = getTodayUTC();
    localStorage.setItem(ATTEMPT_DATE_KEY, today);
    localStorage.setItem(DONE_DATE_KEY, today);
    localStorage.setItem(
      LAST_STATUS_KEY,
      JSON.stringify({ status, checkedAt: new Date().toISOString() })
    );
  }

  function hasCheckedToday() {
    return localStorage.getItem(ATTEMPT_DATE_KEY) === getTodayUTC();
  }

  function isHomePage() {
    return location.pathname === "/" || location.pathname === "";
  }

  function isSignedOut(doc) {
    const signinLink = doc.querySelector('a[href="/signin"], a[href^="/signin?"]');
    const memberLink = doc.querySelector(
      '#Top a[href^="/member/"], #menu-body a[href^="/member/"]'
    );
    return Boolean(signinLink && !memberLink);
  }

  function parseHTML(html) {
    return new DOMParser().parseFromString(html, "text/html");
  }

  function getHTML(input) {
    if (!input) return "";
    if (typeof input === "string") return input;
    if (input.documentElement) return input.documentElement.outerHTML;
    if (input.outerHTML) return input.outerHTML;
    return "";
  }

  function extractOnce(input) {
    const html = getHTML(input);
    const patterns = [
      /\/mission\/daily\/redeem\?once=(\d+)/,
      /\bonce=(\d+)\b/,
      /var\s+once\s*=\s*["'](\d+)["']/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) return match[1];
    }

    return "";
  }

  function getRedeemURL(input) {
    if (input && input.querySelector) {
      const link = input.querySelector('a[href*="/mission/daily/redeem?once="]');
      if (link) return new URL(link.getAttribute("href"), location.origin).href;
    }

    const once = extractOnce(input);
    return once ? `${location.origin}${DAILY_PATH}/redeem?once=${once}` : "";
  }

  async function fetchDocument(url) {
    const response = await fetch(url, {
      credentials: "same-origin",
      redirect: "follow",
    });
    const html = await response.text();
    return {
      doc: parseHTML(html),
      html,
      ok: response.ok,
      status: response.status,
      url: response.url,
    };
  }

  function findDailyEntry(doc) {
    return doc.querySelector('a[href="/mission/daily"], a[href^="/mission/daily"]');
  }

  function looksAlreadySigned(doc, html) {
    return (
      doc.querySelector("li.fa.fa-ok-sign") ||
      /已连续登录\s+\d+\s+天/.test(html) ||
      /每日登录奖励已领取|今天已经领取|已领取/.test(html)
    );
  }

  function looksRedeemable(doc, html) {
    return (
      doc.querySelector('a[href*="/mission/daily/redeem?once="]') ||
      doc.querySelector('input[value^="领取"]') ||
      /领取(?:每日登录)?奖励/.test(html)
    );
  }

  async function redeem(input, dailyEntry) {
    const redeemURL = getRedeemURL(input);
    if (!redeemURL) {
      console.warn(`${LOG_PREFIX} 未找到 once，跳过。`);
      return;
    }

    const result = await fetchDocument(redeemURL);
    if (!result.ok) {
      console.warn(`${LOG_PREFIX} 签到请求失败：HTTP ${result.status}`);
      return;
    }

    if (looksAlreadySigned(result.doc, result.html)) {
      const streak = result.html.match(/已连续登录\s+\d+\s+天/);
      markDone("redeemed");
      console.info(`${LOG_PREFIX} 自动签到完成。${streak ? streak[0] : ""}`);
      if (dailyEntry) {
        dailyEntry.textContent = `自动签到完成${streak ? `，${streak[0]}` : ""}`;
        dailyEntry.removeAttribute("href");
      }
      return;
    }

    console.warn(`${LOG_PREFIX} 已请求签到，但没有识别到成功状态。`);
  }

  async function checkDailyPage() {
    const daily = await fetchDocument(`${location.origin}${DAILY_PATH}`);

    if (daily.url.includes("/signin") || isSignedOut(daily.doc)) {
      console.info(`${LOG_PREFIX} 当前未登录，跳过。`);
      return;
    }

    if (looksRedeemable(daily.doc, daily.html)) {
      await redeem(daily.doc);
      return;
    }

    if (looksAlreadySigned(daily.doc, daily.html)) {
      markDone("already-signed");
      console.info(`${LOG_PREFIX} 今天已经签到。`);
      return;
    }

    console.warn(`${LOG_PREFIX} 未能识别每日奖励状态，未写入今日检查记录。`);
  }

  async function main() {
    if (hasCheckedToday()) {
      console.info(`${LOG_PREFIX} 今天已经检查过，跳过。`);
      return;
    }

    if (isSignedOut(document)) {
      console.info(`${LOG_PREFIX} 当前未登录，跳过。`);
      return;
    }

    markAttempted("attempted");

    if (isHomePage()) {
      const dailyEntry = findDailyEntry(document);
      if (dailyEntry) {
        await redeem(document, dailyEntry);
        return;
      }

      markDone("already-signed-home");
      console.info(`${LOG_PREFIX} 首页未发现签到入口，按已签到处理。`);
      return;
    }

    await checkDailyPage();
  }

  main().catch((error) => {
    console.warn(`${LOG_PREFIX} 执行失败。`, error);
  });
})();
