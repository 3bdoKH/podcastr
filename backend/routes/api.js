const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcasts');
const { adminLogin } = require('../controllers/podcasts');

router.get('/podcasts', podcastController.getAllPodcasts);
router.post('/podcasts', podcastController.addPodcast);
router.post('/podcasts/current', podcastController.setCurrentPodcast);
router.get('/podcasts/current', podcastController.getCurrentPodcast);
router.delete('/podcasts/:id', podcastController.deletePodcast);
router.post('/admin/login', adminLogin);

module.exports = router;