import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SOURCE_DIR = path.resolve("dev", "bulk_photos", "badsch-small");
const TARGET_DIR = path.resolve("images", "retro");
const DPOD_FILE = path.resolve("data", "retro.dpod.txt");
const FILE_PREFIX = "badsch";

function moveFile(sourcePath: string, targetPath: string): void {
  try {
    fs.renameSync(sourcePath, targetPath);
  } catch (err: any) {
    if (err && err.code === "EXDEV") {
      fs.copyFileSync(sourcePath, targetPath);
      fs.unlinkSync(sourcePath);
    } else {
      throw err;
    }
  }
}

async function main(): Promise<void> {
  console.log("\n==> Starting Create Photo DPOD File process");
  console.log(`Source:      ${SOURCE_DIR}`);
  console.log(`Destination: ${TARGET_DIR}`);
  console.log(`DPOD File:   ${DPOD_FILE}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`\nError: Source directory does not exist: ${SOURCE_DIR}\n`);
    process.exit(1);
  }

  const entries = fs.readdirSync(SOURCE_DIR);
  const imageFiles = entries.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) return false;
    const stat = fs.statSync(path.join(SOURCE_DIR, file));
    return stat.isFile();
  });

  if (imageFiles.length === 0) {
    console.log(`\nNo supported image files found in ${SOURCE_DIR}`);
    return;
  }

  // Sort alphabetically with numeric collation
  imageFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  // Ensure target directories exist
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const dataDir = path.dirname(DPOD_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`Found ${imageFiles.length} image(s) to process.\n`);

  const renamedFiles: string[] = [];
  const padLength = 3;

  for (let i = 0; i < imageFiles.length; i++) {
    const originalName = imageFiles[i];
    const sourceFilePath = path.join(SOURCE_DIR, originalName);
    const ext = path.extname(originalName).toLowerCase();
    const indexStr = String(i + 1).padStart(padLength, "0");
    const newFileName = `${FILE_PREFIX}_${indexStr}${ext}`;
    const targetFilePath = path.join(TARGET_DIR, newFileName);

    moveFile(sourceFilePath, targetFilePath);
    renamedFiles.push(newFileName);

    const progress = `[${i + 1}/${imageFiles.length}]`.padStart(
      `[${imageFiles.length}/${imageFiles.length}]`.length
    );
    console.log(`${progress} ${originalName} -> ${newFileName}`);
  }

  // Write the DPOD file with each filename on a separate line
  const dpodContent = renamedFiles.join("\n") + "\n";
  fs.writeFileSync(DPOD_FILE, dpodContent, "utf-8");

  console.log(`\n==> DPOD file created: ${DPOD_FILE}`);
  console.log(`==> Processed and moved ${renamedFiles.length} file(s) successfully.\n`);
}

main().catch((err) => {
  console.error("\nUnexpected error during execution:", err);
  process.exit(1);
});
