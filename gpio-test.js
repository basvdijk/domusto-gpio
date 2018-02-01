var Gpio = require('pigpio').Gpio;

// let button = new Gpio(18, {
//     mode: Gpio.INPUT,
//     pullUpDown: Gpio.PUD_UP,
//     edge: Gpio.EITHER_EDGE
// });

led = new Gpio(24, { mode: Gpio.OUTPUT });

dutyCycle = 0;

// while(true) { 
//     led.pwmWrite(255);
// }

led.digitalWrite(1);

// setInterval(function () {
//   led.pwmWrite(dutyCycle);

//   dutyCycle += 5;
//   if (dutyCycle > 255) {
//     dutyCycle = 0;
//   }
// }, 20);

// console.log('read', button.digitalRead());

// button.on('interrupt', function (level) {
//     console.log(level);
// });