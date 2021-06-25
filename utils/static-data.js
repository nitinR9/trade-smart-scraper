const NSE_URL = 'https://www1.nseindia.com/live_market/dynaContent/live_watch/live_index_watch.htm' ;
const BSE_URL = 'https://www.bseindia.com/sensex/code/16/' ;
const NEW_BSE_URL = 'https://in.finance.yahoo.com/quote/%5EBSESN/history?p=%5EBSESN' ;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36' ;
const NSE_ROWS = [ 3, 5, 17, 18, 21, 24 ] ;
const DB_URL = 'mongodb://localhost:27017/trade-smart' ;

module.exports = {
    NSE_URL,
    BSE_URL,
    USER_AGENT,
    NSE_ROWS,
    DB_URL,
    NEW_BSE_URL
} ;