const MarkdownIt = require('markdown-it')
const MarkdownItContainer = require('markdown-it-container')

class Parser {
    constructor() {
        this.md = new MarkdownIt().use(MarkdownItContainer, 'container')
    }

    toHtml(markdown) {
        return this.md.render(markdown)
    }
}

module.exports = Parser
