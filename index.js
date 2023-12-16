const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require("puppeteer")
var convert = require('xml-js');
const axios = require('axios');

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
        await page.waitForSelector('#txtBeyannameNo');
        await page.waitForSelector('#txtDogrulamaKodu');
        
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

const getCurrency=async(d,m,y)=>{

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.tcmb.gov.tr/kurlar/${y}${m}/${d}${m}${y}.xml`,
        headers: { 
            "Accept": "application/json",
                "Accept-Encoding": "gzip, compress, deflate, br"
        },
        withCredentials: false,
      };
    try {
        const response=await axios(config)
        const xmlData = response.data;

        // Convert XML to JSON
        const jsonData = convert.xml2json(xmlData, { compact: true, spaces: 4 });

        return JSON.parse(jsonData);
        
        
    }catch (error) {
        return error
    }     
      
}
app.post('/currs', async (req, res) => {
    const d = req.body.d;
    const m = req.body.m; // Use req.body.m for month
    const y = req.body.y; // Use req.body.y for year
  
    try {
      const result = await getCurrency(d, m, y);
  
      res.status(200).json({ result });
      console.log({ result });
    } catch (error) {
      console.error('Error in /money endpoint:', error);
      if (error.response && error.response.status === 404) {
        res
          .status(404)
          .json({
            errText:
              'Resmi tatil, hafta sonu ve yarım iş günü çalısılan günlerde gösterge niteliginde kur bilgisi yayımlanmamaktadır.',
          });
      } else {
        res.status(500).json({ error: 'TCMB API error' });
      }
    }
  });



app.listen(process.env.PORT || 5002 ,()=>{
    console.log("puppeteer running !")
});
