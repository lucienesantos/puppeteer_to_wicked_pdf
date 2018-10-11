const { Console } = require('console');
const fs = require('fs');
const fse = require('fs-extra');
const puppeteer = require('puppeteer');
const args = require('minimist')(process.argv.slice(2));

const output = fs.createWriteStream(`${__dirname}/log/stdout.log`);
const errorOutput = fs.createWriteStream(`${__dirname}/log/stderr.log`);
const logger = new Console({ stdout: output, stderr: errorOutput })

if (args.V) {
    console.log("0.0.1");
    return;
}

(async () => {
    logger.log(args);

    try {

        const HTML = args['_'][0];
        const PDF_OUT = args['_'][1];
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const footerTemplate = args['footer-html'];
        const footerContent = footerTemplate ? await fse.readFile(footerTemplate.split('file:///')[1], 'utf8') : '';
        const isLandscape = (args['orientation'] != undefined && args['orientation'] == "Landscape");
        await page.goto(HTML, { waitUntil: 'networkidle2'});
        await page.emulateMedia("screen");

        if (isLandscape ){
            await page.setViewport({ width: 842, height: 595 });
        }

        await page.pdf({
            path: PDF_OUT,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            landscape: isLandscape,
            footerTemplate: footerContent,
            headerTemplate: "<p><p>",
            margin: {
                top: args['margin-top'] || 0,
                right: args['margin-right'] || 0,
                bottom: args['margin-bottom'] || 0,
                left: args['margin-left'] || 0
            }
        });
    await browser.close();

    } catch(e) {
        logger.log(e)
        process.exit(1);
   }

})();