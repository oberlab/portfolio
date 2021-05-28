module.exports = {
    portfolio: {
        title: 'Portfolio',
        sourceDir: 'content/portfolio',
        template: 'portfolio.html',
        skeleton: 'portfolio-skeleton.html',
        tocTemplate: 'toc.html',
        pageCount: {
            offset: 8,
            increment: 2,
            trailing: 0,
        },
        output: {
            html: `out/portfolio.html`,
            pdf: `out/portfolio.pdf`,
        },
    },
    portfolio_school: {
        title: 'Portfolio',
        sourceDir: 'content/portfolio',
        template: 'portfolio.html',
        skeleton: 'portfolio-skeleton_school.html',
        tocTemplate: 'toc.html',
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
