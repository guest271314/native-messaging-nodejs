#!/usr/bin/env -S node --expose-gc
// Node.js Native Messaging host
// guest271314, 10-7-2023
// Browser <=> Node.js fetch() full duplex streaming
import { open } from "node:fs/promises";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let {
  writable,
  readable: body,
} = new TransformStream();
let abortable = new AbortController();
let {
  signal,
} = abortable;
let writer = null;
let now = null;

async function handleError(err) {
  await sendMessage(
    encodeMessage((err && err.stack) ? err.stack.toString() : err.toString()),
  );
}

process.on("uncaughtException", handleError);

process.on("unhandledRejection", handleError);

process.on("warning", handleError);

async function getMessage() {
  const header = new Uint32Array(1); 
  await readFullAsync(1, header); 
  const data = await readFullAsync(header[0]);
  if (!writable.locked) {
    writer = writable.getWriter();
    const {
      url,
      method,
      headers = { "Content-Type": "text/plain" },
      duplex = "half",
    } = JSON.parse(decoder.decode(data));
    // Returning the Promise, or using await doesn't stream
    return Promise.race([
      ,
      fetch(
        new Request(url, {
          // Node.js logs duplex must set (to half) for upload streaming, still doesn't work using the same code
          duplex,
          method,
          headers,
          signal,
          body,
        }),
      )
        .then(({
          body: readable,
        }) =>
          readable.pipeThrough(new TextDecoderStream())
            .pipeTo(
              new WritableStream({
                async start() {
                  now = performance.now();
                  return sendMessage(
                    encodeMessage(`Starting read stream ${now}`),
                  );
                },
                async write(value) {
                  await sendMessage(encoder.encode(value));
                  global.gc();
                },
                async close() {
                  await sendMessage(encodeMessage("Stream closed."));
                },
                async abort(reason) {
                  await sendMessage(encodeMessage({
                    ABORT_REASON: reason,
                    now: ((performance.now() - now) / 1000) / 60,
                  }));
                  process.exit();
                },
              }),
            )
        )
        .then(async () => {
          ({
            writable,
            readable: body,
          } = new TransformStream());
          abortable = new AbortController();
          ({
            signal,
          } = abortable);
          writer = null;
          now = null;
          await sendMessage(encodeMessage("Stream reset after closing."));
        })
        .catch(handleError),
    ]);
  } else {
    const message = decoder.decode(data);
    if (message === `"ABORT_STREAM"`) {
      return abortable.abort(message);
    }
    if (message === `"CLOSE_STREAM"`) {
      await writer.close();
      return await writer.closed;
    }
    await writer.ready;
    return await writer.write(data)
      .catch(handleError);
  }
}

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

async function sendMessage(json) {
  // Alternatively
  //  let header = Uint32Array.from({
  //    length: 4,
  //  }, (_, index) => (json.length >> (index * 8)) & 0xff);
  const header = new Uint32Array([json.length]);
  const stdout = await open(`/proc/${process.pid}/fd/1`, "w");
  await stdout.write(header);
  await stdout.write(json);
  await stdout.close();
  global.gc();
  return;
}

function encodeMessage(message) {
  return encoder.encode(JSON.stringify(message));
}

async function main() {
  while (true) {
    try {
       const message = await getMessage();   
    } catch (err) {
      handleError(err);
    }
  }
}

main();
