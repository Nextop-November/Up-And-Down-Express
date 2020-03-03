const EntitySchema = reqire('typerom').EntitySchema;
const PriceTransition = reqire('../models/priceTransition').PriceTransition;

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
            type: 'date',
            nullabel: false
        },
        price: {
            type: 'bigint',
            nullabel: false
        },
        cash: {
            type: 'bigint',
            nullabel: false
        },
        websiteAddress: {
            type: 'varchar',
            length: 2000,
            nullabel: false
        }
    }
})