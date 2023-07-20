/* eslint-disable no-restricted-globals */

self.onmessage = (e: MessageEvent<string>) => {
  if (e.data == "ping") {
    self.postMessage("pong");
  }
};

export {};
