var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');
const puppeteer = require('puppeteer');

let productElements = [];

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

async function getProductHref(url){

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector("a[name='productName']", {timeout: 10000});
    const result = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[name='productName']"));
        return anchors.map(anchor => anchor.getAttribute('href'));
    });
    productElements.push(...result);
    //console.log(result_.join('\n'));
    await browser.close();

    console.log("Crawling done at " + url);
    console.log(productElements);

    console.log("Queue crawling start");
    var i;
    for(i = 0;i < productElements.length;i++){
        await getSingleProductInfo(productElements[i]);
    }
    console.log("Queue crawling finished");
}

async function getSingleProductInfo(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    
    await page.waitForSelector(".lowest_price a.lwst_prc", {timeout: 10000});
    const result = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll(".lowest_price a.lwst_prc"));
        return anchors.map(anchor => {
          const price =  anchor.textContent;
          const url = anchor.getAttribute('href');

          return {price,url};
        });;
    });
    console.log("Crawling done at " + url);
    console.log(result);

    await browser.close();
}

module.exports = router;