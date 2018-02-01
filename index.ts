import config from '../../config';

// DOMUSTO
import DomustoPlugin from '../../domusto/DomustoPlugin';

// INTERFACES
import { Domusto } from '../../domusto/DomustoTypes';
import DomustoSignalHub from '../../domusto/DomustoSignalHub';

// PLUGIN SPECIFIC
// import * as Gpio from 'pigpio';

let Gpio = require('pigpio').Gpio;

/**
 * GPIO plugin for DOMUSTO
 * @author Bas van Dijk
 * @version 0.0.1
 *
 * @class DomustoGPIO
 * @extends {DomustoPlugin}
 */
class DomustoGPIO extends DomustoPlugin {

    GPIO_HIGH = 1;
    GPIO_LOW = 0;
    button;

    /**
     * Creates an instance of DomustoGPIO.
     * @param {any} Plugin configuration as defined in the config.js file
     * @memberof DomustoGPIO
     */
    constructor(pluginConfiguration: Domusto.PluginConfiguration) {

        super({
            plugin: 'GPIO reader/writer for RPI GPIO ports',
            author: 'Bas van Dijk',
            category: Domusto.PluginCategories.system,
            version: '0.0.1',
            website: 'http://domusto.com'
        });

        this.pluginConfiguration = pluginConfiguration;

        for (let pin of this.pluginConfiguration.settings.pins) {

            const pinDirection = pin.type.split('/')[0];
            const pinType = pin.type.split('/')[1];

            this.console.debug('GPIO', pin.pinNumber, pin.type);

            this.button = new Gpio(pin.pinNumber, {
                mode: pinDirection === 'input' ? Gpio.INPUT : Gpio.OUTPUT,
                pullUpDown: pin.resistor === 'pullUp' ? Gpio.PUD_UP : Gpio.PUD_DOWN,
                edge: Gpio.EITHER_EDGE
            });

            this.button.on('interrupt', pinState => {

                this.console.debug('GPIO 18 (INT)', pinState);

                console.log(pinType);

                if (pinType === 'NO') {
                    pinState = pinState === 1 ? 0 : 1;
                }

                this.broadcastSignal('GPIO18', {
                    state: pinState === 1 ? 'on' : 'off'
                });

            });


        }

        setTimeout(() => this.refreshPinStatus(), 1000);

    }

    refreshPinStatus() {

        let pinState = this.button.digitalRead();

        this.console.debug('GPIO 18 (READ)', pinState);

        // if (pinType === 'NO') {
            pinState = pinState === 1 ? 0 : 1;
        // }

        console.log('STATE', pinState);

        this.broadcastSignal('GPIO18', {
            state: pinState === 1 ? 'on' : 'off'
        });

    }

    onSignalReceivedForPlugin(signal: Domusto.Signal) { }

}

export default DomustoGPIO;