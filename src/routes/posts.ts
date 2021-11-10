import express from 'express';
import controller from '../controllers/posts';
const router = express.Router();

router.get('/registerBeacon/:uid', controller.registerBeacon);
router.get('/beaconTrack/:uid/:deviceMac/:rssi', controller.beaconTrack);

export = router;