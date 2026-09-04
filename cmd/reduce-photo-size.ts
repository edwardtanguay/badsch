import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_DIMENSION = 1280;
const QUALITY = 80;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main(): Promise<void> {
  const folderName = process.argv[2]?.trim();

  if (!folderName) {
    console.error("Error: Missing folder argument.");
    console.log("\nUsage:");
    console.log("  npm run rps <folder-name>");
    console.log("\nExample:");
    console.log("  npm run rps badsch\n");
    process.exit(1);
  }

  const inputDir = path.resolve("dev", "bulk_photos", folderName);
  const outputDir = path.resolve("dev", "bulk_photos", `${folderName}-small`);

  if (!fs.existsSync(inputDir)) {
    console.error(`\nError: Source directory does not exist: ${inputDir}\n`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allEntries = fs.readdirSync(inputDir);
  const imageFiles = allEntries.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) return false;
    const stat = fs.statSync(path.join(inputDir, file));
    return stat.isFile();
  });

  if (imageFiles.length === 0) {
    console.log(`\nNo supported image files found in ${inputDir}`);
    return;
  }

  console.log(`\n==> Reducing photo sizes in "${folderName}"`);
  console.log(`Source:      ${inputDir}`);
  console.log(`Destination: ${outputDir}`);
  console.log(`Images:      ${imageFiles.length} file(s)`);
  console.log(`Target max:  ${MAX_DIMENSION}x${MAX_DIMENSION}px (preserving aspect ratio)`);
  console.log(`Quality:     ${QUALITY}%\n`);

  const startTime = Date.now();
  let totalOriginalBytes = 0;
  let totalNewBytes = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const sourceFilePath = path.join(inputDir, file);
    const targetFilePath = path.join(outputDir, file);

    const originalSize = fs.statSync(sourceFilePath).size;
    totalOriginalBytes += originalSize;

    const ext = path.extname(file).toLowerCase();

    let pipeline = sharp(sourceFilePath)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 8 });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: QUALITY });
    }

    await pipeline.toFile(targetFilePath);

    const newSize = fs.statSync(targetFilePath).size;
    totalNewBytes += newSize;

    const diffPct = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
    const indexStr = `[${i + 1}/${imageFiles.length}]`.padStart(
      `[${imageFiles.length}/${imageFiles.length}]`.length
    );

    console.log(
      `${indexStr} ${file}: ${formatBytes(originalSize)} -> ${formatBytes(newSize)} (-${diffPct}%)`
    );
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalSavedBytes = totalOriginalBytes - totalNewBytes;
  const totalSavedPct = (
    (totalSavedBytes / (totalOriginalBytes || 1)) *
    100
  ).toFixed(1);

  console.log("\n==> Compression Summary");
  console.log(`Total images:     ${imageFiles.length}`);
  console.log(`Original size:    ${formatBytes(totalOriginalBytes)}`);
  console.log(`Reduced size:     ${formatBytes(totalNewBytes)}`);
  console.log(`Space saved:      ${formatBytes(totalSavedBytes)} (-${totalSavedPct}%)`);
  console.log(`Elapsed time:     ${durationSec}s\n`);
}

main().catch((err) => {
  console.error("\nUnexpected error during image reduction:", err);
  process.exit(1);
});
