var composr = require('composr-core');
var phrases = require('./phrases');
var memwatch = require('memwatch-next');
var hd;

//Initialize
composr.init({})
  .then(function() {
    //Ready to go
    console.log('Initialized');
    console.log('Registering phrases');

    suscribeMemwatch();
    suscribeLogs();
    return composr.Phrases.register('mydomain', phrases);
  })
  .then(function(results) {
    console.log(results.length, 'Items registered');
    hd = new memwatch.HeapDiff();
    console.log('Ready for execute tests');
    console.time('tests');
    executeTests(100, writeResults);
  })
  .catch(function(err) {
    console.log('Error', err);
  });

function executeTests(times, cb) {
  if (times > 0) {

    var options = {
      browser: false
    };

    composr.Phrases.runByPath('mydomain', 'test/phrase', 'get', options)
      .then(function(response) {
        console.log('Execution', times);
        executeTests(times - 1, cb);
      });

  } else {
    cb();
  }
}

function writeResults() {

  console.log('-------- RESULTS ----------');
  console.log('Time execution: ');
  console.timeEnd('tests');
  diff = hd.end();

  console.log('Memory increase: ', diff.change.size_bytes);
  console.log('Memory details: ', diff.change.details);
}

function suscribeLogs() {
  composr.events.on('debug', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });

  composr.events.on('error', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });

  composr.events.on('warn', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });

  composr.events.on('info', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });
}

function suscribeMemwatch() {
  memwatch.on('leak', function(info) {
    console.log('LEAK--------');
    console.log(info);
  });

  memwatch.on('stats', function(stats) {
    console.log('STATS--------');
    console.log(stats);
  });
}