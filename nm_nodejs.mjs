#!/usr/bin/env -S ./node --max-old-space-size=6 --jitless --expose-gc --v8-pool-size=1
// Node.js Native Messaging host
// guest271314, 10-9-2022
#!/usr/bin/env -S /home/xubuntu/bin/node-v21.0.0-nightly20231001092fb9f541-linux-x64/bin/node --expose-gc
// Node.js Native Messaging host
// guest271314, 10-7-2023
// Browser <=> Node.js fetch() full duplex streaming

import { open } from "node:fs/promises";
process.env.UV_THREADPOOL_SIZE = 1;
// Process greater than 65535 length input
// https://github.com/nodejs/node/issues/6456
// https://github.com/nodejs/node/issues/11568#issuecomment-282765300
// https://www.reddit.com/r/node/comments/172fg10/comment/k3xcax5/
process.stdout._handle.setBlocking(true);

async function getMessage() {
  const header = new Uint32Array(1);
  await readFullAsync(1, header);
  const content = await readFullAsync(header[0]);
  return content;
}

// https://github.com/denoland/deno/discussions/17236#discussioncomment-4566134
// https://github.com/saghul/txiki.js/blob/master/src/js/core/tjs/eval-stdin.js
async function readFullAsync(length, buffer = new Uint8Array(65536)) {
  const data = [];
  while (data.length < length) {
    const input = await open("/dev/stdin");
    let { bytesRead } = await input.read({
      buffer
    });
    await input.close();
    if (bytesRead === 0) {
      break;
    }
    data.push(...buffer.subarray(0, bytesRead));  
  }
  return new Uint8Array(data);
}

function sendMessage(json) {
  let header = Uint32Array.from({
    length: 4,
  }, (_,index)=>(json.length >> (index * 8)) & 0xff);
  let output = new Uint8Array(header.length + json.length);
  output.set(header, 0);
  output.set(json, 4);
  process.stdout.write(output);
  // Mitigate RSS increasing expotentially for multiple messages
  // between client and host during same connectNative() connection
  header = output = null;
  global.gc();
}

async function main() {
  while (true) {
    try {
      const message = await getMessage();
      sendMessage(message);
    } catch (e) {
      process.exit();
    }
  }
}

main();
