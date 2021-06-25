// THIS SCRIPT WILL SCRAPE LIVE DATA FOR METRICS INDICES

const puppeteer = require('puppeteer-extra') ;
const stealth = require('puppeteer-extra-plugin-stealth')() ;
const { BSE_URL, NSE_URL, USER_AGENT, NEW_BSE_URL } = require('../utils/static-data') ;
const { LiveMetricModel } = require('../models/MetricModel') ;
const { getInitLiveMetricData, getNewLiveMetricData } = require('../utils/functions') ;

(async () => {
    puppeteer.use(stealth) ;
})() ;

module.exports.runInitLiveMetricScraper = async (timeString, logger) => {
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

        const data = getInitLiveMetricData(nseHTML, bseHTML, timeString) ;
        
        await LiveMetricModel.insertMany(data) ;
        
        logger.info('Initialized Live Metrics') ;
    }
    catch(err){
        logger.error(err.stack);
        await browser.close() ;
    }
    finally{
        await browser.close() ;
    }

}

module.exports.runAddLiveMetricScraper = async (timeString, logger) => {
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

        const data = getNewLiveMetricData(nseHTML, bseHTML, timeString) ;

        await Promise.all(
            data.map( liveData => {
                return LiveMetricModel.updateOne({
                    name: liveData.name
                }, {
                    "$addToSet": {
                        data: liveData.dataObject
                    }
                }) ;
            })
        )

        logger.info('Updated Live Metrics') ;
    }
    catch(err){
        logger.error(err.stack);
    }
    finally{
        await browser.close() ;
    }

}