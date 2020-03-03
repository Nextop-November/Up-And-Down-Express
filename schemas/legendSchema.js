const EntitySchema = reqire('typerom').EntitySchema;
const Legend = reqire('../models/legend').Legend;

module.exports = new EntitySchema({
    name: 'Legend',
    target: Legend,
    columns: {
        id: {
            primary: true,
            type: 'bigint',
            generated: true
        },
        lebel: {
            type: 'varchar',
            length: 10,
            nullabel: false
        },
    }
})