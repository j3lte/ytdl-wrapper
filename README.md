# @j3lte/ytdl-wrapper

## Overview

This is a simple module that wraps **[yt-dlp](https://github.com/yt-dlp/yt-dlp)**

## Basic Usage

```typescript
import { YTDLWrapper } from "@j3lte/ytdl-wrapper";

const ytdl = new YTDLWrapper();

// Get media info
const mediaInfo = await ytdl.getMediaInfo("https://www.youtube.com/watch?v=...");

// Download media
ytDlp
  .exec(["https://www.youtube.com/watch?v=....", "-o", "/output/%(title)s.%(ext)s"])
  .on("progress", (progress) => {
    console.log("[PROGRESS]", progress.percent);
  })
  .on("event", (eventType, eventData) => {
    console.log("[EVENT]", eventType, eventData);
  })
  .on("close", (code) => {
    console.log("Process closed with code: " + code);
  })
  .on("error", (err) => {
    console.log("ERROR", err);
  });
```

## License

[MIT License](./LICENSE)
