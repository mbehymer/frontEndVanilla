window.addEventListener("load", function() {
    [...document.querySelectorAll(".dynamic")].forEach(el => {
      const match = el.textContent.match(/{{(.*?)}}/)
      if (match.length === 2) el.innerText = API.settings.get(match[1])
    })
});
