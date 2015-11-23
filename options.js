var express = require('express');

function expressReq() {
  var req = require('./node_modules/express/lib/request');
  return req;
}

function expressRes() {
  var res = require('./node_modules/express/lib/response');
  return res;
}


module.exports = [{
  name: 'browser with express',
  iterations : 5,
  options: {
    browser: true,
    req: expressReq(),
    res: expressRes()
  }
},{
  name: 'browser',
  iterations : 5,
  options: {
    browser: true
  }
}, {
  name: 'vm', 
  iterations : 5,
  options: {
    browser: false
  }
},
{
  name: 'vm with express',
  iterations : 5,
  options: {
    browser: false,
    req: expressReq(),
    res: expressRes()
  }
}];