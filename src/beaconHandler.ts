import { PlatformAccessory } from 'homebridge';
import { BeaconPlatform } from './platform';
import { BeaconSetting } from './settings';

export class BeaconHandler {
  public static beacons: Beacon[] = [];

  public static triggerDetectionThreshold = -65;

  public static maintainDetectionThreshold = -75;

  public addBeacon(accessory: PlatformAccessory){
    const beacon: Beacon = new Beacon(accessory);
    BeaconHandler.beacons.push(beacon);
  }

  public static getCurrentRequiredRssi(beaconName: string, uuid: string){
    const beacon: Beacon = this.getBeaconByUuid(uuid) as Beacon;

    const service = beacon.accessory.getService(BeaconPlatform.Service.OccupancySensor)!;
    if((service.getCharacteristic(BeaconPlatform.Characteristic.OccupancyDetected).value as boolean)){
      return BeaconHandler.getMaintainDetectionThreshold(beaconName);
    } else {
      return BeaconHandler.getTriggerDetectionThreshold(beaconName);
    }
  }

  public static getTriggerDetectionThreshold(beaconName: string){
    const beaconsSettings : Array<BeaconSetting> = BeaconPlatform.instance.config.devices;

    for (const element of beaconsSettings){
      if(element.name === beaconName){
        return element.triggerDetectionThreshold;
      }
    }

    BeaconPlatform.instance.log.warn('No beacon found for name ' + beaconName);
    return BeaconHandler.triggerDetectionThreshold;
  }

  public static getMaintainDetectionThreshold(beaconName: string){
    const beaconsSettings : Array<BeaconSetting> = BeaconPlatform.instance.config.devices;

    for (const element of beaconsSettings){
      if(element.name === beaconName){
        return element.maintainDetectionThreshold;
      }
    }

    BeaconPlatform.instance.log.warn('No beacon found for name ' + beaconName);
    return BeaconHandler.triggerDetectionThreshold;
  }

  public static getBeaconByUuid(uuid: string) : Beacon | undefined {
    for (const beacon of BeaconHandler.beacons){
      if(beacon.accessory.UUID === uuid){
        return beacon;
      }
    }
    return undefined;
  }
}

export class Beacon {

  public trackHistory: string[] = [];

  constructor(
      public readonly accessory: PlatformAccessory,
  ){

  }

  /**
   * Manages the state of the presence detector
   */
  public updateState(){
    const service = this.accessory.getService(BeaconPlatform.Service.OccupancySensor)!;
    if(this.trackHistory.length > 0){
      service.updateCharacteristic(BeaconPlatform.Characteristic.OccupancyDetected, true);
    } else {
      service.updateCharacteristic(BeaconPlatform.Characteristic.OccupancyDetected, false);
    }

  }

  public addTrack(beaconName: string, deviceMac: string, rssi: number){
    if(rssi > BeaconHandler.getTriggerDetectionThreshold(beaconName)) { // TODO : replace by a better system
      this.trackHistory.push(deviceMac);
      setTimeout(() => {
        this.removeOldestTrack();
      }
      , 10000);
      this.updateState();
    } else if (rssi > BeaconHandler.getMaintainDetectionThreshold(beaconName)){ // only accept lower signal if device closer than trigger
      if(this.trackHistory.some(track => track === deviceMac)){
        const service = this.accessory.getService(BeaconPlatform.Service.OccupancySensor)!;
        if((service.getCharacteristic(BeaconPlatform.Characteristic.OccupancyDetected).value as boolean)){ // If the light was already awake
          this.trackHistory.push(deviceMac);
          setTimeout(() => {
            this.removeOldestTrack();
          }
          , 5000);
          this.updateState();
        }
      }


    }
  }

  public removeDevice(deviceMac: string){
    this.trackHistory = this.trackHistory.filter(i => i !== deviceMac);
    this.updateState();
  }

  private removeOldestTrack(){
    if(this.trackHistory.length > 0) {
      this.trackHistory.shift();
      this.updateState();
    }
  }


}