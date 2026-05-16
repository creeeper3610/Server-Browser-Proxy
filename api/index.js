const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('URL missing');

    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1280, height: 720 },
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        const screenshot = await page.screenshot({ type: 'jpeg', quality: 60 });
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.status(200).send(screenshot);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        if (browser) await browser.close();
    }
};
