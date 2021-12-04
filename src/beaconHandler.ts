import { PlatformAccessory } from 'homebridge';
import { Server } from 'http';
import { BeaconPlatform } from './platform';

export class BeaconHandler {
  public beacons: Beacon[] = [];

  public addBeacon(accessory: PlatformAccessory){
    const beacon: Beacon = new Beacon(accessory);
    this.beacons.push(beacon);
  }

  public getBeaconByUuid(uuid: string){
    for (const beacon of this.beacons){
      if(beacon.accessory.UUID === uuid){
        return beacon;
      }
    }
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

  public addTrack(deviceMac: string, rssi: number){
    if(rssi > -75) { // TODO : replace by a better system
      this.trackHistory.push(deviceMac);
      setTimeout(() => {
        this.removeOldestTrack();
      }
      , 10000);
      this.updateState();
    } else if (rssi > -85){ // TODO : only accept second if it's the device that's keeping the light awake
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