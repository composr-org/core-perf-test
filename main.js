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
  performanceTests(0, 1)
    .then(function() {
      console.log('RESULTS', JSON.stringify(timeResults, null, 2));
    });
}

function performanceTests(currItem, currIteration) {
  if (currItem > options.length - 1) {
    return Promise.resolve();
  } else if (options[currItem].iterations === 0) {
    return performanceTests(currItem + 1, 1);
  } else {
    return suite(options[currItem], currIteration)
      .then(function(diff) {
        timeResults[options[currItem].name] = timeResults[options[currItem].name] ? timeResults[options[currItem].name] : [];
        timeResults[options[currItem].name].push({
          time: timeTaken,
          memoryDiff: diff.change.size_bytes
        });

        var nextItem = currIteration < options[currItem].iterations ? currItem : currItem + 1;
        var nextIteration = currIteration < options[currItem].iterations ? currIteration + 1 : 1;
        return performanceTests(nextItem, nextIteration);
      });

  }
}

function suite(options, iteration) {
  var id = options.name + ' - Iteration ' + iteration;
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

      console.log('-------- RESULTS ITERATION : ' + iteration + ' ----------');
      console.log('Time execution: ');
      console.timeEnd('tests');
      diff = hd.end();
      return writeResults(profile, options.name, id, diff);
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

function writeResults(profile, name, id, diff) {

  return new Promise(function(resolve, reject) {

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
        resolve(diff);
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