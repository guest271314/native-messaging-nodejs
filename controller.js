const input = document.querySelector("textarea");
const button = document.querySelector("button");

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const stdin = input.value;
    const stdout = await chrome.runtime.sendNativeMessage(
      chrome.runtime.getManifest().short_name, 
      new String(JSON.stringify(stdin))
    );
    input.value = `${stdin}\n\n${stdout}\n\n`;
  }
});

button.addEventListener("click", (e) => {
  input.value = "";
  input.focus();
});
