const EntitySchema = require('typeorm').EntitySchema;
const Legend = require('../models/legend').Legend;

module.exports = new EntitySchema({
    name: 'Legend',
    target: Legend,
    columns: {
        id: {
            primary: true,
            type: 'bigint',
            generated: true
        },
        label: {
            type: 'varchar',
            length: 20,
            nullabel: false
        },
    }
})