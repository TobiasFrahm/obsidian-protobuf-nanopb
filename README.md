# Protobuf & Nanopb Highlighting for Obsidian

Syntax highlighting for Protocol Buffers and nanopb code blocks in Obsidian. Supports Reading view, Live Preview, and Source mode, using your active theme's code colors. No configuration required.

Repository name: `obsidian-protobuf-nanopb` · Plugin ID: `protobuf-nanopb`

## Features

- Protocol Buffers keywords, scalar types, declarations, strings, numbers, and comments.
- Inline nanopb extensions such as `(nanopb).max_length` and `(nanopb).max_count`.
- Separate nanopb `.options` blocks with field patterns, wildcards, and `#` comments.
- Copy button for code blocks in Reading view.
- Local processing without network requests or changes to vault files.

## Usage

Add a supported language identifier to a fenced Markdown code block:

| Identifier | Content |
| --- | --- |
| `proto`, `protobuf`, `nanopb` | Protocol Buffers syntax, including nanopb extensions |
| `nanopb-options` | Separate nanopb `.options` file syntax |

````markdown
```proto
syntax = "proto2";
import "nanopb.proto";

message Sensor {
  optional string name = 1 [(nanopb).max_length = 32];
  repeated float values = 2 [(nanopb).max_count = 8];
}
```
````

For separate nanopb options:

````markdown
```nanopb-options
Sensor.name max_length:32
Sensor.values max_count:8
Sensor.* type:FT_STATIC
```
````

See [examples/demo.md](examples/demo.md) for more examples.

## Installation

Requires Obsidian 1.8.7 or later. The plugin is not yet listed in the official Community directory.

### From a GitHub release

Once a release is available:

1. Download `main.js`, `manifest.json`, and `styles.css` from the repository's GitHub Releases page.
2. Create the folder `.obsidian/plugins/protobuf-nanopb/` inside your vault.
3. Copy all three files into that folder.
4. Reload Obsidian.
5. Open **Settings → Community plugins**, disable Restricted mode if necessary, and enable **Protobuf & Nanopb Highlighting**.

### From source

Requires Node.js 22 and npm. In a local checkout of `obsidian-protobuf-nanopb`, run:

```sh
npm install
npm test
npm run build
```

Then follow the manual installation steps above using the generated `main.js` and the repository's `manifest.json` and `styles.css`.

## Development

| Command | Purpose |
| --- | --- |
| `npm run dev` | Rebuild on changes; reload the plugin in Obsidian to apply them |
| `npm run build` | Type-check and generate `main.js` |
| `npm test` | Test tokenization and Markdown code block detection |

Reading view renders code as DOM text nodes. A CodeMirror 6 extension adds editor highlighting. Markdown is parsed when the document changes; tokenization is limited to code blocks intersecting the visible editor area.

Before releasing, use [examples/demo.md](examples/demo.md) to check Reading view, Live Preview, Source mode, light and dark themes, editing, scrolling, and disabling the plugin in Obsidian. Automated tests do not replace these UI checks.

## Scope

This plugin provides syntax highlighting. It does not validate or compile Protocol Buffers, provide code completion, or register standalone `.proto` files as a new Obsidian file type. It uses no desktop-specific APIs; mobile behavior should be verified separately before release.

## Publishing

Release notes are maintained in [CHANGELOG.md](CHANGELOG.md). Use `0.1.0` for the initial Git tag.

1. Publish the source in a public GitHub repository. Keep `README.md`, `LICENSE`, and `manifest.json` at the repository root.
2. Run `npm install`, `npm test`, and `npm run build`.
3. Create a GitHub release tagged `0.1.0`. The tag must exactly match the version in `manifest.json`, without a `v` prefix.
4. Attach `main.js`, `manifest.json`, and `styles.css` as individual release assets. GitHub's automatically generated source archives are not sufficient for installation through Obsidian.
5. Sign in at [community.obsidian.md](https://community.obsidian.md), link your GitHub account, and submit the repository as a new plugin. Commit the current manifest to the repository's default branch before submitting.
6. Address automated review feedback and publish a new version for corrections.

The included GitHub Action runs tests and builds the plugin, then uploads the plugin files as a workflow artifact. It does not publish a GitHub release.

To upload a locally prepared commit and tag to GitHub:

```sh
git push origin HEAD
git push origin 0.1.0
```

Then create a release on GitHub using the existing `0.1.0` tag, copy its notes from the changelog, and attach the three plugin files. A Git tag alone does not create a GitHub release.

For subsequent releases, update `package.json`, `manifest.json`, and `versions.json`, rebuild, and publish the release assets under the matching version tag.

See the [official submission guide](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) for the publication process and requirements.

## References

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Prism language definitions](https://prismjs.com/extending)
- [Nanopb options reference](https://jpa.kapsi.fi/nanopb/docs/reference.html#proto-file-options)

## License

[MIT](LICENSE).
