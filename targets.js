module.exports = {
    portfolio: {
        title: 'Portfolio',
        sourceDir: 'content/portfolio',
        template: 'portfolio.html',
        skeleton: 'portfolio-skeleton.html',
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
        output: {
            html: `out/portfolio_school.html`,
            pdf: `out/portfolio_school.pdf`,
        },
    }
}
