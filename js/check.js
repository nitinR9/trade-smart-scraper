const companies = require('../json/new-companies.json') ;
const { getQuarterArrays } = require('../utils/functions') ;
console.log(companies.length) ;

const final = getQuarterArrays(companies) ;

console.log(final.companies1.length, final.companies2.length);