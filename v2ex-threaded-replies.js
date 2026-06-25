// ==UserScript==
// @name         V2EX 楼中楼解析
// @version      1.0.0
// @description  在 V2EX 主题页提供原始回复和楼中楼视图切换。
// @namespace    https://www.v2ex.com/
// @match        https://v2ex.com/t/*
// @match        https://*.v2ex.com/t/*
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

  const LOG_PREFIX = "[V2EX 楼中楼]";
  const nestedReply = {
    findChildren(item, endList, all) {
      const appendChild = (child, nextEndList, parent) => {
        child.level = parent.level + 1;
        const originalIndex = all.findIndex((reply) => reply.floor === child.floor);
        if (originalIndex > -1) all[originalIndex].isUse = true;
        parent.children.push(this.findChildren(child, nextEndList, all));
      };

      item.children = [];
      const floorReplyList = [];

      for (let i = 0; i < endList.length; i += 1) {
        const currentItem = endList[i];
        if (currentItem.isUse) continue;
        if (currentItem.replyFloor === item.floor) {
          if (
            currentItem.replyUsers.length === 1 &&
            currentItem.replyUsers[0] === item.username
          ) {
            currentItem.isUse = true;
            floorReplyList.push({
              currentItem,
              endList: endList.slice(i + 1),
            });
          } else {
            currentItem.isWrong = true;
          }
        }
      }

      floorReplyList.reverse().forEach(({ currentItem, endList: nextEndList }) => {
        appendChild(currentItem, nextEndList, item);
      });

      const nextMeIndex = endList.findIndex((reply) => {
        return reply.username === item.username && reply.replyUsers?.[0] !== item.username;
      });
      const findList = nextMeIndex > -1 ? endList.slice(0, nextMeIndex) : endList;

      for (let i = 0; i < findList.length; i += 1) {
        const currentItem = findList[i];
        if (currentItem.isUse) continue;

        if (currentItem.replyUsers.length === 1) {
          if (currentItem.replyFloor !== -1) {
            const repliedFloor = all.find((reply) => reply.floor === currentItem.replyFloor);
            if (repliedFloor?.username === currentItem.replyUsers[0]) continue;
          }

          const nextEndList = endList.slice(i + 1);
          if (currentItem.username === item.username) {
            if (currentItem.replyUsers[0] === item.username) {
              appendChild(currentItem, nextEndList, item);
            }
            break;
          }

          if (currentItem.replyUsers[0] === item.username) {
            appendChild(currentItem, nextEndList, item);
          }
        } else if (currentItem.username === item.username) {
          break;
        }
      }

      item.children = item.children.sort((a, b) => a.floor - b.floor);
      item.replyCount = item.children.reduce((total, child) => {
        return total + (child.children.length ? child.replyCount + 1 : 1);
      }, 0);

      return item;
    },

    createNestedList(allList = []) {
      if (!allList.length) return [];

      const list = allList;
      const nestedList = [];
      list.forEach((item, index) => {
        const startList = list.slice(0, index);
        const startReplyUsers = Array.from(
          new Set(startList.map((reply) => reply.username))
        );
        const endList = list.slice(index + 1);

        if (index === 0) {
          nestedList.push(this.findChildren(item, endList, list));
          return;
        }

        if (item.isUse) return;

        let isOneLevelReply = false;
        if (item.replyUsers.length) {
          if (item.replyUsers.length > 1) {
            isOneLevelReply = true;
          } else {
            isOneLevelReply = !startReplyUsers.find(
              (username) => username === item.replyUsers[0]
            );
          }
        } else {
          isOneLevelReply = true;
        }

        if (isOneLevelReply) {
          item.level = 0;
          nestedList.push(this.findChildren(item, endList, list));
        }
      });

      return nestedList;
    },
  };

  function parseReplyContent(html) {
    if (!html) return { users: [], floor: -1 };

    const users = [];
    const userReg = /@<a href="(?:https?:\/\/[^/]+)?\/member\/([^'" ]+)/g;
    const userMatches = Array.from(html.matchAll(userReg));

    userMatches.forEach((match) => {
      users.push(match[1]);
    });

    let floor = -1;
    if (users.length === 1) {
      const floorReg =
        /@<a href="(?:https?:\/\/[^/]+)?\/member\/[\s\S]+?<\/a>(?:<ul [\s\S]+<\/ul>)?[\s]+#(\d+)/g;
      const floorMatches = Array.from(html.matchAll(floorReg));
      if (floorMatches.length) floor = Number(floorMatches[0][1]);
    }

    return { users, floor };
  }

  function normalizeReplyNodes(nodes) {
    return Array.from(nodes).filter((node) => {
      return /^r_\d+$/.test(node.id || "") && node.querySelector(".reply_content");
    });
  }

  function isMobileDocument(doc) {
    return !doc.querySelector("#Rightbar");
  }

  function getReplyContext(doc = document) {
    if (isMobileDocument(doc)) {
      const nodes = normalizeReplyNodes(doc.querySelectorAll('[id^="r_"]'));
      return {
        nodes,
        container: nodes[0]?.parentElement || null,
      };
    }

    const boxes = Array.from(doc.querySelectorAll("#Main .box"));
    for (let i = 1; i < boxes.length; i += 1) {
      const box = boxes[i];
      const nodes = normalizeReplyNodes(
        box.querySelectorAll('.cell[id^="r_"], [id^="r_"]')
      );
      if (nodes.length) {
        return { nodes, container: box };
      }
    }

    const nodes = normalizeReplyNodes(
      doc.querySelectorAll('#Main [id^="r_"], [id^="r_"]')
    );
    return {
      nodes,
      container: nodes[0]?.parentElement || null,
    };
  }

  function parseFloor(text, fallback) {
    const floor = Number(String(text || "").replace(/[^\d]/g, ""));
    return Number.isFinite(floor) && floor > 0 ? floor : fallback;
  }

  function normalizeAssetURL(url) {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith("//")) return `${location.protocol}${url}`;
    return new URL(url, location.origin).href;
  }

  function parseOPBadge(node, contentElement) {
    const opElement = Array.from(node.querySelectorAll(".op, span")).find((element) => {
      return (
        element.textContent?.trim() === "OP" &&
        !contentElement.contains(element)
      );
    });

    return opElement?.textContent?.trim() || "";
  }

  function parseCountValue(value) {
    const count = Number(String(value || "").replace(/[^\d]/g, ""));
    return Number.isFinite(count) && count > 0 ? count : 0;
  }

  function parseThankInfo(node, contentElement) {
    const heartSpan = Array.from(node.querySelectorAll("span.small.fade")).find((element) => {
      if (element === contentElement || contentElement.contains(element)) return false;
      return element.querySelector('img[src*="heart"], img[alt*="❤"], img[alt*="♥"]');
    });

    if (!heartSpan) {
      return { thankCount: 0, isThanked: false, thankIconURL: "" };
    }

    const heartImage = heartSpan.querySelector('img[src*="heart"], img[alt*="❤"], img[alt*="♥"]');
    const thankCount = parseCountValue(heartSpan.textContent) || 1;

    return {
      thankCount,
      isThanked: Boolean(heartImage),
      thankIconURL: normalizeAssetURL(heartImage?.getAttribute("src") || ""),
    };
  }

  function parseReplies(nodes) {
    return nodes
      .map((node, index) => {
        const contentElement = node.querySelector(".reply_content");
        const userLink =
          node.querySelector('strong a[href*="/member/"]') ||
          node.querySelector('a[href^="/member/"], a[href*="/member/"]');
        const floorElement = node.querySelector(".no");
        const dateElement = node.querySelector(".ago") || node.querySelector("span[title]");
        const avatarImage =
          node.querySelector("img.avatar") ||
          node.querySelector('img[src*="/avatar/"]');
        const html = contentElement.innerHTML;
        const { users, floor } = parseReplyContent(html);
        const username = userLink?.textContent?.trim() || "unknown";
        const avatarURL = normalizeAssetURL(avatarImage?.getAttribute("src") || "");
        const { thankCount, isThanked, thankIconURL } = parseThankInfo(node, contentElement);

        return {
          id: (node.id || "").replace(/^r_/, ""),
          node,
          contentElement,
          dateText: dateElement?.textContent?.trim() || "",
          floor: parseFloor(floorElement?.textContent, index + 1),
          replyUsers: users,
          replyFloor: floor,
          username,
          avatarURL,
          avatarAlt: avatarImage?.getAttribute("alt")?.trim() || username,
          opBadgeText: parseOPBadge(node, contentElement),
          thankCount,
          isThanked,
          thankIconURL,
          level: 0,
          replyCount: 0,
          children: [],
          isUse: false,
          isWrong: false,
        };
      })
      .filter((reply) => reply.username);
  }

  function cloneReplies(replies) {
    return replies.map((reply) => ({
      ...reply,
      children: [],
      isUse: false,
      isWrong: false,
      level: 0,
      replyCount: 0,
    }));
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function createUserLink(username) {
    const link = createElement("a", "v2tr-user", username);
    link.href = `/member/${encodeURIComponent(username)}`;
    return link;
  }

  function createAvatarLink(reply) {
    if (!reply.avatarURL) {
      const placeholder = createElement("span", "v2tr-avatar is-empty");
      placeholder.setAttribute("aria-hidden", "true");
      return placeholder;
    }

    const link = createElement("a", "v2tr-avatar");
    link.href = `/member/${encodeURIComponent(reply.username)}`;

    const image = document.createElement("img");
    image.src = reply.avatarURL;
    image.alt = reply.avatarAlt || reply.username;
    image.loading = "lazy";
    image.decoding = "async";
    link.append(image);

    return link;
  }

  function renderReply(reply) {
    const item = createElement("article", "v2tr-reply");
    item.dataset.floor = String(reply.floor);
    item.style.setProperty("--v2tr-depth", String(Math.min(reply.level || 0, 8)));

    const body = createElement("div", "v2tr-body");
    const header = createElement("div", "v2tr-header");
    const meta = createElement("div", "v2tr-meta");
    const floor = createElement("a", "v2tr-floor", `#${reply.floor}`);
    floor.href = `#r_${reply.id}`;
    meta.append(createUserLink(reply.username));

    if (reply.opBadgeText) {
      meta.append(createElement("span", "v2tr-op", reply.opBadgeText));
    }

    if (reply.dateText) {
      meta.append(createElement("span", "v2tr-date", reply.dateText));
    }

    if (reply.thankCount) {
      const thanks = createElement("span", `v2tr-thanks${reply.isThanked ? " is-thanked" : ""}`);
      if (reply.thankIconURL) {
        const icon = document.createElement("img");
        icon.src = reply.thankIconURL;
        icon.alt = "♥";
        icon.width = 14;
        icon.height = 14;
        icon.loading = "lazy";
        icon.decoding = "async";
        thanks.append(icon, document.createTextNode(String(reply.thankCount)));
      } else {
        thanks.textContent = `♥ ${reply.thankCount}`;
      }
      thanks.title = `${reply.thankCount} 个感谢`;
      meta.append(thanks);
    }

    if (reply.replyCount) {
      meta.append(createElement("span", "v2tr-count", `${reply.replyCount} 条回复`));
    }

    const content = document.importNode(reply.contentElement, true);
    content.classList.add("v2tr-content");
    header.append(meta, floor);
    body.append(header, content);

    if (reply.children.length) {
      const children = createElement("div", "v2tr-children");
      reply.children.forEach((child) => {
        children.append(renderReply(child));
      });
      body.append(children);
    }

    item.append(createAvatarLink(reply), body);
    return item;
  }

  function renderNestedList(root, nestedList) {
    root.textContent = "";
    const fragment = document.createDocumentFragment();
    nestedList.forEach((reply) => {
      fragment.append(renderReply(reply));
    });
    root.append(fragment);
  }

  function addStyle() {
    const style = document.createElement("style");
    style.textContent = `
.v2tr-hidden {
  display: none !important;
}

.v2tr-toolbar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background: var(--box-background-color, #fff);
}

.v2tr-switch {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  background: rgba(128, 128, 128, 0.227);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.v2tr-button {
  border: 0;
  min-width: 44px;
  padding: 5px 14px;
  border-radius: 3px;
  color: #000;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
  text-align: center;
  cursor: pointer;
}

.v2tr-button.is-active {
  color: #000;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.v2tr-info {
  color: var(--color-gray, #999);
  font-size: 12px;
  white-space: nowrap;
}

.v2tr-list {
  box-sizing: border-box;
  padding: 0 10px 10px;
  background: var(--box-background-color, #fff);
  text-align: left;
}

.v2tr-list[hidden] {
  display: none !important;
}

.v2tr-reply {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  column-gap: 10px;
  align-items: start;
  padding: 10px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
  text-align: left;
}

.v2tr-reply:first-child {
  border-top: 0;
}

.v2tr-avatar {
  display: block;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 4px;
  background: rgba(128, 128, 128, 0.08);
}

.v2tr-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.v2tr-avatar.is-empty {
  background: transparent;
}

.v2tr-body {
  min-width: 0;
}

.v2tr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  margin-bottom: 5px;
}

.v2tr-meta {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  color: var(--color-gray, #999);
  font-size: 12px;
  line-height: 1.35;
}

.v2tr-user {
  color: inherit;
  font-weight: 700;
}

.v2tr-op {
  padding: 0 4px;
  border-radius: 3px;
  color: #999;
  background: rgba(128, 128, 128, 0.1);
  font-size: 11px;
  font-weight: 700;
}

.v2tr-count {
  color: var(--color-gray, #999);
}

.v2tr-thanks {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #d6655a;
  font-size: 12px;
  line-height: 1.35;
}

.v2tr-thanks img {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: text-bottom;
}

.v2tr-thanks.is-thanked {
  color: #cc3333;
}

.v2tr-floor {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 999px;
  color: #aaa;
  background: rgba(128, 128, 128, 0.08);
  font-size: 11px;
  line-height: 16px;
  text-decoration: none;
}

.v2tr-content {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
}

.v2tr-children {
  margin-top: 8px;
  margin-left: 0;
  padding-left: 8px;
  border-left: 1px solid #e5e5e5;
  text-align: left;
}

.v2tr-children > .v2tr-reply {
  grid-template-columns: 26px minmax(0, 1fr);
  column-gap: 6px;
  padding: 8px 0 0;
  border-top: 0;
}

.v2tr-children .v2tr-avatar {
  width: 26px;
  height: 26px;
}

@media (max-width: 700px) {
  .v2tr-toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  .v2tr-switch {
    display: flex;
    width: 100%;
  }

  .v2tr-button {
    flex: 1 1 0;
    min-width: 0;
  }

  .v2tr-info {
    white-space: normal;
  }

  .v2tr-list {
    padding: 0 8px 8px;
  }

  .v2tr-reply {
    grid-template-columns: 32px minmax(0, 1fr);
    column-gap: 8px;
    padding: 8px 0;
  }

  .v2tr-avatar {
    width: 32px;
    height: 32px;
  }

  .v2tr-header {
    gap: 6px;
  }

  .v2tr-children {
    margin-top: 6px;
    padding-left: 6px;
  }

  .v2tr-children > .v2tr-reply {
    grid-template-columns: 24px minmax(0, 1fr);
    column-gap: 5px;
  }

  .v2tr-children .v2tr-avatar {
    width: 24px;
    height: 24px;
  }
}
`;
    document.head.append(style);
  }

  function getCurrentPageNumber() {
    return Number(new URL(location.href).searchParams.get("p") || "1") || 1;
  }

  function getOtherPageURLs() {
    const currentPage = getCurrentPageNumber();
    const urls = new Map();

    document.querySelectorAll('a[href*="/t/"][href*="?p="]').forEach((link) => {
      const url = new URL(link.getAttribute("href"), location.href);
      if (url.pathname !== location.pathname) return;

      const pageNumber = Number(url.searchParams.get("p") || "1") || 1;
      if (pageNumber === currentPage) return;

      urls.set(pageNumber, url.href);
    });

    return Array.from(urls.entries())
      .sort((a, b) => a[0] - b[0])
      .map((entry) => entry[1]);
  }

  async function fetchRepliesFromPage(url) {
    const response = await fetch(url, {
      credentials: "same-origin",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const context = getReplyContext(doc);
    return parseReplies(context.nodes);
  }

  async function collectReplies(currentNodes) {
    const currentReplies = parseReplies(currentNodes);
    const otherPageURLs = getOtherPageURLs();

    if (!otherPageURLs.length) {
      return {
        replies: currentReplies,
        fetchedPageCount: 0,
      };
    }

    const results = await Promise.allSettled(
      otherPageURLs.map((url) => fetchRepliesFromPage(url))
    );
    const allReplies = currentReplies.slice();

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allReplies.push(...result.value);
      } else {
        console.warn(`${LOG_PREFIX} 分页解析失败：${otherPageURLs[index]}`, result.reason);
      }
    });

    const seenFloors = new Set();
    const replies = allReplies
      .sort((a, b) => a.floor - b.floor)
      .filter((reply) => {
        if (seenFloors.has(reply.floor)) return false;
        seenFloors.add(reply.floor);
        return true;
      });

    return {
      replies,
      fetchedPageCount: results.filter((result) => result.status === "fulfilled").length,
    };
  }

  function installToggle(context, nestedList, totalReplyCount, fetchedPageCount) {
    const { nodes, container } = context;
    const firstReply = nodes[0];
    const toolbar = createElement("div", "v2tr-toolbar");
    const switcher = createElement("div", "v2tr-switch");
    const originalButton = createElement(
      "button",
      "v2tr-button",
      "原始"
    );
    const nestedButton = createElement(
      "button",
      "v2tr-button is-active",
      "楼中楼"
    );
    const info = createElement(
      "span",
      "v2tr-info",
      fetchedPageCount
        ? `共 ${totalReplyCount} 条回复，已合并 ${fetchedPageCount} 个分页`
        : `当前页 ${nodes.length} 条回复`
    );
    const nestedRoot = createElement("div", "v2tr-list");
    nestedRoot.hidden = true;

    originalButton.type = "button";
    nestedButton.type = "button";
    originalButton.setAttribute("aria-pressed", "false");
    nestedButton.setAttribute("aria-pressed", "true");
    switcher.append(originalButton, nestedButton);
    toolbar.append(switcher, info);

    function setMode(mode) {
      const showNested = mode === "nested";
      nodes.forEach((node) => {
        node.classList.toggle("v2tr-hidden", showNested);
      });
      nestedRoot.hidden = !showNested;
      originalButton.classList.toggle("is-active", !showNested);
      nestedButton.classList.toggle("is-active", showNested);
      originalButton.setAttribute("aria-pressed", String(!showNested));
      nestedButton.setAttribute("aria-pressed", String(showNested));
    }

    originalButton.addEventListener("click", () => setMode("original"));
    nestedButton.addEventListener("click", () => setMode("nested"));

    renderNestedList(nestedRoot, nestedList);
    container.insertBefore(nestedRoot, firstReply);
    container.insertBefore(toolbar, nestedRoot);
    setMode("nested");
  }

  async function main() {
    const context = getReplyContext();
    if (!context.nodes.length || !context.container) {
      console.info(`${LOG_PREFIX} 当前页没有可解析的回复。`);
      return;
    }

    if (document.querySelector(".v2tr-toolbar")) return;

    addStyle();
    const { replies, fetchedPageCount } = await collectReplies(context.nodes);
    const nestedList = nestedReply.createNestedList(cloneReplies(replies));
    installToggle(context, nestedList, replies.length, fetchedPageCount);
    console.info(`${LOG_PREFIX} 已解析 ${replies.length} 条回复。`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main, { once: true });
  } else {
    main();
  }
})();
