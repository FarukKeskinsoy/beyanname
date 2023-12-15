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
            args: ['--no-sandbox'],
        });
        [page] = await browser.pages();
        
        
        // Fixed URL
        const fixedUrl = 'https://uygulama.gtb.gov.tr/BeyannameSorgulama/';
        await page.goto(fixedUrl, { waitUntil: 'networkidle0' });

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
    console.log("req başladı")
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
        });

        const [curr] = await browser.pages();

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
        var currencyUSDtext;
        var currencyEURtext;
        const dateRegex = /Kapanma Tarihi: (\d{2})\.(\d{2})\.(\d{4})/;
        const match = dateRegex.exec(text);
        if (match && match[1] && match[2] && match[3]) {

            const day = match[1];
            const month = match[2];
            const year = match[3];
            
            // Construct the date string in the "DD/MM/YYYY" format
            const dateString = `${day}/${month}/${year}`;
            const dateObjString = `${month}/${day}/${year}`;
            var date = new Date(dateObjString);
            var yesterday = new Date(dateObjString);
            yesterday.setDate(date.getDate() - 1);

            console.log("Extracted Date:", dateString);
            const fixedcurrUrl = 'https://www.altinkaynak.com/Doviz/Kur';

    
            // Fixed URL
                await curr.goto(fixedcurrUrl, { waitUntil: 'networkidle0' });
                console.log(curr.content())
                await curr.waitForSelector('#cphMain_cphSubContent_dateInput');
                await curr.waitForSelector('#cphMain_cphSubContent_btnSearch');
                await curr.$eval('input[id=cphMain_cphSubContent_dateInput]', (el, dateStr) => {
                    el.value = dateStr;
                },yesterday.toLocaleDateString("tr"));
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

          } else {
            console.log("Date not found in the text.");
          }
        console.log(text);
        console.log("USD",currencyUSDtext);
        console.log("EUR",currencyEURtext);
    
        await page.close();
        await curr.close();

        // Send a response acknowledging the feedback
        res.status(200).json({text,statuetext,currencyUSDtext,currencyEURtext});
    } catch (err) {
        console.error(err);
        res.status(500).json('Hata');
    }
});


app.listen(process.env.PORT || 5002 ,()=>{
    console.log("puppeteer running !")
});
