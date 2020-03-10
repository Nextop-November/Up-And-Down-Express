var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');
const puppeteer = require('puppeteer');
const Legend = require('../models/legend').Legend;

let legendCatalog = [];
let productElements = [];

router.get ('/', function(req,res,next) {
  const connection = getConnection();
  const repository = connection.getRepository(Laptop.options.name);
  repository.find().then((result) => {
    res.status(200).json(result);
  });
});

router.get ('/crawler', function(req,res,next) {
  const url = req.query.id;
  getLegends(url);
  //getProductHref(url, 30);

  res.status(200).json("Test Carwler at " + url);
});
// 노트북 : http://localhost:3000/crawler?id=http://prod.danawa.com/list/?cate=112758
// 마스크 : http://localhost:3000/crawler?id=http://prod.danawa.com/list/?cate=1724561&logger_kw=ca_main_more

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

async function getLegends(url){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForSelector("dl.spec_item", {timeout: 10000});
  const result = await page.evaluate(() => {
      const anchors = [];
      //("dl dt.item_dt a.view_dic")
      const item_dt = Array.from(document.querySelectorAll("dl dt.item_dt"));
      const item_dt_ = Array.from(document.querySelectorAll("dl dt.item_dt a.view_dic"));
      const sub_item = Array.from(document.querySelectorAll("dl li.sub_item"));
      
      anchors.push(item_dt.map(anchor => {
        var tmp =  anchor.firstChild.textContent.toString().split('\r\n');
        var content = String(tmp).replace(/\t/g,'').replace(/\n/g,'').trim();
        return {content};
      }));

      anchors.push(item_dt_.map(anchor => {
        var tmp =  anchor.textContent.toString().split('\r\n');
        var content = String(tmp).replace(/\t/g,'').replace(/\n/g,'').trim();
        return {content};
      }));

      anchors.push(sub_item.map(anchor => {
        const tmp =  anchor.textContent.toString().split('\r\n');
        const content = String(tmp).replace(/\t/g,'').replace(/\n/g,'').trim();

        return {content};
      }));

      return anchors;
  });
  legendCatalog.push(...result);

  console.log(legendCatalog);
  console.log("Crawling done at " + url);
  await browser.close();

  await insertLegend(0);
  await insertLegend(1);

  getProductHref(url,30);
}

async function getSingleProductInfo(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    try{
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
    console.log(title,infos, priceRes);
  }catch(e){
      console.log("Crawling failed at " + url);
  }

    await browser.close();
}

// 0, 1 : legend
async function insertLegend(level){
  for(i = 0;i < legendCatalog[level].length;i++){
    //console.log(legendCatalog[level][i].content + " " + i);

    if(legendCatalog[level][i].content == '')
      continue;

    const inspectionData = await getConnection()
    .getRepository(Legend)
    .createQueryBuilder("legend")
    .where("legend.label = :tmp", { tmp: legendCatalog[level][i].content })
    .getOne();

    if(inspectionData == null){
      await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Legend)
      .values([
          { label: legendCatalog[level][i].content }
      ])
      .execute();
    }
  }
}

module.exports = router;