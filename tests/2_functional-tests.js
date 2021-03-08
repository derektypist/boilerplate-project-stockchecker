const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // View One Stock
  test('Test GET Request to /api/stock-prices/ to view one stock', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=BIIB')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end(function(err,res) {
      assert.equal(res.status,200);
      assert.equal(typeof(res.body),'object');
      assert.property(res.body,'stockData','return object contains stockData');
      assert.equal(res.body.stockData.stock,'BIIB');
      assert.property(res.body.stockData, 'stock');
      done();
    });
  });

  // View One Stock and Like It
  test('Test GET Request to /api/stock-prices/ to view one stock and like it', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=ADBE&like=true')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end(function(err,res) {
      assert.equal(res.status, 200);
      assert.equal(typeof(res.body),'object');
      assert.property(res.body, 'stockData', 'return object contains stockData');
      assert.equal(res.body.stockData.stock,'ADBE');
      assert.property(res.body.stockData, 'stock');
      assert.property(res.body.stockData, 'likes');
      assert.equal(res.body.stockData.likes,1);
      done();
    });
  });

  // View the Same Stock and Like It Again
  test('Test GET Request to /api/stock-prices/ to view the same stock and like it again', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=ADBE&like=true')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end(function(err,res) {
      assert.equal(res.status, 200);
      assert.equal(typeof(res.body),'object');
      assert.property(res.body, 'stockData', 'return object contains stockData');
      assert.equal(res.body.stockData.stock,'ADBE');
      assert.property(res.body.stockData, 'stock');
      assert.property(res.body.stockData, 'likes');
      assert.equal(res.body.stockData.likes, 1);
      done();
    });
  });

  // View Two Stocks
  test('Test GET Request to /api/stock-prices/ to view two stocks', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=ADBE&stock=CDR')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end(function(err,res) {
      assert.equal(res.status, 200);
      assert.equal(typeof(res.body),'object');
      assert.property(res.body, 'stockData', 'return object contains stockData');
      assert.equal(res.body.stockData[0].stock,'ADBE');
      assert.equal(res.body.stockData[0].rel_likes,1);
      assert.property(res.body.stockData[0], 'stock');
      assert.property(res.body.stockData[0], 'rel_likes');
      assert.equal(res.body.stockData[1].stock,'CDR');
      assert.equal(res.body.stockData[1].rel_likes,-1);
      assert.property(res.body.stockData[1],'stock');
      assert.property(res.body.stockData[1],'rel_likes');
      done();
    });
  });

  // View Two Stocks and Like Them
  test('Test GET Request to /api/stock/prices/ to view two stocks and like them', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=ADBE&stock=CDR&like=true')
    .set({'x-forwarded-for':'130.211.2.258'})
    .end(function(err,res) {
      assert.equal(res.status, 200);
      assert.equal(typeof(res.body),'object');
      assert.property(res.body, 'stockData', 'return object contains stockData');
      assert.equal(res.body.stockData[0].stock,'ADBE');
      assert.equal(res.body.stockData[0].rel_likes,1);
      assert.property(res.body.stockData[0],'stock');
      assert.property(res.body.stockData[0],'rel_likes');
      assert.equal(res.body.stockData[1].stock,'CDR');
      assert.equal(res.body.stockData[1].rel_likes,-1);
      assert.property(res.body.stockData[1],'stock');
      assert.property(res.body.stockData[1],'rel_likes');
      done();
    });
  });

});
