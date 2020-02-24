var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');
var Crawler = require("crawler");

router.get ('/', function(req,res,next) {
  const connection = getConnection();
  const repository = connection.getRepository(Laptop.options.name);
  repository.find().then((result) => {
    res.status(200).json(result);
  });
});

router.get ('/crawler', function(req,res,next) {
  var c = new Crawler({
    maxConnections : 10,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;

            console.log($("title").text());
            console.log($('p[class=prod_name]'));
            console.log($('a[class=prod_name]'));
            console.log($("html").find("a[class='prod_name']").text());
        }
        done();
    }
  });

  c.queue('http://prod.danawa.com/list/?cate=112758');

  res.status(200).json("Test Crawler");
});

module.exports = router;