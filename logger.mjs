import chalk from 'chalk';
import util from 'util';

function getTimestamp() {
    return `[${new Date().toLocaleTimeString('fr-FR')}]`;
}

export default function(caller) {
    const tag = caller?.filename ? caller.filename.split(/\\|\//).pop().replace(/\.(js|mjs)$/, '').toUpperCase() : 'LOG';
    return function(...args) {
        const message = args.map(arg => (typeof arg === 'object' && arg !== null)
            ? util.inspect(arg, { depth: 4, colors: true })
            : arg
        ).join(' ');
        console.log(`${chalk.gray.italic(getTimestamp())} ${chalk.cyan.bold(`[${tag}]`)} ${message}`);
    };
}
