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
  // 노트북 : http://localhost:3000/crawler?id=http://prod.danawa.com/list/?cate=112758
  // 라면 : http://localhost:3000/crawler?id=http://prod.danawa.com/list/?cate=16228187&15main_16_02
  const url = req.query.id;
  getProductHref(url, 20);

  res.status(200).json("Test Carwler at " + url);
});

async function getProductHref(url , pageLimit){
    var i;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    for(i = 1;i <= pageLimit;i++){
      await page.evaluate(() => {
        movePage(this.i);
        return false;
      });

      await page.waitForSelector("a[name='productName']", {timeout: 10000});
      const result = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll("a[name='productName']"));
          return anchors.map(anchor => anchor.getAttribute('href'));
      });
      productElements.push(...result);
      console.log("Crawling Page " + i + " / " + pageLimit);
    }

    await browser.close();

    console.log("Crawling done at " + url);
    console.log(productElements.length + "items");

    console.log("Queue crawling start");
    for(i = 0;i < productElements.length;i++){
        await getSingleProductInfo(productElements[i]);
    }
    console.log("Queue crawling finished");
}

async function getSingleProductInfo(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    //
    await page.waitForSelector("h3.prod_tit", {timeout: 10000});
    const title = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("h3.prod_tit"));
        return anchors.map(anchor => {
          const title =  anchor.textContent;
          return {title};
        });;
    });
    //
    await page.waitForSelector("div.items", {timeout: 10000});
    const infos = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("div.items"));
        return anchors.map(anchor => {
          const infos =  anchor.textContent;
          return {infos};
        });;
    });
    //await page.waitForSelector(".lowest_price a.lwst_prc", {timeout: 10000});
    await page.waitForSelector("a.lwst_prc", {timeout: 10000});
    const priceRes = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a.lwst_prc"));
        return anchors.map(anchor => {
          const price =  anchor.textContent;
          const url = anchor.getAttribute('href');

          return {price,url};
        });;
    });

    console.log("Crawling done at " + url);
    //console.log(title,infos, priceRes);
    console.log(title);

    await browser.close();
}

module.exports = router;