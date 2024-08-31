chrome.runtime.onInstalled.addListener(async (reason) => {
  await chrome.sidePanel.setOptions({ path: "controller.html", enabled: true });
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});
