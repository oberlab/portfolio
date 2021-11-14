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
    const totalPages = countTotalPages(targetConfig, loader)
    let currentPage = targetConfig.pageCount.offset

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

    const tocPages = sliceToc(targetConfig, tocChapters, renderer)

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
function countTotalPages(targetConfig, loader) {
    let count = targetConfig.pageCount.offset + targetConfig.pageCount.trailing

    for (const chapter of targetConfig.chapters) {
        loader.count(chapter.sourceDir) * chapter.pageCount.increment
    }
}

/**
 * Build an array of slices (pages) for the TOC.
 *
 * Each slice consists of a list of "chapters".
 * Each chapter has one or more `pages`.
 *
 * @param  {[type]} targetConfig [description]
 * @param  {[type]} tocChapters  [description]
 * @param  {[type]} renderer     [description]
 * @return {[type]}              [description]
 */
function sliceToc(targetConfig, tocChapters, renderer) {
    const pages = []
    if (!targetConfig.toc || !targetConfig.toc.template || tocChapters.length < 1) return pages;

    let currentPage = undefined
    let currentChapter = undefined
    let linesOnCurrentPage = 1

    // The read position in the tocChapters data structure
    let cursor = {
        chapter: 0,
        page: -1,
    }

    while (true) {
        cursor.page++

        // Start new page
        if (!currentPage) {
            currentPage = []
            currentChapter = {
                title: tocChapters[cursor.chapter].title,
                page: tocChapters[cursor.chapter].page,
                pages: [],
            }
        }

        // When there are no more chapters left, we're done
        if ((tocChapters.length - 1) < cursor.chapter) {
            break
        }

        // Move to next chapter
        if ((tocChapters[cursor.chapter].pages.length - 1) < cursor.page) {
            currentPage.push(currentChapter)
            currentChapter = undefined
            cursor.chapter++
            cursor.page = -1
            continue
        }

        // Start new chapter
        if (!currentChapter) {
            currentChapter = {
                title: tocChapters[cursor.chapter].title,
                page: tocChapters[cursor.chapter].page,
                pages: [],
            }
            linesOnCurrentPage++
        }

        const line = tocChapters[cursor.chapter].pages[cursor.page]
        currentChapter.pages.push(line)
        linesOnCurrentPage++

        // Render page and push to pages
        if (linesOnCurrentPage >= targetConfig.toc.entriesPerPage) {
            currentPage.push(currentChapter)
            pages.push(renderer.render(targetConfig.toc.template, {
                ...config.templateGlobals,
                target: targetConfig,
                chapters: currentPage,
            }))

            currentPage = undefined
            linesOnCurrentPage = 1
        }
    }

    if (currentPage) {
        pages.push(renderer.render(targetConfig.toc.template, {
            ...config.templateGlobals,
            target: targetConfig,
            chapters: currentPage,
        }))
    }

    return pages
}
