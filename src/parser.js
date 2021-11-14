const MarkdownIt = require('markdown-it')
const MarkdownItContainer = require('markdown-it-container')

class Parser {
    constructor() {
        this.md = new MarkdownIt().use(MarkdownItContainer, 'short_description')
        this.md.use(MarkdownItContainer, 'learning_goals')
        this.md.use(MarkdownItContainer, 'message')
        this.md.use(MarkdownItContainer, 'special_notes')
        this.md.use(MarkdownItContainer, 'process')
        this.md.use(MarkdownItContainer, 'curriculum')
    }


    toHtml(markdown) {
        return this.md.render(markdown)
    }
}

module.exports = Parser
