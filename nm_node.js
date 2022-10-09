#!/usr/bin/env -S /path/to/node --max-old-space-size=6 --jitless --expose-gc --v8-pool-size=1
// Node.js Native Messaging host
// guest271314, 10-9-2022
// Node.js Native Messaging host constantly increases RSS during usage
// https://github.com/nodejs/node/issues/43654
process.env.UV_THREADPOOL_SIZE = 1;
global.gc();
// "The implementation is such that the readable event must be used ..."
// https://github.com/nodejs/node/discussions/43918#discussioncomment-3199654
process.stdin.on('readable', () => {
  // Exits with input >= new Array(13107)
  // QuickJS and Deno don't exit when input >= new Array(13107)
  let input = process.stdin.read();
  let length = new DataView(input.buffer).getUint32(0, true);
  let content = new Uint8Array(length);
  content.set(input.subarray(4, length + 4));
  sendMessage(content);
  input = length = content = null;
  global.gc();
});

function sendMessage(json) {
  let header = Uint32Array.from(
    {
      length: 4,
    },
    (_, index) => (json.length >> (index * 8)) & 0xff
  );
  let output = new Uint8Array(header.length + json.length);
  output.set(header, 0);
  output.set(json, 4);
  process.stdout.write(output);
  header = output = null;
  global.gc();
}
