import { parseNotes } from "./parse-data/parse-notes.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseNotes();
  console.log("==> Data parsing completed successfully.");
}

main();
