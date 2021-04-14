# Portfolio (Mobiles FabLab)

> Content and (PDF-) generators for our portfolio (digital & print)

## Resources:
- [Print layout](https://www.wir-machen-druck.de/broschueren-drahtheftung-din-a5-quer-extrem-guenstig-drucken,category,9437.html
)

## Dev Setup
```sh
npm install
```

## Usage
1. Place content inside `content` directory (markdown with yaml front matter)
2. Define build targets in `targets.js`. Keys of the object are valid values for the `target` argument to the generate command
3. Create templates (in `templates` directory)
4. Generate output: `npm run generate <target>` e.g. `npm run generate portfolio`

## Guides
### Templating
This project uses handlebars.js for templating. Please refer to the [Language Guide](https://handlebarsjs.com/guide) on how to write handlebars templates.

### Markdown
The markdown parser used in this project is called [markdown-it](https://github.com/markdown-it/markdown-it). It implements the CommonMark standard plus some extensions. Please refer to the [CommonMark Spec](https://spec.commonmark.org/current/) for valid syntax.
