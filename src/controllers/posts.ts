import { Request, Response, NextFunction } from 'express';
import { ExampleHomebridgePlatform } from '../platform';
import { Logger } from 'homebridge';

const setOn = async (req: Request, res: Response, next: NextFunction) => {
  // get the post id from the req
  const uid: string = req.params.uid;

  const uuid = ExampleHomebridgePlatform.apiAccess.hap.uuid.generate(uid);
  // get the switch
  const existingAccessory = ExampleHomebridgePlatform.accessories.find(accessory => accessory.UUID === uuid);
  if(existingAccessory){

    console.log('Turning on', uuid);
    // turn it on
    existingAccessory.getService(ExampleHomebridgePlatform.Service.OccupancySensor)?.updateCharacteristic(ExampleHomebridgePlatform.Characteristic.OccupancyDetected, true);
    return res.status(200).json({
      message: 'Turned on ' + uuid,
    });


  } else {
    return res.status(404).json({
      message: 'Error not found ' + uuid,
    });
  }



};


export default { setOn };