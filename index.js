import express from 'express'
const app = express();
import path from 'path'
import bodyParser from 'body-parser';
import fedexScraper from './fedexScraper.js'

app.use(express.static('public'));

const urlencodedParser = bodyParser.urlencoded({extended: false})

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, "check.html"));
})


app.get('/fedex', function(req, res){
    fedexScraper('286007982294').then(()=>
        res.end('Data scraped from BBD!!! DK'));
})

const server = app.listen(5000, function(){
    console.log('Successfully started server at http://localhost:5000');
})
