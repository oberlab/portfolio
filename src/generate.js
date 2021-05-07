const fs = require('fs')
const htmlToPdf = require('html-pdf-node')

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

const pdf_output = process.argv.slice(3)[0]
var create_pdf = false

if (pdf_output == "pdf") {
    var create_pdf = true
    run(target).then(status => process.exit(status))

} else {
    process.exit(run(target))
}

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

    const resultHtml = renderer.render(targetConfig.skeleton, {
        ...config.templateGlobals,
        target: targetConfig,
        pages: results,
    })

    fs.writeFileSync(targetConfig.output.html, resultHtml)

    if (create_pdf) {
        return htmlToPdf.generatePdf({ url: `file://${process.cwd()}/${targetConfig.output.html}` }, {
            preferCSSPageSize: true,
            printBackground: true,
          })
            .then(pdf => {
                fs.writeFileSync(targetConfig.output.pdf, pdf)
                return 0
            })
      }
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

    return renderer.render(targetConfig.template, {
        ...config.templateGlobals,
        target: targetConfig,
        ...page,
    })
}

/**
 * Display CLI usage instructions.
 */
function displayUsage() {
    console.info('Usage: generate.js <target>\n')
}
