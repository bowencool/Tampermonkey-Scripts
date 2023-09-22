// ==UserScript==
// @name         AI Translation on crowdin
// @description  add extra buttons to translate with AI on crowdin, support DeepL X and OpenAI
// @namespace    https://crowdin.com/
// @version      0.3.0
// @author       bowencool
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/447698
// @supportURL   https://github.com/bowencool/Tampermonkey-Scripts/issues
// @match        https://crowdin.com/translate/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crowdin.com
// @run-at       document-end
// @grant        GM_xmlhttpRequest
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

async function main() {
  const sourceContainer = await waitForElementToExist(
    "#source_phrase_container"
  );

  const button = document.createElement("button");
  button.innerText = "DeepL Translate";
  button.classList.add("btn");

  button.addEventListener("click", () => {
    const sourceText = sourceContainer.innerText;
    // console.log(sourceText);
    if (!sourceText) return;
    button.setAttribute("disabled", "true");
    const targetContainer = document.querySelector("#translation");
    // console.log(targetContainer);
    // you need to deploy https://hub.docker.com/r/zu1k/deepl to use this api
    fetch("http://deeplx.localhost:8080/translate", {
      method: "POST",
      body: JSON.stringify({
        text: sourceText,
        source_lang: "auto",
        target_lang: "ZH",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        //console.log(res)
        targetContainer.value = res.data;
        targetContainer.dispatchEvent(new Event("input", { bubbles: true }));
        button.removeAttribute("disabled");
      });
  });

  const button2 = document.createElement("button");
  button2.innerText = "OpenAI Translate";
  button2.classList.add("btn");
  button2.style.marginLeft = "10px";

  button2.addEventListener("click", () => {
    const sourceText = sourceContainer?.innerText;
    // console.log(sourceText);
    if (!sourceText) return;
    button2.setAttribute("disabled", "true");
    const targetContainer = document.querySelector("#translation");

    // you need to login https://key-rental.bowen.cool/login to use this api
    fetch("https://key-rental-api.bowen.cool/openai/v1/chat/completions", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Translate to Chinese:\n" + sourceText },
        ],
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        //console.log(res)
        const text = res.choices[0].message.content;
        targetContainer.value = text;
        targetContainer.dispatchEvent(new Event("input", { bubbles: true }));
        button2.removeAttribute("disabled");
      });
  });

  sourceContainer.before(button);
  sourceContainer.before(button2);
  console.log("inserted");
}

main();
