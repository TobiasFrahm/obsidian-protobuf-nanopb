import { parser } from "@lezer/markdown";
import { isSupported } from "./highlight";

export interface CodeBlock {
  language: string;
  from: number;
  to: number;
}

// Parse Markdown rather than matching fences with regex: this also handles
// longer fences, tilde fences, nested lists, and quoted code blocks.
export function findBlocks(source: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  parser.parse(source).iterate({
    enter(ref) {
      if (ref.name !== "FencedCode") return;
      const node = ref.node;
      const info = node.getChild("CodeInfo");
      if (!info) return false;
      const language = source.slice(info.from, info.to).trim().split(/\s+/)[0];
      if (!isSupported(language)) return false;
      for (let child = node.firstChild; child; child = child.nextSibling) {
        if (child.name === "CodeText") {
          blocks.push({ language, from: child.from, to: child.to });
        }
      }
      return false;
    }
  });
  return blocks;
}
