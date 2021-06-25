// THIS SCRIPT WILL SCRAPE DATA FOR METRICS INDICES

const puppeteer = require('puppeteer-extra').default ;
const stealth = require('puppeteer-extra-plugin-stealth')() ;
const adblock = require('puppeteer-extra-plugin-adblocker')() ;
const { BSE_URL, NSE_URL, USER_AGENT, NEW_BSE_URL } = require('../utils/static-data') ;
const { getStaticMetricData } = require('../utils/functions') ;
const { StaticMetricModel } = require('../models/MetricModel') ;

// puppeteer.use(stealth) ;
// puppeteer.use(adblock) ;

module.exports.runInitStaticMetricScraper = async function(logger){
    let browser ;
    try{
        browser = await puppeteer.launch({
            headless: true
        }) ;

        // opening pages and setting their user agent
        const nse = await browser.newPage() ;
        await nse.setUserAgent(USER_AGENT) ;

        const bse = await browser.newPage() ;
        await bse.setUserAgent(USER_AGENT) ;
        bse.setRequestInterception(true) ;
        await bse.setJavaScriptEnabled(false) ;
        bse.on('request', (req) => {
            if ( req.resourceType() === 'font' || req.resourceType() === 'stylesheet' || req.resourceType() === 'image'){
                req.abort() ;
            }
            else{
                req.continue() ;
            }
        }) ;

        // loadup webpage that are being scraped
        await nse.goto(NSE_URL, {
            waitUntil: 'domcontentloaded',
        }) ;
        await bse.goto(NEW_BSE_URL, {
            waitUntil: 'domcontentloaded'
        }) ;

        // get their html
        const nseHTML = await nse.content() ;
        const bseHTML = await bse.content() ;

        // fetch scraped data
        const data = getStaticMetricData(nseHTML, bseHTML) ;

        // saving initial data to collection naming static-metrics

        await StaticMetricModel.insertMany(data) ;
                
        logger.info('Initialized Static Metrics') ;
    }
    catch(err){
        logger.error(err.stack);
    }
    finally{
        await browser.close() ;
    }
}

module.exports.runAddStaticMetricScraper = async function(logger){    
    let browser ;
    try{
        browser = await puppeteer.launch({
            headless: true
        }) ;

        // opening pages and setting their user agent
        const nse = await browser.newPage() ;
        await nse.setUserAgent(USER_AGENT) ;

        const bse = await browser.newPage() ;
        await bse.setUserAgent(USER_AGENT) ;
        bse.setRequestInterception(true) ;
        await bse.setJavaScriptEnabled(false) ;
        bse.on('request', (req) => {
            if ( req.resourceType() === 'font' || req.resourceType() === 'stylesheet' || req.resourceType() === 'image'){
                req.abort() ;
            }
            else{
                req.continue() ;
            }
        }) ;

        // loadup webpage that are being scraped
        await nse.goto(NSE_URL, {
            waitUntil: 'domcontentloaded',
        }) ;
        await bse.goto(NEW_BSE_URL, {
            waitUntil: 'domcontentloaded',
        }) ;

        // get their html
        const nseHTML = await nse.content() ;
        const bseHTML = await bse.content() ;

        // fetch scraped data
        const data = getStaticMetricData(nseHTML, bseHTML) ;

        // updating data to collection naming static-metrics
        await Promise.all(
            data.map(metric => {
                return StaticMetricModel.updateOne({
                    "name": metric.name
                }, {
                    "$set": metric
                })
            })
        ) ;
        
        logger.info('Updated Static Metrics') ;
    }
    catch(err){
        logger.error(err.stack);
    }
    finally{
        await browser.close() ;
    }
}