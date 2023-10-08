#!/usr/bin/env -S ./node --max-old-space-size=6 --jitless --expose-gc --v8-pool-size=1
// Node.js Native Messaging host
// guest271314, 10-9-2022
import {open} from 'node:fs/promises';
// Node.js Native Messaging host constantly increases RSS during usage
// https://github.com/nodejs/node/issues/43654
process.env.UV_THREADPOOL_SIZE = 1;
// Process greater than 65535 length input
// https://github.com/nodejs/node/issues/6456
// https://github.com/nodejs/node/issues/11568#issuecomment-282765300
// https://www.reddit.com/r/node/comments/172fg10/comment/k3xcax5/
process.stdout._handle.setBlocking(true);
// https://github.com/denoland/deno/discussions/17236#discussioncomment-4566134
async function readFullAsync(length) {
  const buffer = new Uint8Array(65536);
  const data = [];
  while (data.length < length) {
    const input = await open("/dev/stdin");
    let { bytesRead } = await input.read({
      buffer
    });
    if (bytesRead === 0) {
      break;
    }
    data.push(...buffer.subarray(0, bytesRead));
    await input.close();
  }
  return new Uint8Array(data);
}

function getMessage() {
  const header = new Uint32Array(1);
  readFullAsync(0, header);
  const content = new Uint8Array(header[0]);
  readFullAsync(0, content);
  return content;
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

function main() {
  while (true) {
    try {
      const message = getMessage();
      sendMessage(message);
    } catch (e) {
      process.exit();
    }
  }
}

main();
