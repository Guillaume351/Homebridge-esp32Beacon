import { PlatformAccessory } from 'homebridge';
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
      console.log('Turning on', this.accessory.UUID);
      service.updateCharacteristic(BeaconPlatform.Characteristic.OccupancyDetected, true);
    } else {
      console.log('Turning off', this.accessory.UUID);
      service.updateCharacteristic(BeaconPlatform.Characteristic.OccupancyDetected, false);
    }

  }

  public addTrack(deviceMac: string, rssi: number){
    this.trackHistory.push(deviceMac);
    this.updateState();
    setTimeout(
      this.removeOldestTrack, 10000);
  }

  public removeDevice(deviceMac: string){
    this.trackHistory = this.trackHistory.filter(i => i !== deviceMac);
    this.updateState();
  }

  private removeOldestTrack(){
    this.trackHistory.shift();
    this.updateState();
  }


}