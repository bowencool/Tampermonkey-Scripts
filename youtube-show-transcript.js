// ==UserScript==
// @name         Show transcript by default
// @version      1.0.0
// @description  Automatically show transcript by default
// @namespace    https://youtube.com/
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/480993
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @grant        none
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

(async function () {
  "use strict";
  const transcript = await waitForElementToExist(
    '[target-id="engagement-panel-searchable-transcript"]'
  );
  transcript.setAttribute("visibility", "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED");
  console.log("transcript should show up now...");
})();
