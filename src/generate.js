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
    const loader = new Loader()
    const parser = new Parser()

    const results = []
    const tocChapters = []
    const tocPageCount = countTocPages(targetConfig, loader)
    const totalPages = countTotalPages(targetConfig, loader, tocPageCount)
    let currentPage = targetConfig.pageCount.offset + tocPageCount

    for (const chapterConfig of targetConfig.chapters) {
        const chapter = loader.parse(chapterConfig.sourceDir, 'index.md')
        chapter.content = parser.toHtml(chapter.__content)
        delete chapter.__content

        results.push(renderer.render(chapterConfig.indexTemplate, {
            ...chapter,
            chapterConfig,
            targetConfig,
            ...config.templateGlobals,
            pageCount: {
                total: totalPages,
                current: currentPage,
            },
        }))

        const chapterTocEntry = {
            title: chapter.title,
            page: currentPage,
            pages: [],
        }

        currentPage += chapterConfig.pageCount.indexIncrement

        for (const page of loader.iterate(chapterConfig.sourceDir)) {
            page.content = parser.toHtml(page.__content)
            delete page.__content

            const result = renderer.render(chapterConfig.template, {
                ...page,
                chapterConfig,
                targetConfig,
                chapter,
                ...config.templateGlobals,
                pageCount: {
                    total: totalPages,
                    current: currentPage,
                },
            })
            results.push(result)

            chapterTocEntry.pages.push({
                title: page.title,
                page: currentPage,
            })

            currentPage += chapterConfig.pageCount.increment
        }

        tocChapters.push(chapterTocEntry)
    }

    const tocPages = generateTocPages(targetConfig, tocChapters, targetConfig.pageCount.offset, totalPages)

    const resultHtml = renderer.render(targetConfig.skeleton, {
        ...config.templateGlobals,
        target: targetConfig,
        pages: results,
        tocPages,
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
 * Display CLI usage instructions.
 */
function displayUsage() {
    console.info('Usage: generate.js <target>\n')
}

/**
 * Calculate the total number of pages.
 * @return {Number}
 */
function countTotalPages(targetConfig, loader, tocPages) {
    let count = targetConfig.pageCount.offset + targetConfig.pageCount.trailing + tocPages

    for (const chapter of targetConfig.chapters) {
        count += loader.count(chapter.sourceDir) * chapter.pageCount.increment
    }

    return count
}

function countTocPages(targetConfig, loader) {
    let lines = 0

    for (const chapter of targetConfig.chapters) {
        // one line per chapter
        lines++

        // one line per entry
        lines += loader.count(chapter.sourceDir)
    }

    let pages = Math.ceil(lines/targetConfig.toc.entriesPerPage)

    if (pages % 2 != 0) {
        // even number of pages enforced
        pages++
    }

    return pages
}

/**
 * Build an array of slices (pages) for the TOC.
 *
 * Each slice consists of a list of "chapters".
 * Each chapter has one or more `pages`.
 *
 * @param  {[type]} targetConfig [description]
 * @param  {[type]} tocChapters  [description]
 * @param  {[type]} pageOffset   [description]
 * @param  {[type]} totalPages   [description]
 * @return {[type]}              [description]
 */
function generateTocPages(targetConfig, tocChapters, pageOffset, totalPages) {
    if (!targetConfig.toc || !targetConfig.toc.template || tocChapters.length < 1) return [];

    const flatToc = flattenToc(tocChapters)

    const chunks = []
    for (let i = 0, j = flatToc.length; i < j; i += targetConfig.toc.entriesPerPage) {
        chunks.push(flatToc.slice(i, i + targetConfig.toc.entriesPerPage))
    }

    if (chunks.length % 2 != 0) {
        // add an empty page to get an even count
        chunks.push([])
    }

    return chunks.map((chunk, index) => ({
        entries: chunk,
        pageCount: {
            current: index + pageOffset,
            total: totalPages,
        },
    }))
}

function flattenToc(tocChapters) {
    return tocChapters.reduce((toc, chapter) => {
        toc.push({
            title: chapter.title,
            page: chapter.page,
            isChapter: true,
        })

        for (const page of chapter.pages) {
            toc.push({
                title: page.title,
                page: page.page,
                isChapter: false,
            })
        }

        return toc
    }, [])
}
