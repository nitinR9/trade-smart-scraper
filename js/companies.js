// import fs from 'fs' ;
const fs = require('fs') ;

const data = fs.readFileSync('companies.json', 'utf-8') ;

const companies = JSON.parse(data) ;

const final = companies.map( company => {
    return {
        name: company['Company Name'],
        symbol: company['Symbol'],
        YFSymbol: `${company['Symbol']}.NS`
    }
}) ;

fs.writeFileSync('new-companies.json', JSON.stringify(final)) ;