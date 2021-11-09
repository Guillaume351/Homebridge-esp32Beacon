import express from 'express';
import controller from '../controllers/posts';
const router = express.Router();

router.get('/turnOn/:uid', controller.setOn);

export = router;