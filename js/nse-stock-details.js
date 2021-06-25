const puppeteer = require('puppeteer-extra').default ;
const stealth = require('puppeteer-extra-plugin-stealth')() ;
const companies = require('../json/new-companies.json') ;
const { getDevLogger } = require('../utils/loggers') ;
const { USER_AGENT } = require('../utils/static-data') ;
const { getQuarterArrays } = require('../utils/functions') ;
const cheerio = require('cheerio') ;

const final = getQuarterArrays(companies) ;

const logger = getDevLogger('stock') ;

async function getOne(browser, company){
    let page ;
    try{
        // console.time('func') ;

        page = await browser.newPage() ;
        await page.setUserAgent(USER_AGENT) ;
        page.setRequestInterception(true) ;
        await page.setJavaScriptEnabled(false) ;
        page.on('request', (req) => {
            if ( req.resourceType() === 'font' || req.resourceType() === 'stylesheet' || req.resourceType() === 'image'){
                req.abort() ;
            }
            else{
                req.continue() ;
            }
        }) ;

        await page.goto(`https://in.finance.yahoo.com/quote/${company.YFSymbol}`, {
            waitUntil: 'domcontentloaded'
        }) ;

        const html = await page.content() ;

        const $ = cheerio.load(html) ;

        // const price = $('span#lastPrice').text().replace(',', '').trim() ;
        // const diff = $('span#change').text().replace(',', '').replace('-', '').trim() ;
        // const perc = $('a#pChange').text().replace(',', '').replace('-', '').replace('%', '').trim() ;

        const price = $('span.Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text().trim().replace(',', '') ;
        const res = $('span.Trsdu\\(0\\.3s\\).Fw\\(500\\)').text().split(' ') ;
        const diff = res[0].trim().replace(',', '').replace('-', '').replace('+', '') ;
        const perc = res[1].trim().replace('(', '').replace(')', '').replace('-', '').replace('+', '').replace('%', '').replace(',', '') ;

        // console.timeEnd('func')
    }
    catch(err){
        logger.error(err.stack) ;
    }
    finally{
        await page.close() ;
    }
}


(async () => {
    puppeteer.use(stealth) ;
    const browser1 = await puppeteer.launch({
        headless: true
    }) ;
    const browser2 = await puppeteer.launch({
        headless: true
    }) ;
    const browser3 = await puppeteer.launch({
        headless: true
    }) ;
    const browser4 = await puppeteer.launch({
        headless: true
    }) ;
    console.time('func') ;
    for(let company of final.companies1){
        await getOne(browser1, company) ;
    }
    await browser1.close() ;
    for(let company of final.companies2){
        await getOne(browser2, company) ;
    }
    await browser2.close() ;
    for(let company of final.companies3){
        await getOne(browser3, company) ;
    }
    await browser3.close() ;
    for(let company of final.companies4){
        await getOne(browser4, company) ;
    }
    await browser4.close() ;
    console.timeEnd('func') ;
})() ;