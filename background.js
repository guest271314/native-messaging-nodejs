var port = chrome.runtime.connectNative('nm_nodejs');
port.onMessage.addListener(e=> console.log(e));
port.onDisconnect.addListener(e=> console.log(e));
port.postMessage(new Array(20000));
