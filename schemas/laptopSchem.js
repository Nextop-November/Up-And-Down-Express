const EntitySchema = require('typeorm').EntitySchema;
const Laptop = require('../models/laptop').Laptop;

module.exports = new EntitySchema({
    name: 'laptop',
    target: Laptop,
    columns: {
        id: {
            primary: true,
            type: 'bigint',
            generated: true
        },
        name: {
            type: 'varchar',
            length: 15,
            nullable: false
        },
        manufact: {
            type: 'varchar',
            length: 10,
            nullable: false
        },
        cpu: {
            type: 'varchar',
            length: 15,
            nullable: false
        },
        hdd: {
            type: 'varchar',
            length: 10,
            nullable: true
        },
        ssd: {
            type: 'varchar',
            length: 10,
            nullable: true
        },
        resolution: {
            type: 'varchar',
            length: 15,
            nullable: false
        },
        ram: {
            type: 'varchar',
            length: 10,
            nullable: false
        },
        gpu: {
            type: 'varchar',
            length: 20,
            nullable: true
        },
        weight: {
            type: 'varchar',
            length: 10,
            nullable: false
        },
    }
})

//MySQL 테스트케이스 쿼리
/*
USE nextop;
INSERT INTO laptop 
(name,manufact,cpu,hdd,ssd,resolution,ram,gpu,weight) VALUES
("","","","","","","","","");
*/