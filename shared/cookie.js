function getCookie(key) {
  const cookieArray = document.cookie.split(";");
  for (const cookie of cookieArray) {
    const [cookieKey, cookieValue] = cookie.split("=");
    if (cookieKey.trim() === key) {
      return cookieValue;
    }
  }
}
