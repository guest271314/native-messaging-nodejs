chrome.runtime.onInstalled.addListener((reason) => {
  console.log(reason);
});

globalThis.port = null;
globalThis.externallyConnectablePort = null;

chrome.runtime.onConnectExternal.addListener((externalConnectablePort) => {
  globalThis.name = chrome.runtime.getManifest().short_name;
  globalThis.externalPort = externalConnectablePort;
  globalThis.port = chrome.runtime.connectNative(globalThis.name);
  port.onMessage.addListener((message) => {
    globalThis.externalPort.postMessage(message);
  });
  port.onDisconnect.addListener((message) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    };
    externalPort.disconnect();
    chrome.runtime.reload();
  });
  globalThis.externalPort.onMessage.addListener(async (message) => {
    port.postMessage(message);
  });
  globalThis.externalPort.onDisconnect.addListener(async (e) => {
    console.log(e);
    port.disconnect();
    chrome.runtime.reload();
  });
});
