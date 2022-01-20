import { Request, Response, NextFunction } from 'express';
import { BeaconPlatform } from '../platform';
import { Logger } from 'homebridge';
import { Beacon, BeaconHandler } from '../beaconHandler';

const registerBeacon = async (req: Request, res: Response, next: NextFunction) => {
  // get the post id from the req
  const uid: string = req.params.uid;

  const uuid = BeaconPlatform.apiAccess.hap.uuid.generate(uid);
  // get the switch
  const existingAccessory = BeaconPlatform.accessories.find(accessory => accessory.UUID === uuid);
  if(existingAccessory){
    return res.status(200).json({
      message: 'Device already registered : ' + uuid,
      maxRssi: BeaconHandler.getTriggerDetectionThreshold(uid),
    });


  } else {
    BeaconPlatform.instance.addNewAccessory(uid, uuid);
    return res.status(200).json({
      message: 'Device successfully registered ' + uuid,
      maxRssi: BeaconHandler.getTriggerDetectionThreshold(uid),
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
    const beacon: Beacon = BeaconHandler.getBeaconByUuid(uuid) as Beacon;
    beacon.addTrack(uid, deviceMac, rssi);
    return res.status(200).json({
      message: 'Track successfuly saved : ' + uuid,
      maxRssi: BeaconHandler.getCurrentRequiredRssi(uid, uuid),
    });
  } else {
    return res.status(404).json({
      message: 'Beacon not found ' + uuid,
    });
  }

};


export default {registerBeacon, beaconTrack};