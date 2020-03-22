var express = require('express');
var router = express.Router();
const { getConnection } = require('typeorm');
const Laptop = require('../schemas/laptopSchem');
const puppeteer = require('puppeteer');

const Legend = require('../models/legend').Legend;
const Category = require('../models/category').Category;
const LaptopDB = require('../models/laptop').Laptop;
const PriceTransition = require('../models/priceTransition').PriceTransition;

var cron = require('node-cron');
const moment = require('moment');

cron.schedule('0 0 0 * * *', () => {
  console.log('Cron running : ' + (new Date()).toISOString().replace(/[^0-9]/g, ""));
  getLegends("http://prod.danawa.com/list/?cate=112758",10);
});

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
  console.log('Start Crawling Manually');
  const url = req.query.id;
  getLegends(url,10);
  // 노트북 : http://localhost:3000/crawler?id=http://prod.danawa.com/list/?cate=112758
  // 마스크 : http://localhost:3000/crawler?id=http://prod.danawa.com/list/?cate=1724561&logger_kw=ca_main_more
  res.status(200).json("Test Carwler at " + url);
});

async function getLegends(url,pageLimit){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForSelector(".btn_all_opt", {timeout: 10000});
  await page.click('.btn_all_opt');

  await sleep(1000);

  await page.waitForSelector("dl.spec_item", {timeout: 10000});
  const result = await page.evaluate(() => {
      const anchors = [];

      const dl = Array.from(document.querySelectorAll("dl.spec_item"));

      for(i = 0;i < dl.length;i++){
        const tmp = [];

        const item_dt = Array.from(dl[i].querySelectorAll("dt.item_dt"));
        const item_dt_ = Array.from(dl[i].querySelectorAll("dt.item_dt a.view_dic"));
        const sub_item = Array.from(dl[i].querySelectorAll("li.sub_item"));

        tmp.push(item_dt.map(anchor => {
          var tmp =  anchor.firstChild.textContent.toString().split('\r\n');
          var content = String(tmp).replace(/\t/g,'').replace(/\n/g,'').trim();
          return {content};
        }));

        tmp.push(item_dt_.map(anchor => {
          var tmp =  anchor.textContent.toString().split('\r\n');
          var content = String(tmp).replace(/\t/g,'').replace(/\n/g,'').trim();
          return {content};
        }));

        tmp.push(sub_item.map(anchor => {
          const tmp =  anchor.textContent.toString().split('\r\n');
          const content = String(tmp).replace(/\t/g,'').replace(/\n/g,'').trim();
  
          return {content};
        }));

        anchors.push(...tmp);
      }

      return anchors;
  });
  legendCatalog.push(...result);

  console.log(legendCatalog);
  console.log("Crawling done at " + url);
  await browser.close();

  await insertLegendCate();

  getProductHref(url,pageLimit);
}

async function insertLegendCate(){

  for(i = 0;i < legendCatalog.length;i+=3){
    
    let legendEl = '';
    let legendEl_ = '';

    try{
      legendEl = legendCatalog[i][0].content;
      legendEl_ = legendCatalog[i + 1][0].content;
    }
    catch(e){
    }

    if(legendEl == '' && legendEl_ == '')
      continue;
    
      if(legendEl != ''){
      const inspectionData = await getConnection()
      .getRepository(Legend)
      .createQueryBuilder("legend")
      .where("legend.label = :tmp", { tmp: legendEl })
      .getOne();

      if(inspectionData == null){
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Legend)
        .values([
            { label: legendEl }
        ])
        .execute();
      }
    }
    else if(legendEl_ != ''){
      legendEl = legendEl_;

      const inspectionData = await getConnection()
      .getRepository(Legend)
      .createQueryBuilder("legend")
      .where("legend.label = :tmp", { tmp: legendEl_ })
      .getOne();

      if(inspectionData == null){
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Legend)
        .values([
            { label: legendEl_ }
        ])
        .execute();
      }
    }

    let legendID = await getConnection()
      .getRepository(Legend)
      .createQueryBuilder("legend")
      .where("legend.label = :tmp", { tmp: legendEl })
      .select("legend.id")
      .getOne();
    legendID = parseInt(legendID.id);

    for(j = 0;j < legendCatalog[i + 2].length;j++){
      const tmpContent = legendCatalog[i + 2][j].content;

      if(tmpContent == '')
        continue;

      const inspectionData = await getConnection()
      .getRepository(Category)
      .createQueryBuilder("category")
      .where("category.name = :tmp", { tmp: tmpContent })
      .getOne();

      if(inspectionData == null){
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Category)
        .values([
          { legendId : legendID,
            name: tmpContent }
        ])
        .execute();
      }
    }
  }
}

async function getProductHref(url , pageLimit){
    var i;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    for(i = 1;i <= pageLimit;i++){

      const selector = "a[onclick='javascript:movePage(" + i + "); return false;']";
      if(i != 1){
        await page.waitForSelector(selector, {timeout: 10000});
        await page.click(selector);
        await sleep(1000);
      }

      await page.waitForSelector("a[name='productName']", {timeout: 10000});
      const result = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll("a[name='productName']"));
          return anchors.map(anchor => anchor.getAttribute('href'));
      });
      productElements.push(...result);
      console.log("Crawling Page " + i + " / " + pageLimit);
    }
    console.log(productElements);

    await browser.close();

    console.log("Crawling done at " + url);
    console.log(productElements.length + "items");

    console.log("%cQueue crawling start","color: green");
    for(i = 0;i < productElements.length;i++){
      console.log("%c" + "Queue " + (i + 1) + " / " + productElements.length,"color: red");
      await getSingleProductInfo(productElements[i]);
    }
    console.log("%cQueue crawling finished","color: green");
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

    const tmpArr = [];
    tmpArr.push(...title);
    tmpArr.push(...infos);
    tmpArr.push(...priceRes);
    await insertProductPrice(tmpArr);
  }catch(e){
      console.log("Crawling failed at " + url);
  }
  await browser.close();
}

async function insertProductPrice(singleProductInfo){
  console.log("SingleProduct Inserting start");

  const title = singleProductInfo[0].title;
  const info = singleProductInfo[1].infos;
  const price_ = singleProductInfo[2].price;
  const priceAdress = singleProductInfo[2].url;
  let cash_ = "";
  let cashAdress = "";
  if(singleProductInfo[3] != null){
    cash_ = singleProductInfo[3].price;
    cashAdress = singleProductInfo[3].url;
  }

  let inspectionData = await getConnection()
    .getRepository(LaptopDB)
    .createQueryBuilder("laptop")
    .where("laptop.name = :tmp", { tmp: title })
    .getOne();

  if(inspectionData == null){
    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(LaptopDB)
    .values([
    { name: title }
    ])
    .execute();
  }

  let laptopID = await getConnection()
    .getRepository(LaptopDB)
    .createQueryBuilder("laptop")
    .where("laptop.name = :tmp", { tmp: title })
    .select("laptop.id")
    .getOne();
  laptopID = parseInt(laptopID.id);

  await getConnection()
      .createQueryBuilder()
      .insert()
      .into(PriceTransition)
      .values([
        {
          laptopId : laptopID,
          price: price_,
          cash: cash_,
          websiteAddress: priceAdress,
          websiteAddressCash: cashAdress
        }
      ])
      .execute();
  console.log("Inserting finished");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;