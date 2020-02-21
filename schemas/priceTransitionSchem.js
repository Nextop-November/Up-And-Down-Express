const EntitySchema = require('typeorm').EntitySchema;
const PriceTransition = require('../models/priceTransition').PriceTransition;

module.exports = new EntitySchema({
    name: 'priceTransition',
    target:PriceTransition,
    columns: {
        id: {
            primary: true,
            type: 'bigint',
            generated: true
        },
        date: {
            type: 'date',
            nullable: false
        },
        price: {
            type: 'bigint',
            nullable: false
        },
        laptop_id: {
            type: 'bigint',
            nullable: false
        },
    }
})
