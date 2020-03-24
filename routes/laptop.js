var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');

const PriceTransition = require('../models/priceTransition').PriceTransition;
const LaptopDB = require('../models/laptop').Laptop;

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

router.get('/price', function(req, res, next) {
    const lapId = parseInt(req.query.id);
    getPriceTrans(lapId);

    res.status(200).json("LaptopID : " + lapId);
});
//http://localhost:3000/laptops/price?id=12

router.get('/search', function(req, res, next) {
    const subStr = req.query.name;
    searchLaptop(subStr);

    res.status(200).json("Search name : " + subStr);
});
//http://localhost:3000/laptops/search?name=LG전자

async function searchLaptop(str){
    //.andWhere()
    let laptopInfo = await getConnection()
    .getRepository(LaptopDB)
    .createQueryBuilder("laptop")
    .where("laptop.name like :tmp"
        , { tmp: '%' + str + '%'})
    .getMany();

    for(i = 0;i < laptopInfo.length;i++)
        console.log(laptopInfo[i].name);
}

async function getPriceTrans(id){
    let priceTrans = [];

    timestamp = new Date();
    timestampLim = new Date();
    timestampLim.setMonth(timestampLim.getMonth() - 3);

    let laptopInfo = await getConnection()
    .getRepository(PriceTransition)
    .createQueryBuilder("PriceTransition")
    .where("PriceTransition.laptopId = :tmp and PriceTransition.date between :tmp1 and :tmp2 "
        , { tmp: id, tmp1: timestampLim, tmp2 : timestamp})
    .select("PriceTransition")
    .orderBy("PriceTransition.date")
    .getMany();

    for(i = 0;i < laptopInfo.length;i++){
        let tmp = [];
        tmp.push({date :laptopInfo[i].date,
            price :laptopInfo[i].price,
            websiteAddress :laptopInfo[i].websiteAddress,
            cash :laptopInfo[i].cash,
            websiteAddressCash :laptopInfo[i].websiteAddressCash
        });

        priceTrans.push(...tmp);
    }

    console.log(priceTrans);
}

module.exports = router;