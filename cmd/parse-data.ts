import { parseSeeAlsoLinks } from "./parse-data/parse-see-also-links.ts";
import { parseNotes } from "./parse-data/parse-notes.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseSeeAlsoLinks();
  parseNotes();
  console.log("==> Data parsing completed successfully.");
}

main();

