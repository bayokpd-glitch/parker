const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const PREVIEW_URL = process.env.PREVIEW_URL || "http://localhost:3000";
const OUTPUT = process.env.OUTPUT || "preview-recording.webm";

// Change this to your video duration in seconds.
// Example: 20 minutes = 20 * 60
const RECORD_SECONDS = Number(process.env.RECORD_SECONDS || 20 * 60);

const WIDTH = Number(process.env.WIDTH || 1920);
const HEIGHT = Number(process.env.HEIGHT || 1080);
const FPS = Number(process.env.FPS || 30);
const BITRATE = Number(process.env.BITRATE || 12000000);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log("Opening Remotion preview:", PREVIEW_URL);
  console.log("Output:", OUTPUT);
  console.log("Record seconds:", RECORD_SECONDS);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
    },
    args: [
      "--autoplay-policy=no-user-gesture-required",
      `--window-size=${WIDTH},${HEIGHT}`,
      "--disable-infobars",
    ],
  });

  const page = await browser.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: "networkidle2" });

  console.log("");
  console.log("IMPORTANT:");
  console.log("1) Make sure the Remotion preview is visible.");
  console.log("2) Click play in the preview if it does not autoplay.");
  console.log("3) When Chrome asks what to share, select the Remotion tab/window/screen.");
  console.log("");
  console.log("Recording setup starts in 5 seconds...");
  await wait(5000);

  const chunks = [];

  await page.exposeFunction("saveChunk", async (chunk) => {
    chunks.push(Buffer.from(chunk));
  });

  await page.evaluate(
    async ({ recordSeconds, width, height, fps, bitrate }) => {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: fps,
          width,
          height,
        },
        audio: true,
      });

      const mimeTypes = [
        "video/webm; codecs=vp9,opus",
        "video/webm; codecs=vp8,opus",
        "video/webm",
      ];

      const mimeType =
        mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
        "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate,
      });

      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          const arrayBuffer = await event.data.arrayBuffer();
          await window.saveChunk(Array.from(new Uint8Array(arrayBuffer)));
        }
      };

      recorder.start(1000);

      await new Promise((resolve) =>
        setTimeout(resolve, recordSeconds * 1000)
      );

      await new Promise((resolve) => {
        recorder.onstop = resolve;
        recorder.stop();
      });

      stream.getTracks().forEach((track) => track.stop());
    },
    {
      recordSeconds: RECORD_SECONDS,
      width: WIDTH,
      height: HEIGHT,
      fps: FPS,
      bitrate: BITRATE,
    }
  );

  const outputPath = path.resolve(process.cwd(), OUTPUT);
  fs.writeFileSync(outputPath, Buffer.concat(chunks));

  console.log("");
  console.log("Saved recording:");
  console.log(outputPath);
  console.log("");
  console.log("Convert to MP4:");
  console.log(
    `ffmpeg -i "${OUTPUT}" -c:v libx264 -preset fast -crf 18 -c:a aac final-recording.mp4`
  );

  await browser.close();
})().catch((err) => {
  console.error("Recording failed:");
  console.error(err);
  process.exit(1);
});