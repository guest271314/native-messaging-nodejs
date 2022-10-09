var port = chrome.runtime.connectNative('nm_deno');
port.onMessage.addListener(e=> console.log(e));
port.onDisconnect.addListener(e=> console.log(e));
port.postMessage(new Array(13106));
