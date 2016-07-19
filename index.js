const fs = require('fs');
const cheerio = require('cheerio');
const cssnano = require('cssnano');

var data = require('./data.json');
var html = fs.readFileSync('primal.tmpl');
var styles = fs.readFileSync('primal.css');
var $ = cheerio.load(html);

// Work with data
var str = JSON.stringify(data, function (k, v) {
    // image
    if (/.(svg|jpg|png|gif)$/.test(v))
        return `<a href='${v}'>${v}<img src='${v}'></a>`
    // links
    if (k === 'url')
        return `<a href='${v}'>${v}</a>`
    
    return v;
}, '\t')
        .replace(/".+"(?=:)/g, '<span class=\'prop\'>$&</span>')  // wrap props
        .replace(/".+?"/g, '<span class=\'string\'>$&</span>')   // wrap strings
        .replace(/.+(?=\n|$)/g, '<div class=\'line\'>$&</div>') // insert lines
        .replace(/\t/g, '<span class=\'tab\'>\t</span>')       // tabs -> span.tab
        ;

// Insirt data in template
$('pre.data').html(str);

// Insert styles
$('link').each((index, elem) => {
    cssnano.process(styles)
        .then(({css}) => {
            $(elem).replaceWith(`<style>${css}</style>`);
            fs.writeFileSync('index.html', $.html());
        })
    
});