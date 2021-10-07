var fs = require('fs')
var yamlFront = require('yaml-front-matter')

const DEFAULT_CONFIG = {
    extensions: ['.md'],
    indexFilename: 'index.md',
}

class Loader {
    constructor(config = {}) {
        this.config = Object.assign(Object.assign({}, DEFAULT_CONFIG), config)
    }

    *iterate(directory) {
        for (const entry of this.iterateRelevantEntries(directory)) {
            yield this.parse(directory, entry.name)
        }
    }

    *iterateRelevantEntries(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            if (!this.fileIsRelevant(entry)) continue

            yield entry
        }
    }

    count(directory) {
        let count = 0
        for (const _ of this.iterateRelevantEntries(directory)) {
            count++
        }
        return count
    }

    parse(directory, filename) {
        const rawContent = fs.readFileSync(directory + '/' + filename)
        const page = yamlFront.loadFront(rawContent)
        page.filename = filename

        return page
    }

    fileIsRelevant(entry) {
        if (!entry.isFile()) return false

        if (entry.name === this.config.indexFilename) return false

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
