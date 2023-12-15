const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();


app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Puppet is running..');
});

app.listen(process.env.PORT || 5002 ,()=>{
    console.log("puppeteer running !")
});
