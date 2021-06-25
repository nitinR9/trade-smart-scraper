const puppeteer = require('puppeteer-extra').default ;
const stealth = require('puppeteer-extra-plugin-stealth')() ;
const companies = require('../json/new-companies.json') ;
const { getQuarterArrays, makeStockRequests } = require('../utils/functions') ;
const { CompanyStockModel } = require('../models/CompanyModel') ;
const newArray = getQuarterArrays(companies) ;

module.exports.getSmallStockDetails = async (logger) => {
    let browser = [];
    
    try{
        console.time('browser launch')
        const browser1 = await puppeteer.launch({
            headless: true,
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

        console.timeEnd('browser launch') ;

        browser.push(browser1,browser2, browser3, browser4) ;

        const count = await CompanyStockModel.estimatedDocumentCount() ;
        
        console.time('Main') ;
        
        const data1 = await makeStockRequests(browser1, newArray.companies1, logger) ;
        const data2 = await makeStockRequests(browser2, newArray.companies2, logger) ;
        const data3 = await makeStockRequests(browser3, newArray.companies3, logger) ;
        const data4 = await makeStockRequests(browser4, newArray.companies4, logger) ;

        console.timeEnd('Main') ;

        const final_data = data1.concat(data2, data3, data4) ;

        if (count){
            for(let doc of final_data){
                if (doc.price !== null){
                    await CompanyStockModel.updateOne({
                        symbol: doc.symbol,
                        name: doc.name
                    }, {
                        $set: {
                            price: doc.price,
                            prevClose: doc.prevClose,
                            difference: doc.difference,
                            percentage: doc.percentage,
                            negative: doc.negative    
                        }
                    }) ;
                }
            }
        }
        else{
            await CompanyStockModel.insertMany(final_data) ;
        }
    }
    catch(err){
        logger.error(err.stack) ;   
    }
    finally{
        for(let b of browser){
            await b.close() ;
        }
    }
}