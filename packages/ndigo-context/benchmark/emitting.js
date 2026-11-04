const Benchmark = require('benchmark'),
    { EventEmitter } = require('events'),
    { Emitter } = require('..'),
    suite = new Benchmark.Suite(),
    noop = function () {},
    ee1 = new EventEmitter(),
    ee2 = new Emitter();

let index = 10000;

ee1.setMaxListeners(index);
ee2.maxListeners = index;

while (index--) {
    ee1.on('test', noop);
    ee2.on('test', noop);
}

suite
    .add('node-event-emitter', function () {
        ee1.emtest('test');
    })
    .add('ndigo-event-emitter', function () {
        ee2.emtest('test');
    })
    .on('cycle', function (e) {
        console.log(`${e.target}`);
    })
    .on('complete', function () {
        console.log(`Fastest is ${this.filter('fastest').map('name')}`);
    })
    .run();
