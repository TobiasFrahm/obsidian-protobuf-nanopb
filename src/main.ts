import { MarkdownRenderChild, Plugin } from "obsidian";
import { editorHighlighting } from "./editor";
import { highlight, languages } from "./highlight";

export default class ProtobufNanopbPlugin extends Plugin {
  onload(): void {
    this.registerEditorExtension(editorHighlighting);
    for (const language of languages) {
      this.registerMarkdownCodeBlockProcessor(language, (source, element, context) => {
        const child = new MarkdownRenderChild(element);
        context.addChild(child);
        const pre = element.createEl("pre", { cls: "protobuf-nanopb-block" });
        const code = pre.createEl("code", { cls: `language-${language}` });
        let offset = 0;
        for (const span of highlight(source, language)) {
          code.appendText(source.slice(offset, span.from));
          code.createEl("span", {
            cls: `protobuf-nanopb-token pbn-${span.type}`,
            text: source.slice(span.from, span.to)
          });
          offset = span.to;
        }
        code.appendText(source.slice(offset));
        const button = pre.createEl("button", { cls: "copy-code-button", text: "Copy" });
        button.setAttribute("aria-label", "Copy code");
        child.registerDomEvent(button, "click", () => {
          void navigator.clipboard.writeText(source).then(() => {
            button.textContent = "Copied!";
          }, () => {
            button.textContent = "Copy failed";
          });
        });
      });
    }
  }
}
