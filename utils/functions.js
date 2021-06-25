const cheerio = require('cheerio') ;
const { NSE_ROWS, USER_AGENT } = require('../utils/static-data') ;

// nse text function
function NSE(selector, $, returnTextOnly = true, filterNegative = false){
    if (returnTextOnly){
        return $(selector).text().trim() ;
    }
    else if (filterNegative){
        return $(selector).text().trim().replace('-', '').replace(',', '') ;
    }
    else{
        return $(selector).text().trim().replace(',', '') ;
    }
}

// function to get css selector for scraped data
function getSelector(row, column){
    return `#liveIndexWatch > tbody > tr:nth-child(${row}) > td:nth-child(${column})`
}

// function to get static metric data
module.exports.getStaticMetricData = (nse, bse) => {
    const $nse = cheerio.load(nse) ;
    const $bse = cheerio.load(bse) ;
    
    const final_data = [] ;
    
    for( let row of NSE_ROWS ){
        const nseObject = {
            name: NSE(getSelector(row, 1), $nse),
            current: NSE(getSelector(row, 2), $nse, false),
            percentage: NSE(getSelector(row, 3), $nse, false, true),
            open: NSE(getSelector(row, 4), $nse, false),
            high: NSE(getSelector(row, 5), $nse, false),
            low: NSE(getSelector(row, 6), $nse, false),
            prevClose: NSE(getSelector(row, 7), $nse, false),
            difference: Math.abs(parseFloat(NSE(getSelector(row, 7), $nse, false)) - parseFloat(NSE(getSelector(row, 2), $nse, false))).toFixed(2),
            negative: NSE(getSelector(row, 3), $nse, true).includes('-') ? true : false
        } ;
        
        final_data.push(nseObject) ;
    }
    
    const diffAndPercText = $bse('span.Trsdu\\(0\\.3s\\).Fw\\(500\\)').text().split(' ') ;
    const prev = $bse('table > tbody > tr:nth-child(2) > td:nth-child(5) > span').text().replace(',', '').trim() ;
    
    const bseObject = {
        name: 'BSE SENSEX',
        current: $bse('span.Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text().replace(',','').trim(),
        difference: diffAndPercText[0].replace(',', '').replace('-', '').replace('+', '').trim(),
        percentage: diffAndPercText[1].replace(',', '').replace('-', '').replace('+', '').replace('(', '').replace(')', '').replace('%', '').trim(),
        prevClose: prev,
        open: $bse('table > tbody > tr:nth-child(1) > td:nth-child(2) > span').text().replace(',', '').trim(),
        high: $bse('table > tbody > tr:nth-child(1) > td:nth-child(3) > span').text().replace(',', '').trim(),
        low: $bse('table > tbody > tr:nth-child(1) > td:nth-child(4) > span').text().replace(',', '').trim(),
        negative: diffAndPercText[1].includes('-') ? true : false
    }
    
    console.log(bseObject);
    
    final_data.unshift(bseObject) ;
    
    return final_data ;
}

// function to get data for initializing the collection
module.exports.getInitLiveMetricData = (nse, bse, timeString) => {
    const $nse = cheerio.load(nse) ;
    const $bse = cheerio.load(bse) ;
    
    const final_data = [] ;
    
    for(let row of NSE_ROWS){
        const nseObject = {
            name: NSE(getSelector(row, 1), $nse),
            data: [
                {
                    time: timeString,
                    value: NSE(getSelector(row, 2), $nse, false)
                }
            ]
        } ;
        
        final_data.push(nseObject) ;
    }
    
    const bseObject = {
        name: 'BSE SENSEX',
        data: [
            {
                time: timeString,
                value: $bse('span.Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text().replace(',','').trim()
            }
        ]
    } ;
    
    final_data.unshift(bseObject) ;
    
    return final_data ;
}


// function to get the new data and adding it to existing data in collection
module.exports.getNewLiveMetricData = (nse, bse, timeString) => {
    const $nse = cheerio.load(nse) ;
    const $bse = cheerio.load(bse) ;
    
    const final_data = [] ;
    
    for(let row of NSE_ROWS){
        const nseObject = {
            name: NSE(getSelector(row, 1), $nse),
            dataObject: {
                time: timeString,
                value: NSE(getSelector(row, 2), $nse, false)
            }
        } ;
        
        final_data.push(nseObject) ;
    }
    
    const bseObject = {
        name: 'BSE SENSEX',
        dataObject:{
            time: timeString,
            value: $bse('span.Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text().replace(',','').trim()
        }
    } ;
    
    final_data.unshift(bseObject) ;
    
    return final_data ;
}

module.exports.getQuarterArrays = (array) => {
    const final_array = {
        companies1: [],
        companies2: [],
        companies3: [],
        companies4: []
    }
    
    for(let index=0; index < array.length; index++){
        if (index < 50){
            final_array.companies1.push(array[index]) ;
        }
        else if (index >= 50 && index< 100){
            final_array.companies2.push(array[index]) ;
        }
        else if (index >= 100 && index < 150){
            final_array.companies3.push(array[index]) ;
        }
        else{
            final_array.companies4.push(array[index]) ;
        }
    }
    
    return final_array ;
} ;

module.exports.makeStockRequests = async (browser, companies, logger) => {
    let page, result = [];
    for (let company of companies){
        let stock = {
            name: company.name,
            symbol: company.symbol,
            YFSymbol: company.YFSymbol,
            price: null,
            prevClose: null,
            difference: null,
            percentage: null,
            negative: false
        }
        // trying to get info about every stock details on google
        try{
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

            const priceNum = $('span.Trsdu\\(0\\.3s\\).Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)').text().trim().replace(',', '') ;
            const res = $('span.Trsdu\\(0\\.3s\\).Fw\\(500\\)').text().split(' ') ;
            const diffNum = res[0].trim().replace(',', '').replace('-', '').replace('+', '') ;

            const percNum = res[1].trim().replace('(', '').replace(')', '').replace('-', '').replace('+', '').replace('%', '').replace(',', '') ;

            const prevClose = $('#quote-summary > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > span').text().trim().replace(',', '') ;

            stock = {
                ...stock,
                price: priceNum,
                prevClose: prevClose,
                difference: diffNum,
                percentage: percNum,
                negative: res[0].includes('-') ? true : false
            } ;

            result.push(stock) ;
        }
        catch(err){
            logger.error(company.symbol) ;
            logger.error(err.stack) ;
            result.push(stock) ;
        }
        finally{
            await page.close() ;
        }
    }

    logger.info('DONE MAKE REQUEST') ;

    return result ;
}