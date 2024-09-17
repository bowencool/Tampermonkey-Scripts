function waitForElementToExist(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      console.log("resolved", selector, document.querySelector(selector));
      return resolve(document.querySelector(selector));
    }
    console.log("wait for", selector);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        console.log("resolved", selector, el);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}
