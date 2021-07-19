const schedule = require('node-schedule') ;
const moment = require('moment') ;
const mongoose = require('mongoose') ;
const { getDevLogger, getProdLogger } = require('./utils/loggers') ;
const { runInitLiveMetricScraper, runAddLiveMetricScraper } = require('./js/live-metrics') ;
const { runInitStaticMetricScraper, runAddStaticMetricScraper } = require('./js/static-metrics') ;
const { getSmallStockDetails } = require('./js/stock-detail') ;
const { DB_URL } = require('./utils/static-data') ;

let liveLogger, staticLogger, stockLogger ;
let liveInit = true, staticInit = true, stockInit=true ;

const startTime = moment('09:10', 'HH:mm').toDate() ;
const endTime = moment('15:30', 'HH:mm').toDate() ;

if (process.env.NODE_ENV === 'development'){
    liveLogger = getDevLogger('live') ;
    staticLogger = getDevLogger('static') ;
    stockLogger = getDevLogger('stock') ;
}
else{
    liveLogger = getProdLogger('live', 'live-indices') ;
    staticLogger = getProdLogger('static', 'static-indices') ;
    stockLogger = getProdLogger('stock', 'stock-detail') ;
}

(async () => {
    await mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }) ;
})() ;

schedule.scheduleJob({
    start: startTime,
    end: endTime,
    rule: '*/5 * * * 1-5'
}, async () => {
    const time = moment().format('HH:mm').toString() ;
    if (liveInit){
        await runInitLiveMetricScraper(time, liveLogger) ;
        liveInit = false ;
    }
    else{
        await runAddLiveMetricScraper(time, liveLogger) ;
    }
}) ;

schedule.scheduleJob({
    start: startTime,
    end: endTime,
    rule: '*/10 * * * 1-5',
}, async () => {
    if (staticInit){
        await runInitStaticMetricScraper(staticLogger) ;
        staticInit = false ;
    }
    else{
        await runAddStaticMetricScraper(staticLogger) ;
    }
}) ;

schedule.scheduleJob({
    start: startTime,
    end: endTime,
    rule: '*/8 * * * 1-5',
}, async () => {
    stockLogger.info('now running') ;
    await getSmallStockDetails(stockLogger) ;
}) ;

process.on('SIGINT', async () => {
    console.log('disconnected on ctrl+c');
    await mongoose.disconnect() ;
    process.exit() ;
}) ;

process.on('beforeExit', async () => {
    console.log('before exiting the app on time end') ;
    await mongoose.disconnect() ;
}) ;