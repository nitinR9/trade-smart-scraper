const mongoose = require('mongoose') ;

const CompanyStockSchema = mongoose.Schema({
    name: String,
    symbol: String,
    YFSymbol: String,
    price: Number,
    prevClose: Number,
    difference: Number,
    percentage: Number,
    negative: Boolean
}) ;

module.exports.CompanyStockModel = mongoose.model('company-stocks', CompanyStockSchema) ;