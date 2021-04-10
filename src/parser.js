var MarkdownIt = require('markdown-it')

class Parser {
    constructor() {
        this.md = new MarkdownIt()
    }

    toHtml(markdown) {
        return this.md.render(markdown)
    }
}

module.exports = Parser
