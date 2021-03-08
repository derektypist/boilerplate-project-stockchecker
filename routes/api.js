'use strict';

const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const fetch = require('node-fetch');

module.exports = function (app,model) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stock = req.query.stock;
      let like = req.query.like;
      let ip = (req.headers['x-forwarded-for']).toString();
      console.log(like);

      // Perform Database Search
      async function searchDB(data) {
        let {symbol, latestPrice} = data;

        return await model.findOne({stock:symbol}, async function(err,doc) {
          if (err) return err;
          if (!doc) {
            console.log('there is no stock in db');
            let increment = 0;
            if (like) {
              increment = 1;
            }
            console.log(like);
            const newDoc = new model({
              stock: symbol,
              price: latestPrice,
              likes: increment
            });
            console.log(newDoc.likes);
            newDoc.ip.push(ip);
            console.log(newDoc);
            return await newDoc.save(async function(err,data) {
              if (err) return err;
              console.log('saving new doc');
              return newDoc;
            });
          } else {
            console.log('there is stock in db');
            console.log(like);
            if(like) {
              if(doc.ip.includes(!ip)) {
                doc.likes = doc.likes + 1;
                doc.ip.push(ip);
              }
            }
            console.log(doc.likes);
            doc.price = latestPrice;
            console.log(doc);

            return await doc.save(async function(err,data) {
              if (err) return err;
              console.log('updating doc in database');
              return doc;
            });
          }
        });
      }

      console.log(typeof(stock));
      // If there are two stocks
      if(typeof(stock)=='object' && stock.length ==2) {
        async function findStockData(list) {
          console.log('start');
          let stockData = await list.map(async element => {
            const stockUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${element}/quote`;
            console.log(element);
            try {
              const response = await fetch(stockUrl);
              const data = await response.json();
              // try catch error
              if (data==='Unknown symbol') {
                console.log('unknown stock or error');
                return ({
                  "error":"external source error",
                  "likes":0
                });
              }
              else {
                console.log('found stock');
                const result = await searchDB(data);
                console.log('result');
                return result;
              }
            } 
            catch (err) {
              return ({
                "error":"external source error",
                "likes":0
              });
            }
          });

          const final = await Promise.all(stockData);
          console.log(final);

          let firstRelLikes = final[0].likes - final[1].likes;
          let secondRelLikes = final[1].likes - final[0].likes;

          final[0].rel_likes = firstRelLikes;
          final[1].rel_likes = secondRelLikes;

          const filteredObj = final.map(element => {
            return ({
              stock: element.stock,
              price: element.price,
              rel_likes: element.rel_likes
            });
          });

          return res.json({"stockData":filteredObj});
        }
        findStockData(stock);
      } 
      else {
        console.log('activates here');
        const stockUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
        await fetch(stockUrl)
        .then(response => response.json())
        .then(async data => {
            if (data === 'Unknown symbol') {
              res.json({
                "stockData": {
                  "error": "external source error",
                  "likes": 0
                }
              });
            } 
            else {
              const result = await searchDB(data);
              const filtered = {
                stock: result.stock,
                price: result.price,
                likes: result.likes
              };
              res.json({"stockData": filtered});
            }
          })
        .catch(err => {
            console.log('Err' + err);
            res.json({
              "stockData": {
                "error": "external source error",
                "likes": 0
              }
            });
          });
      }

    });
    
};
