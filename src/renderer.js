const Handlebars = require("handlebars")
var fs = require('fs')

class Renderer {
    constructor(directory) {
        this.directory = directory
        this.hb = Handlebars.create()
        this.templates = {}
        this.loadPartials()

        this.hb.registerHelper('add', (a, b) => a+b)
        this.hb.registerHelper('mod', (a, b) => a%b)
        this.hb.registerHelper('eq', (a, b) => a===b)
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

    loadPartials() {
        const dir = this.directory + '/partials'
        const partials = fs.readdirSync(dir, { withFileTypes: true })
        for (const file of partials) {
            if (!file.isFile()) continue

            const identifier = file.name.split('.').slice(0, -1).join('.')
            this.hb.registerPartial(identifier, fs.readFileSync(dir + '/' + file.name, 'utf-8'))
        }
    }
}

module.exports = Renderer
