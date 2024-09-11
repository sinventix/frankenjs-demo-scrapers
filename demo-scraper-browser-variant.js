const puppeteerExtra = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");

(async () => {
    await ScrapeData(
        "https://books.toscrape.com/catalogue/category/books_1/index.html", 200
    );
})();

async function ScrapeData(url, rowLimit) {
    console.log(`ScrapeData started for url ${url} with rowLimit ${rowLimit}`);
    puppeteerExtra.use(pluginStealth());
    const browser = await puppeteerExtra.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: .5
    });
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36");
    console.log(`Navigating to entry point ${url}`);
    await Promise.all([page.goto(url), page.waitForNavigation()]);
    console.log(`Page load complete`);
    await sleep(2000);

    let rows = [];
    let hasMoreData = true;
    while (hasMoreData) {
        try {
            const data = await page.evaluate(() => {
                const items = document.querySelectorAll('article.product_pod');
                const scrapedData = [];
                items.forEach(item => {
                    const detailLink = item.querySelector('div.image_container a')?.getAttribute('href')?.trim() || '';
                    const productTitle = item.querySelector('h3 a')?.getAttribute('title')?.trim() || '';
                    const productPrice = item.querySelector('.product_price .price_color')?.textContent.trim() || '';
                    const availability = item.querySelector('.instock.availability')?.textContent.trim().replace(/\n/g, '').trim() || '';
                    const starRatingClass = item.querySelector('.star-rating')?.classList.value.split(' ').find(c => c !== 'star-rating')?.trim() || '';
                    const productImage = item.querySelector('div.image_container a img')?.getAttribute('src')?.trim() || '';
                    function starRatingConversion(starRatingClass) {
                        const ratingMap = {
                            'One': 1,
                            'Two': 2,
                            'Three': 3,
                            'Four': 4,
                            'Five': 5
                        };
                        return ratingMap[starRatingClass] || 0;
                    }
                    scrapedData.push({
                        detailLink,
                        productTitle,
                        productPrice,
                        availability,
                        starRating: starRatingConversion(starRatingClass), // Convert class to human-readable format
                        productImage
                    });
                });
                return scrapedData;
            });
            rows = rows.concat(...data);
            console.log(`Collecting data... Having ${rows.length} rows.`);

            if (rows.length >= rowLimit) {
                hasMoreData = false;
                break;
            }

            await sleep(1000);
            try {
                await page.evaluate(() => {
                    const scrollPosition = document?.body?.scrollHeight ?? window?.innerHeight ?? 100000
                    window.scrollTo(0, scrollPosition);
                });
            } catch (e) { }

            const nextPageElem = await page.$("ul.pager li.next a");
            if (nextPageElem) {
                await nextPageElem.click();
                await waitForNetworkIdle(page, 2000);
            } else {
                hasMoreData = false;
            }

        } catch (e) {
            hasMoreData = false;
        }
    }

    console.log(`Finished collecting data. Total row count is ${rows.length}.`);

    await page.close();
    rows = rows.slice(0, rowLimit);

    await browser.close();
    return rows;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function waitForNetworkIdle(page, timeout = 5000) {
    const ongoingRequests = new Set();
    let fulfill;
    let maxTimeouts = 0;
    const timeoutId = setTimeout(() => {
        page.off("request", onRequestStarted);
        page.off("response", onRequestFinished);
        page.off("requestfailed", onRequestFinished);
        fulfill();
    }, timeout);

    const onRequestStarted = (request) => {
        ongoingRequests.add(request.url());
    };

    const onRequestFinished = (response) => {
        ongoingRequests.delete(response.url());
        if (ongoingRequests.size === 0 && maxTimeouts > 3) {
            clearTimeout(timeoutId);
            page.off("request", onRequestStarted);
            page.off("response", onRequestFinished);
            page.off("requestfailed", onRequestFinished);
            fulfill();
        }
    };

    page.on("request", onRequestStarted);
    page.on("response", onRequestFinished);
    page.on("requestfailed", onRequestFinished);

    return new Promise((resolve) => {
        setInterval(() => {
            if (ongoingRequests.size === 0) {
                maxTimeouts++;
            }
        }, 100);

        fulfill = resolve;
    });
};