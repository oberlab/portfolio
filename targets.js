module.exports = {
    portfolio: {
        title: 'Portfolio',
        skeleton: 'portfolio-skeleton.html',
        toc: {
            template: 'toc.html',
            entriesPerPage: 15,
        },
        chapters: [
            {
                sourceDir: 'content/portfolio/kurse',
                template: 'portfolio.html',
                indexTemplate: 'portfolio-chapter.html',
                pageCount: {
                    increment: 2,
                    indexIncrement: 2,
                },
            },
            {
                sourceDir: 'content/portfolio/events',
                template: 'portfolio.html',
                indexTemplate: 'portfolio-chapter.html',
                pageCount: {
                    increment: 2,
                    indexIncrement: 2,
                },
            },
        ],
        pageCount: {
            offset: 12,
            trailing: 0,
        },
        output: {
            html: `out/portfolio.html`,
            pdf: `out/portfolio.pdf`,
        },
    },
    portfolio_school: {
        title: 'Portfolio',
        skeleton: 'portfolio-skeleton_school.html',
        chapters: [
            {
                sourceDir: 'content/portfolio/kurse',
                template: 'portfolio.html',
                indexTemplate: 'portfolio-chapter.html',
                pageCount: {
                    increment: 2,
                    indexIncrement: 2,
                },
            },
            {
                sourceDir: 'content/portfolio/kurspakete',
                template: 'portfolio.html',
                indexTemplate: 'portfolio-chapter.html',
                pageCount: {
                    increment: 2,
                    indexIncrement: 2,
                },
            },
        ],
        toc: {
            template: 'toc.html',
            entriesPerPage: 15,
        },
        pageCount: {
            offset: 8,
            increment: 2,
            trailing: 0,
        },
        output: {
            html: `out/portfolio_school.html`,
            pdf: `out/portfolio_school.pdf`,
        },
    }
}
