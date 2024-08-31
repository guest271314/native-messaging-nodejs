Node.js Native Messaging host

Installation and usage on Chrome and Chromium

1. Navigate to `chrome://extensions`.
2. Toggle `Developer mode`.
3. Click `Load unpacked`.
4. Select `native-messaging-nodejs` folder.
5. Note the generated extension ID.
6. Open `nm_nodejs_eval.json` in a text editor, set `"path"` to absolute path of `nm_nodejs_eval.js` and `chrome-extension://<ID>/` using ID from 5 in `"allowed_origins"` array. 
7. Copy the file to Chrome or Chromium configuration folder, e.g., Chromium on \*nix `~/.config/chromium/NativeMessagingHosts`; Chrome dev channel on \*nix `~/.config/google-chrome-unstable/NativeMessagingHosts`.
8. Make sure `node` executable and `nm_nodejs_eval.js` are executable.
9. To test click pin the `nm-node-eval` extension icon on the task bar, click the action icon to open side panel, type the script to be evaluated in `<textarea>`. Press `Enter` key. Standard output from the `node -e script` subprocess will be written to the `<textarea>` beneath the input script.


![Screenshot_2024-08-31_15-52-09](https://github.com/user-attachments/assets/863c7c50-13fb-42a2-a856-352a9b0dc6d9)


For differences between OS and browser implementations see [Chrome incompatibilities](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#native_messaging).

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)
