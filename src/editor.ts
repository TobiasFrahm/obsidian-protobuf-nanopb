import { Range } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { CodeBlock, findBlocks } from "./blocks";
import { highlight } from "./highlight";

export const editorHighlighting = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  private blocks: CodeBlock[];

  constructor(view: EditorView) {
    this.blocks = findBlocks(view.state.doc.toString());
    this.decorations = this.render(view);
  }

  update(update: ViewUpdate): void {
    if (update.docChanged) this.blocks = findBlocks(update.state.doc.toString());
    if (update.docChanged || update.viewportChanged) this.decorations = this.render(update.view);
  }

  private render(view: EditorView): DecorationSet {
    const ranges: Range<Decoration>[] = [];
    for (const block of this.blocks) {
      if (!view.visibleRanges.some(range => range.from < block.to && range.to > block.from)) continue;
      const source = view.state.doc.sliceString(block.from, block.to);
      for (const span of highlight(source, block.language)) {
        if (span.to > span.from) {
          ranges.push(Decoration.mark({ class: `protobuf-nanopb-token pbn-${span.type}` })
            .range(block.from + span.from, block.from + span.to));
        }
      }
    }
    return Decoration.set(ranges, true);
  }
}, { decorations: plugin => plugin.decorations });
