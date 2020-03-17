var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');

router.get('/', function(req, res, next) {
    const connection = getConnection();
    const repository = connection.getRepository(Laptop.options.name);
    repository.find().then((result) => {
        res.status(200).json(result);
    });
});

router.post('/', function(req, res, next) {
    const newLaptop = req.body;
    const connection = getConnection();
    const repository = connection.getRepository(Laptop,options.name);
    repository.save({
        laptopName: newLaptop.name,
    });
    res.status(201).json();
});

module.exports = router;