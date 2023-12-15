const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require("puppeteer")

const app = express();


app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Puppet is running..');
});


let page; // To store the Puppeteer page instance globally

app.post('/declaration', async (req, res) => {
    try {
        // Extract additional inputs from the request body
        
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
            ],
        });
        page = await browser.newPage();
        
        
        // Fixed URL
        const fixedUrl = 'https://uygulama.gtb.gov.tr/BeyannameSorgulama/';
        page.goto(fixedUrl, { waitUntil: 'networkidle2' });

        // Set the values in the input fields
        
        // Wait for the image to load (you might need to adjust the selector)
        await page.waitForSelector('#imgGuvenlik');

        // Get the bounding box of the element
        const elementHandle = await page.$('#imgGuvenlik');
        const boundingBox = await elementHandle.boundingBox();

        // Take a screenshot of the element
        const screenshotBuffer = await page.screenshot({
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
            },
        });

        // Convert the binary data to Base64
        const base64Data = screenshotBuffer.toString('base64');

        // Send the initial response with the Base64 data
        res.status(200).json(base64Data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/feedback', async (req, res) => {
    //22160100EX00086241
    try {
    
        // Extract feedback data from the request body
        const verificationCode = req.body.verificationCode;
        const declarationNo = req.body.declarationNo;
        console.log(verificationCode,declarationNo)

        // Perform actions based on feedback (e.g., click a button on the page)
        await page.$eval('input[name=txtBeyannameNo]', (el, declarationNoValue) => {
            el.value = declarationNoValue;
        }, declarationNo);
        await page.$eval('input[name=txtDogrulamaKodu]', (el, verificationCodeValue) => {
            el.value = verificationCodeValue;
        }, verificationCode);

        await page.click('input[name=btnSorgula]');
        await page.waitForSelector('#lblBeyannameDurum');
        await page.waitForSelector('#LabelDurum');
        const text = await page.evaluate(() => {
            const anchor = document.querySelector('#lblBeyannameDurum');
            return anchor.textContent;
        });
        const statuetext = await page.evaluate(() => {
            const anchor = document.querySelector('#LabelDurum');
            return anchor.textContent;
        });
        
        
        await page.close();
        
        // Send a response acknowledging the feedback
        res.status(200).json({text,statuetext});
    } catch (err) {
        console.error(err);
        res.status(500).json('Hata');
    }
});
app.post('/currget', async (req, res) => {
    //22160100EX00086241
    console.log("req başladı")
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
            ],
        });

        const curr = await browser.newPage();

        // Extract feedback data from the request body
        const date = req.body.date;
     
        // Perform actions based on feedback (e.g., click a button on the page)
     
        var currencyUSDtext;
        var currencyEURtext;
        const fixedcurrUrl = 'https://www.altinkaynak.com/Doviz/Kur';

    
            // Fixed URL
                curr.goto(fixedcurrUrl, { waitUntil: 'networkidle2' });
                await curr.waitForSelector('#cphMain_cphSubContent_dateInput');
                await curr.waitForSelector('#cphMain_cphSubContent_btnSearch');
                await curr.$eval('input[id=cphMain_cphSubContent_dateInput]', (el, dateStr) => {
                    el.value = dateStr;
                },date);
                await curr.click('input[id=cphMain_cphSubContent_btnSearch]');
                await curr.waitForSelector('#trUSD');
                await curr.waitForSelector('#trEUR');

        const currencyUSD = await curr.evaluate(() => {
            const anchorBuy = document.querySelector('#tdUSDBuy');
            return anchorBuy.textContent;
        });
        const currencyEUR = await curr.evaluate(() => {
            const anchorBuy = document.querySelector('#tdEURBuy');
            return anchorBuy.textContent;
        });
        
        currencyUSDtext=currencyUSD;
        currencyEURtext=currencyEUR;
        await curr.close();

        // Send a response acknowledging the feedback
        res.status(200).json({currencyUSDtext,currencyEURtext});
    } catch (err) {
        console.error(err);
        res.status(500).json('Hata');
    }
});


app.listen(process.env.PORT || 5002 ,()=>{
    console.log("puppeteer running !")
});
