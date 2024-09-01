#!/usr/bin/env -S /path/to/node -experimental-default-type=module
// Node.js Native Messaging host
// guest271314, 10-9-2022

import { spawn } from "node:child_process";
import { Duplex } from "node:stream";

const runtime = navigator.userAgent;
const buffer = new ArrayBuffer(0, {
  maxByteLength: 1024 ** 2
});
const view = new DataView(buffer);
const decoder = new TextDecoder();
const encoder = new TextEncoder();

// https://nodejs.org/api/stream.html#consuming-readable-streams-with-async-iterators
const readable = process.stdin;
const writable = new WritableStream({
  write(value) {
    process.stdout.write(value);
  }
});

function encodeMessage(message) {
  return encoder.encode(JSON.stringify(message));
}

async function* getMessage() {
  let messageLength = 0;
  let readOffset = 0;
  for await (let message of readable) {
    if (buffer.byteLength === 0 && messageLength === 0) {
      buffer.resize(4);
      for (let i = 0; i < 4; i++) {
        view.setUint8(i, message[i]);
      }
      messageLength = view.getUint32(0, true);
      message = message.subarray(4);
      buffer.resize(0);
    }
    buffer.resize(buffer.byteLength + message.length);
    for (let i = 0; i < message.length; i++, readOffset++) {
      view.setUint8(readOffset, message[i]);
    }
    if (buffer.byteLength === messageLength) {
      yield new Uint8Array(buffer);
      messageLength = 0;
      readOffset = 0;
      buffer.resize(0);
    }
  }
}

async function sendMessage(message) {
  await new Blob([
      new Uint8Array(new Uint32Array([message.length]).buffer),
      message,
    ])
    .stream()
    .pipeTo(writable, {
      preventClose: true
    });
}

try {
  for await (const message of getMessage()) {
    const script = JSON.parse(decoder.decode(message)).slice(1, -1);
    const { stdout, stderr } = spawn(process.argv.at(0), ["-e", script]);
    const { readable: r, writable: w } = Duplex.toWeb(stdout);
    const data = encodeMessage(await new Response(r).text());
    await sendMessage(data);
  }
} catch (e) {
  process.exit();
}

/*
export {
  args,
  encodeMessage,
  exit,
  getMessage,
  readable,
  sendMessage,
  writable,
};
*/
