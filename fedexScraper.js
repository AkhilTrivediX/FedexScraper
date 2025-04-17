import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from 'fs'

//Ye agar code check karna ho tou

puppeteer.use(StealthPlugin())
const ITERATIONS = 100 // Kitni baar try karna hai, ek baar mein 30 tracking check karta hai tou 100 = 100 x 30 = 3000 check karega
const SAVEON = 100 // Kitne iterations pe save karega, taaki beech mein exit kar sako
export default async function fedexScraper(trackingNumber) {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    let result = readJsonFile();
    // console.log('Results:', result.filter(e=>e.receipientPlace.toLowerCase().indexOf('lewisville')!=-1))
    // return;

    for(let i=0;i<-1;i++)
    {
        if(i!=0 && i%SAVEON==0) 
        {   console.log('Writing Data to file')
            fs.writeFileSync('fedex.json', JSON.stringify(result, null, 2));}
        if(i%5==0){const rand = Math.round(Math.random()*3000); console.log('Introducing random timeout of '+rand+' ms'); await new Promise(res=>setTimeout(res, rand));}
        console.log(`ITERATION ${(i+1)}, Total Trackings: ${result.length}`);
        try{
            const randoms = Array(30).fill(-1).map(e=>('2860'+(Math.round(Math.random()*100000000)).toString()))
            const newTracks = await getTracking(page, randoms);
            result = [...result, ...newTracks];
        }
        catch(e){
            console.log('ERROR:',e.message)

        }
    }

    fs.writeFileSync('fedex.json', JSON.stringify(result, null, 2));

}

function chunkArray(array, chunkSize) {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

async function getTracking(page, trackingNumbers){
    await page.goto(`https://www.fedex.com/wtrk/track/?trknbr=${trackingNumbers.join(',')}`, {
        waitUntil: "load",
    });
    console.log('Opened page!')

    await page.locator('.systemErrorMessageTop').wait()

    //await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('Wait finished')
    const trackings = await page.$$('td')
    const inner = await Promise.all(trackings.map(async (el) => await el.evaluate(el => el.innerText)));
    const format = chunkArray(inner, 8).map(chunk=>({
        trackingNumber: chunk[0],
        shipDate: chunk[1],
        shipPlace: chunk[2],
        receipientPlace: chunk[3],
        status: chunk[4],
        deliveryTime: chunk[5],
        scheduledDelivery: chunk[6],
    }))
    console.table(format)
    return format;
}

function readJsonFile() {
    try {
        const data = fs.readFileSync('fedex.json', 'utf8'); // Read file
        return JSON.parse(data); // Parse JSON to object
    } catch (error) {
        return []; // Return empty array if file doesn't exist or is invalid
    }
}

fedexScraper()
