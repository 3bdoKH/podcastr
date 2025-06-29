const Podcast = require('../models/podcast.model');
const { parsePodcastRSS } = require('../utils/podcastParser');
const jwt = require('jsonwebtoken');

exports.getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ createdAt: -1 });
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPodcast = async (req, res) => {
  const { rssFeed } = req.body;

  if (!rssFeed) {
    return res.status(400).json({ message: "RSS feed URL is required" });
  }
  
  try {
    const existingPodcast = await Podcast.findOne({ rssFeed });
    if (existingPodcast) {
      return res.status(400).json({ message: "Podcast already exists" });
    }
    const podcastData = await parsePodcastRSS(rssFeed);
    const newPodcast = new Podcast({
      title: podcastData.title,
      description: podcastData.description,
      coverImage: podcastData.coverImage,
      rssFeed,
      audioUrl: podcastData.audioUrl,
      episodes: podcastData.episodes
    });
    const savedPodcast = await newPodcast.save();
    res.status(201).json(savedPodcast);
  } catch (err) {
    console.error('Error adding podcast:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.setCurrentPodcast = async (req, res) => {
  try {
    const { podcastId, episodeIndex } = req.body;
    await Podcast.updateMany({}, { $set: { isPlaying: false } });
    const podcast = await Podcast.findByIdAndUpdate(
      podcastId,
      { $set: { isPlaying: true, lastPlayed: new Date(), currentEpisode: episodeIndex ?? 0 } },
      { new: true }
    );
    res.json(podcast);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({ isPlaying: true });
    if (!podcast) return res.json(null);
    const episode = podcast.episodes && podcast.episodes.length > 0
      ? podcast.episodes[podcast.currentEpisode || 0]
      : null;
    res.json({
      podcast,
      episode
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Podcast.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    res.json({ message: 'Podcast deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.REACT_APP_ADMIN_USER &&
    password === process.env.REACT_APP_ADMIN_PASS
  ) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
};