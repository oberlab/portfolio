const MarkdownIt = require('markdown-it')
const MarkdownItContainer = require('markdown-it-container')

class Parser {
    constructor() {
        this.md = new MarkdownIt().use(MarkdownItContainer, 'short_description')
    }

    toHtml(markdown) {
        return this.md.render(markdown)
    }
}

module.exports = Parser
