import config from '../../config';

// DOMUSTO
import DomustoPlugin from '../../domusto/DomustoPlugin';

// INTERFACES
import { Domusto } from '../../domusto/DomustoTypes';
import DomustoSignalHub from '../../domusto/DomustoSignalHub';
import DomustoDevicesManager from '../../domusto/DomustoDevicesManager';

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

    private inputPinsInstances = [];
    private outputPinsInstances = [];

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

        this.console.header('Initialising GPIO pins');

        for (let pin of this.pluginConfiguration.settings.pins) {

            const pinDirection = pin.type.split('/')[0];
            const pinType = pin.type.split('/')[1];

            this.console.debug('Pin', pin.pinNumber, pin.type);

            if (pinDirection === 'input') {

                let input = new Gpio(pin.pinNumber, {
                    mode: pinDirection === 'input' ? Gpio.INPUT : Gpio.OUTPUT,
                    pullUpDown: pin.resistor === 'pullUp' ? Gpio.PUD_UP : Gpio.PUD_DOWN,
                    edge: Gpio.EITHER_EDGE
                });

                input.on('interrupt', pinState => {

                    let deviceId = 'GPIO' + pin.pinNumber;

                    // Get all devices including devices with trigger
                    const devices = DomustoDevicesManager.getDevicesByDeviceId(deviceId);

                    for (let device of devices) {

                        let devicePinState = pinState;

                        if (pinType === 'NO') {
                            devicePinState = (pinState === 1 ? 0 : 1);
                        }

                        // Broadcast a signal as if it was send from the client
                        this.broadcastSignal(device.plugin.deviceId, {
                            state: devicePinState === 1 ? 'on' : 'off'
                        }, Domusto.SignalSender.client);

                    }

                });

                this.inputPinsInstances.push({
                    pinData: pin,
                    instance: input
                });

            }

            if (pinDirection === 'output') {

                let output = new Gpio(pin.pinNumber, {
                    mode: Gpio.OUTPUT,
                });

                this.outputPinsInstances.push({
                    pinData: pin,
                    instance: output
                });

            }
        }

        // We need to wait for the IO ports to be ready
        setTimeout(() => this.refreshPinsStatus(), 1000);

    }

    /**
     * Fired when a signal is send to the plugin
     *
     * @param {Domusto.Signal} signal
     * @memberof DomustoGPIO
     */
    onSignalReceivedForPlugin(signal: Domusto.Signal) {

        for (let outputPin of this.outputPinsInstances) {

            let pinName = 'GPIO' + outputPin.pinData.pinNumber;

            if (pinName === signal.deviceId) {

                outputPin.instance.digitalWrite(signal.data['state'] === 'on' ? 1 : 0);

                this.broadcastSignal(pinName, {
                    state: signal.data['state'],
                });

                break;
            }

        }

    }

    /**
     * Read all input pins and broadcast their state
     *
     * @memberof DomustoGPIO
     */
    refreshPinsStatus() {

        for (let inputPin of this.inputPinsInstances) {

            let pinType = inputPin.pinData.type.split('/')[1];
            let pinState = inputPin.instance.digitalRead();

            this.broadcastPinState(inputPin.pinData.pinNumber, pinState, pinType, 'read');
        }

    }

    /**
     * Broadcasts the state of a pin
     *
     * @param {any} pinNumber
     * @param {any} pinState
     * @param {any} pinType
     * @param {any} readEventType
     * @memberof DomustoGPIO
     */
    broadcastPinState(pinNumber, pinState, pinType, readEventType) {

        this.console.debug(`GPIO ${pinNumber} (${pinType}) -> ${readEventType}:`, pinState);

        if (pinType === 'NO') {
            pinState = pinState === 1 ? 0 : 1;
        }

        this.broadcastSignal(`GPIO${pinNumber}`, {
            state: pinState === 1 ? 'on' : 'off'
        });

    }

}

export default DomustoGPIO;