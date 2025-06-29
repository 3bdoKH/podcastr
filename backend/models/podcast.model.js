const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  title: String,
  audioUrl: String,
  duration: String
}, { _id: false });

const podcastSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  rssFeed: { type: String, required: true, unique: true },
  audioUrl: { type: String },
  episodes: [episodeSchema],
  isPlaying: { type: Boolean, default: false },
  currentEpisode: { type: Number, default: 0 },
  lastPlayed: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Podcast', podcastSchema);