import { parseNotes } from "./parse-data/parse-notes.ts";
import { parseHikes } from "./parse-data/parse-hikes.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseNotes();
  parseHikes();
  console.log("==> Data parsing completed successfully.");
}

main();

