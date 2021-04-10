const fs = require('fs')

const Loader = require('./loader')
const Parser = require('./parser')
const Renderer = require('./renderer')

const targets = require('../targets')
const config = require('../config')

const target = process.argv.slice(2)[0]
if (!target) {
    displayUsage()
    console.error('Please specify the <target> argument\n')
    process.exit(-1)
}

process.exit(run(target))

/**
 * Run the generator.
 *
 * @param  {string} target
 * @return {int}
 */
function run(target) {
    if (!(target in targets)) {
        console.error(`Target "${target}" not defined\n`)
        return -1
    }

    const targetConfig = targets[target]

    const renderer = new Renderer(config.templateDir)

    const results = []
    const loader = new Loader(targetConfig.sourceDir)
    for (const page of loader.iterate()) {
        results.push(generate(page, targetConfig, renderer))
    }

    const outputFile = targetConfig.outputDir + '/index.html'
    fs.mkdirSync(targetConfig.outputDir, { recursive: true })
    fs.writeFileSync(outputFile, renderer.render(targetConfig.skeleton, {
        pages: results,
    }))

    return 0
}

/**
 * Generate a single page.
 *
 * @param  {object} page
 * @param  {object} targetConfig
 * @param  {Renderer} renderer
 * @return {[type]}
 */
function generate(page, targetConfig, renderer) {
    const parser = new Parser()
    const html = parser.toHtml(page.__content)
    delete page.__content
    page.content = html

    return renderer.render(targetConfig.template, page)
}

/**
 * Display CLI usage instructions.
 */
function displayUsage() {
    console.info('Usage: generate.js <target>\n')
}
