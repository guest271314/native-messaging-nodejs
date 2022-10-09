Node.js Native Messaging host

Installation and usage on Chrome and Chromium

1. Navigate to `chrome://extensions`
2. Toggle `Developer mode`
3. Click `Load unpacked`
4. Select native-messaging-nodejs folder
5. Note the generated extension ID
6. Open `nm_node.json` in a text editor, set `"path"` to absolute path of `nm_node.js` and `chrome-extension://<ID>/` using ID from 6. Copy the file to Chrome or Chromium configuration folder, e.g., on \*nix `~/.config/chromium/NativeMessagingHosts`; `~/.config/google-chrome-unstable/NativeMessagingHosts`.
7. Make sure `node` executable and `nm_node.js` are executable
8. To test click `service worker` link in panel of unpacked extension which is DevTools for `background.js` in MV3 `ServiceWorker`, observe echo'ed message from Node.js Native Messaging host. To disconnect run `port.disconnect()`.

The Native Messaging host echoes back the message passed. 

Node.js exits with input >= `new Array(13107)`. QuickJS and Deno JavaScript runtimes don't exit when input >= `new Array(13107)`.

For differences between OS and browser implementations see [Chrome incompatibilities](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#native_messaging).
