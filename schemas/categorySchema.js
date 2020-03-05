const EntitySchema = require('typeorm').EntitySchema;
const Category = require('../models/category').Category;

module.exports = new EntitySchema({
    name: 'category',
    target:Category,
    columns: {
        id: {
            primary: true,
            type: 'bigint',
            generated: true
        },
        legendId: {
            type: 'bigint',
            nullable: false,
        },
        name: {
            type: 'varchar',
            length: 10,
            nullable: false,
        }
    }
})
