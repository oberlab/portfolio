var fs = require('fs')
var yamlFront = require('yaml-front-matter')

const DEFAULT_CONFIG = {
    extensions: ['.md'],
}

class Loader {
    constructor(directory, config = {}) {
        this.directory = directory
        this.config = Object.assign(Object.assign({}, DEFAULT_CONFIG), config)
    }

    *iterate() {
        const files = fs.readdirSync(this.directory, { withFileTypes: true })
        for (const entry of files) {
            if (!this.fileIsRelevant(entry)) continue

            yield this.parse(entry.name)
        }
    }

    parse(filename) {
        const rawContent = fs.readFileSync(this.directory + '/' + filename)
        const page = yamlFront.loadFront(rawContent)
        page.filename = filename

        return page
    }

    fileIsRelevant(entry) {
        if (!entry.isFile()) return false

        let matchedExtension = false
        for (const ext of this.config.extensions) {
            if (entry.name.endsWith(ext)) {
                matchedExtension = true
                break
            }
        }
        if (!matchedExtension) return false

        return true
    }
}

module.exports = Loader
