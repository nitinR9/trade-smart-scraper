import puppeteer from 'puppeteer' ;
import cheerio from 'cheerio' ;
import { USER_AGENT } from '../utils/static-data.js' ;
import fs from 'fs' ;
import { getProdLogger, getDevLogger } from '../utils/loggers.js' ;

async function checkYahooSearch(yahooSymbol){
    const searchUrl = `https://in.finance.yahoo.com/quote/${yahooSymbol}` ;

    try{

        const browser = await puppeteer.launch({
            headless: true
        }) ;

        const yahooPage = await browser.newPage() ;
        await yahooPage.setUserAgent(USER_AGENT) ;

        await yahooPage.goto(searchUrl, {
            waitUntil: 'domcontentloaded'
        }) ;

        const html = await yahooPage.content() ;

        const $ = cheerio.load(html) ;

        const heading = $('h1.D\\(ib\\)').text() ;

        
        await browser.close() ;
                
        if (heading === ''){
            return false ;
        }
        else{
            return true ;
        }
    }
    catch(err){
        console.error(err);
        return false ;
    }
}

// checkYahooSearch('TATAMOTORS.N')

(async () => {
    console.time('searching yahoo finance') ;

    const prodLogger = getProdLogger('Check Yahoo Finance', 'yahoo') ;

    const devLogger = getDevLogger('Check Yahoo Finance') ;


    const companies = fs.readFileSync('companies.json', {
        encoding: 'utf-8'
    }) ;
    
    const searchCompanies = JSON.parse(companies).map( company => {
        return {
            name: company['Company Name'],
            symbol: company['Symbol'],
            yahooSymbol: company['Symbol'] + '.NS',
            found: false
        }
    }) ;

    // const updateCompanies = searchCompanies.map( company => {
    //     const gotCompany = await checkYahooSearch(company.yahooSymbol) ;

    //     if (gotCompany){
    //         company.found = true ;
    //         console.log(`${company.name} - ok`);
    //     }
    //     else{
    //         console.log(`${company.name} - failed`);
    //     }

    //     return company ;
    // })  ;

    for( let company of searchCompanies ){
        const gotCompany = await checkYahooSearch(company.yahooSymbol) ;

        if (gotCompany){
            company.found = true ;
            prodLogger.info(company.name);
            devLogger.info(company.name);
        }
        else{
            prodLogger.error(company.name);
            devLogger.error(company.name);
        }
    }

    console.timeEnd('searching yahoo finance')
})() ;