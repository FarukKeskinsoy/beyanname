// app.post('/currget', async (req, res) => {
//     //22160100EX00086241
//     console.log("req başladı")
//     try {
//         const browser = await puppeteer.launch({
//             headless: true,
//             args: [
//                 '--no-sandbox',
//                 '--disable-setuid-sandbox',
//                 '--disable-dev-shm-usage',
//                 '--disable-accelerated-2d-canvas',
//                 '--disable-gpu',
//             ],
//         });

//         const curr = await browser.newPage();

//         // Extract feedback data from the request body
//         const date = req.body.date;
     
//         // Perform actions based on feedback (e.g., click a button on the page)
     
//         var currencyUSDtext;
//         var currencyEURtext;
//         const fixedcurrUrl = 'https://www.altinkaynak.com/Doviz/Kur';

    
//             // Fixed URL
//                 curr.goto(fixedcurrUrl, { waitUntil: 'networkidle2' });
//                 await curr.waitForSelector('#cphMain_cphSubContent_dateInput');
//                 await curr.waitForSelector('#cphMain_cphSubContent_btnSearch');
//                 await curr.$eval('input[id=cphMain_cphSubContent_dateInput]', (el, dateStr) => {
//                     el.value = dateStr;
//                 },date);
//                 await curr.click('input[id=cphMain_cphSubContent_btnSearch]');

//                 await page.$('.table')


//                 const currencyUSD = await curr.evaluate(() => {

//                     const anchorBuy = document.querySelector('#tdUSDBuy');
//                     return anchorBuy?.textContent || "";
//                 });
//                 const currencyEUR = await curr.evaluate(() => {
//                     const anchorBuy = document.querySelector('#tdEURBuy');
//                     return anchorBuy?.textContent || "";
//                 });
        
//                 currencyUSDtext=currencyUSD;
//                 currencyEURtext=currencyEUR;
//                 await curr.close();

//         // Send a response acknowledging the feedback
//         res.status(200).json({currencyUSDtext,currencyEURtext});
//     } catch (err) {
//         console.error(err);
//         res.status(500).json('Hata');
//     }
// });
