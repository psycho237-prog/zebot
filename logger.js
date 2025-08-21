// logger.cjs
const chalk = require('chalk');
const util = require('util');
const path = require('path');

function getTimestamp() {
    return `[${new Date().toLocaleTimeString('fr-FR')}]`;
}

module.exports = function (caller) {
    const tag = caller?.filename
        ? path.basename(caller.filename, '.js').toUpperCase()
        : 'LOG';

    return function (...args) {
        const message = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                // Utilise util.inspect pour une conversion sûre des objets
                return util.inspect(arg, { depth: 4, colors: true });
            }
            return arg;
        }).join(' ');

        // Sécurise l'affichage même si chalk n'est pas défini correctement
        const timestamp = chalk?.gray?.italic
            ? chalk.gray.italic(getTimestamp())
            : getTimestamp();

        const tagStr = chalk?.cyan?.bold
            ? chalk.cyan.bold(`[${tag}]`)
            : `[${tag}]`;

        console.log(`${timestamp} ${tagStr} ${message}`);
    };
};
