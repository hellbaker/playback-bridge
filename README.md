# Playback Bridge

A small ES5 helper for the Lampa player lifecycle and Android external-player handoff.

Temporarily marks HTTP(S) playback as excluded from the separate preroll stage, then restores the original metadata before handing the stream to the Android player. It also restores metadata on internal-player events and has a 15-second fallback.

## Install

Add the following address in CUB extensions or Lampa extensions, then fully restart Lampa:

```
https://hellbaker.github.io/playback-bridge/bridge.js
```

To undo, disable the extension and restart Lampa.

## Scope

Tested with Android TV and Vimu. This changes the separate pre-playback stage; it does not remove advertisements embedded in a video stream. It leaves account status and network transports unchanged.

The helper relies on internal player APIs. Future application updates may require adjustments. Keep only one extension that changes this playback stage enabled at a time.

## Local check

```
node check.cjs
```

Checks native and internal-player metadata restoration, preservation of the timeline, and existing IPTV metadata.
