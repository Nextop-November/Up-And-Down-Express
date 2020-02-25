var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');
const puppeteer = require('puppeteer');

router.get ('/', function(req,res,next) {
  const connection = getConnection();
  const repository = connection.getRepository(Laptop.options.name);
  repository.find().then((result) => {
    res.status(200).json(result);
  });
});

router.get ('/crawler', function(req,res,next) {
  getProductHref('http://prod.danawa.com/list/?cate=112758');

  res.status(200).json("Test Carwler");
});

function getProductHref(url){
  let elements = [];

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    
    await page.waitForSelector("a[class='prod_name']", {timeout: 10000});
    const result = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[class='prod_name']"));
        return anchors.map(anchor => anchor.getAttribute('href'));
    });
    elements.push(result);
    //console.log(result.join('\n'));

    await page.waitForSelector("a[name='productName']", {timeout: 10000});
    const result_ = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[name='productName']"));
        return anchors.map(anchor => anchor.getAttribute('href'));
    });
    elements.push(result_);
    //console.log(result_.join('\n'));
    await browser.close();

    console.log("Crawling done at " + url);
    console.log(elements);
    })();

    return elements;
}

module.exports = router;