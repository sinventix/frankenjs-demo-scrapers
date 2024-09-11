const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

(async () => {
    await ScrapeData(
        "https://books.toscrape.com/catalogue/category/books_1/index.html", 200
    );
})();

async function ScrapeData(startUrl, rowLimit) {
    console.log(`ScrapeData started for url ${startUrl} with rowLimit ${rowLimit}`);
    let rows = [];
    let hasMoreData = true;
    let currentUrl = startUrl;

    while (hasMoreData) {
        try {
            console.log(`Fetching page: ${currentUrl}`);
            const { data } = await axios.get(currentUrl);
            const $ = cheerio.load(data);
            const scrapedData = [];

            $('article.product_pod').each((_, element) => {
                const detailLink = url.resolve(currentUrl, $(element).find('div.image_container a').attr('href')?.trim() || '');
                const productTitle = $(element).find('h3 a').attr('title')?.trim() || '';
                const productPrice = $(element).find('.product_price .price_color').text().trim() || '';
                const availability = $(element).find('.instock.availability').text().replace(/\n/g, '').trim() || '';
                const starRatingClass = $(element).find('.star-rating').attr('class').split(' ').find(c => c !== 'star-rating')?.trim() || '';
                const productImage = url.resolve(currentUrl, $(element).find('div.image_container a img').attr('src')?.trim() || '');

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

            rows = rows.concat(...scrapedData);
            console.log(`Collecting data... Having ${rows.length} rows.`);

            if (rows.length >= rowLimit) {
                hasMoreData = false;
                break;
            }

            // Find the next page link if available
            const nextPageLink = $('ul.pager li.next a').attr('href');
            if (nextPageLink) {
                currentUrl = url.resolve(currentUrl, nextPageLink);
            } else {
                hasMoreData = false;
            }

        } catch (e) {
            console.error(`Error occurred: ${e.message}`);
            hasMoreData = false;
        }
    }

    console.log(`Finished collecting data. Total row count is ${rows.length}.`);
    rows = rows.slice(0, rowLimit);

    console.log(rows);
    return rows;
}
