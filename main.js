var phrases = require('./phrases');
var memwatch = require('memwatch-next');
var profiler = require('v8-profiler');
var options = require('./options');
var hd, time, timeTaken, composr;
var fs = require('fs');

var timeResults = {};

/*
 @TODO: Spawn child processes for clear memory usages
 */
function start() {
  //suscribeMemwatch(); //ENABLE AT WILL
  performanceTests(0, Promise.resolve())
    .then(function() {
      console.log('TIME RESULTS', JSON.stringify(timeResults));
    });
}

function performanceTests(currItem) {
  if (currItem > options.length - 1) {
    return Promise.resolve();
  } else {
    return suite(options[currItem])
      .then(function() {
        timeResults[options[currItem].name] = timeTaken;
        return performanceTests(currItem + 1);
      });
  }
}

function suite(options) {
  var id = options.name + ' - ' + Date.now();
  return before()
    .then(function() {
      hd = new memwatch.HeapDiff();
      console.log('Ready for execute tests');
      console.time('tests', options.name);
      profiler.startProfiling(id);
      time = Date.now();

      return executeTests(100, options.options);
    })
    .then(function() {
      var profile = profiler.stopProfiling(id);
      timeTaken = Date.now() - time;
      return writeResults(profile, options.name, id);
    })
    .catch(function(err) {
      console.log('Error', err);
    })
}

function before() {
  composr = require('composr-core');
  return composr.init({})
    .then(function() {
      //Ready to go
      console.log('Initialized');
      console.log('Registering phrases');

      suscribeLogs();
      return composr.Phrases.register('mydomain', phrases);
    })
    .then(function(results) {
      console.log(results.length, 'Items registered');
      return composr;
    });
}

//Initialize
function executeTests(times, options) {
  if (times > 0) {
    return composr.Phrases.runByPath('mydomain', 'test/phrase', 'get', options)
      .then(function(response) {
        console.log('Execution', times);
        return executeTests(times - 1, options);
      });
  } else {
    return Promise.resolve();
  }
}

function writeResults(profile, name, id) {

  return new Promise(function(resolve, reject) {
    console.log('-------- RESULTS ----------');
    console.log('Time execution: ');
    console.timeEnd('tests');
    diff = hd.end();

    console.log('Memory increase: ', diff.change.size_bytes);
    //console.log('Memory details: ', diff.change.details);

    profile.export(function(error, result) {
      if (error) {
        return reject(error);
      } else {
        if (!fs.existsSync('./results/' + name)) {
          fs.mkdirSync('./results/' + name);
        }
        fs.writeFileSync('./results/' + name + '/' + id + '.json', result);
        profile.delete();
        resolve();
      }
    });
  });

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
    console.log('------ MEMORY LEAK--------');
    console.log(info);
  });

  memwatch.on('stats', function(stats) {
    console.log('--------MEMORY STATS--------');
    console.log(stats);
  });
}

start();