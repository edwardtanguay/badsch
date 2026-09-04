import { parseNotes } from "./parse-data/parse-notes.ts";
import { parseHikes } from "./parse-data/parse-hikes.ts";
import { parseRetro } from "./parse-data/parse-retro.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseNotes();
  parseHikes();
  parseRetro();
  console.log("==> Data parsing completed successfully.");
}

main();

