var Gpio = require('pigpio').Gpio;

let button = new Gpio(18, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_UP,
    edge: Gpio.EITHER_EDGE
});
// let button = new Gpio(18, {
//     mode: Gpio.INPUT,
//     pullUpDown: Gpio.PUD_UP,
//     edge: Gpio.EITHER_EDGE
// });

// led = new Gpio(17, { mode: Gpio.OUTPUT });

console.log('read', button.digitalRead());

button.on('interrupt', function (level) {
    console.log(level);
});