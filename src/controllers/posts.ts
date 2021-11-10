import { Request, Response, NextFunction } from 'express';
import { BeaconPlatform } from '../platform';
import { Logger } from 'homebridge';
import { Beacon } from '../beaconHandler';

const registerBeacon = async (req: Request, res: Response, next: NextFunction) => {
  // get the post id from the req
  const uid: string = req.params.uid;

  const uuid = BeaconPlatform.apiAccess.hap.uuid.generate(uid);
  // get the switch
  const existingAccessory = BeaconPlatform.accessories.find(accessory => accessory.UUID === uuid);
  if(existingAccessory){
    return res.status(200).json({
      message: 'Device already registered : ' + uuid,
    });


  } else {
    BeaconPlatform.instance.addNewAccessory('Beacon', uuid);
    return res.status(200).json({
      message: 'Device successfully registered ' + uuid,
    });
  }

};

const beaconTrack = async (req: Request, res: Response, next: NextFunction) => {
  // get the post id from the req
  const uid: string = req.params.uid;
  const deviceMac: string = req.params.deviceMac;
  const rssi = Number(req.params.rssi);

  const uuid = BeaconPlatform.apiAccess.hap.uuid.generate(uid);
  // get the switch
  const existingAccessory = BeaconPlatform.accessories.find(accessory => accessory.UUID === uuid);
  if(existingAccessory){
    const beacon: Beacon = BeaconPlatform.instance.beaconHandler.getBeaconByUuid(uuid);
    beacon.addTrack(deviceMac, rssi);
    return res.status(200).json({
      message: 'Track successfuly saved : ' + uuid,
    });
  } else {
    return res.status(404).json({
      message: 'Beacon not found ' + uuid,
    });
  }

};


export default { registerBeacon, beaconTrack};