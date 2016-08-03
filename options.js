/*var express = require('express');

function expressReq() {
  var req = require('./node_modules/express/lib/request');
  return req;
}

function expressRes() {
  var res = require('./node_modules/express/lib/response');
  res._headers =  {};
  return {
    status : function(){
      return {
        send : function(){}
      }
    },
    send : function(){}
  };
}

var options = [{
  name: 'browser with express',
  iterations : 5,
  options: {
    browser: true,
    req: expressReq(),
    res: expressRes(),
    server : 'express'
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
    res: expressRes(),
    server : 'express'
  }
}]*/

var optionsWithoutServer = [{
  name: 'browser',
  iterations : 1,
  options: {
    browser: true
  }
}]

module.exports = optionsWithoutServer;