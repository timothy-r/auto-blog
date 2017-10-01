const pug = require('pug');

// Compile the source code
const compiledFunction = pug.compileFile('index.pug');

// Render a set of data
console.log(compiledFunction({
    pageTitle: 'Pages',
    navItems: ['birds', 'historical', 'toons', 'bright-blue']
}));