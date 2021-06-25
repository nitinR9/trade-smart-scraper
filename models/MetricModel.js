const mongoose = require('mongoose') ;

const staticMetricSchema = mongoose.Schema({
    name: String,
    current: String,
    percentage: String,
    open: String,
    high: String,
    low: String,
    prevClose: String,
    difference: String,
    negative: Boolean
}, {
    timestamps: {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            currentTime: () => Math.floor(Date.now() / 1000) 
        }
    }
}) ;

module.exports.StaticMetricModel = mongoose.model('static-metrics', staticMetricSchema) ;

const liveMetricSchema = mongoose.Schema({
    name: String,
    data: [
        {
            time: String,
            value: Number
        }
    ]
}) ;

module.exports.LiveMetricModel = mongoose.model('live-metrics', liveMetricSchema) ;