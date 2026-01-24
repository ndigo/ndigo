/* eslint-disable */

// https://stackoverflow.com/questions/46749742/what-happens-to-v8-status-code-on-optimization-function-run
// https://github.com/v8/v8/blob/217de927fbe9dfd356f49d5ba8c1145d7b161f1f/src/runtime/runtime.h#L840
function printStatus(fn) {
    /* @ts-ignore */
    const status = %GetOptimizationStatus(fn);
    status & (1 << 0) && console.log(chalk.blue('... is function'));
    status & (1 << 1) && console.log(chalk.red('... is never optimized'));
    status & (1 << 2) && console.log(chalk.green('... is always optimized'));
    status & (1 << 3) && console.log(chalk.yellow('... is maybe deoptimized'));
    status & (1 << 4) && console.log(chalk.green('... is optimized'));
    status & (1 << 5) && console.log(chalk.green('... is optimized by TurboFan'));
    status & (1 << 6) && console.log(chalk.green('... is interpreted'));
    status & (1 << 7) && console.log(chalk.green('... is marked for optimization'));
    status & (1 << 8) && console.log(chalk.green('... is marked for concurrent optimization'));
    status & (1 << 9) && console.log(chalk.green('... is optimizing concurrently'));
    status & (1 << 10) && console.log(chalk.blue('... is executing'));
    status & (1 << 11) && console.log(chalk.green('topmost frame is turbo fanned'));
}

const chalk = require('chalk'),
    DefaultFactory = require('..').DefaultFactory,
    f = new DefaultFactory();

class Test {}

f.setValue('test', Test);
f.setValue('test', Test);

%OptimizeFunctionOnNextCall(f.setValue);

f.setValue('test', Test);

console.log(chalk.bold('DefaultFactory#setValue'));
printStatus(f.setValue);

f.getValue('test');
f.getValue('test');

%OptimizeFunctionOnNextCall(f.getValue);

f.getValue('test');

console.log(chalk.bold('DefaultFactory#getValue'));
printStatus(f.getValue);
