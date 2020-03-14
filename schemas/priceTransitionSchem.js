const EntitySchema = require('typeorm').EntitySchema;
const PriceTransition = require('../models/priceTransition').PriceTransition;

module.exports = new EntitySchema({
    name: 'PriceTransition',
    target: PriceTransition,
    columns: {
        id: {
            primary: true,
            type: 'bigint',
            generated: true
        },
        laptopId: {
            type: 'bigint',
            nullabel: false
        },
        date: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
            nullabel: false
        },
        price: {
            type: 'varchar',
            length: 50,
            nullabel: false
        },
        cash: {
            type: 'varchar',
            length: 50,
            nullabel: true
        },
        websiteAddress: {
            type: 'varchar',
            length: 2000,
            nullabel: false
        },
        websiteAddressCash: {
            type: 'varchar',
            length: 2000,
            nullabel: true
        },
    }
})