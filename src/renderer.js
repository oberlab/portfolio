const Handlebars = require("handlebars")
var fs = require('fs')

class Renderer {
    constructor(directory) {
        this.directory = directory
        this.hb = Handlebars.create()
        this.templates = {}
    }

    render(template, attributes) {
        this.compileTemplate(template)

        return this.templates[template](attributes)
    }

    compileTemplate(filename) {
        if (filename in this.templates) return

        const content = fs.readFileSync(this.directory + '/' + filename, 'utf-8')
        this.templates[filename] = this.hb.compile(content)
    }
}

module.exports = Renderer
