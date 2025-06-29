const Parser = require('rss-parser');
const parser = new Parser();

exports.parsePodcastRSS = async (rssFeedUrl) => {
  try {
    const feed = await parser.parseURL(rssFeedUrl);
    const episodes = (feed.items || []).map(item => ({
      title: item.title,
      audioUrl: item.enclosure ? item.enclosure.url : null,
      duration: item.itunes && item.itunes.duration ? item.itunes.duration : ''
    }));
    const latestEpisode = episodes[0] || null;
    const audioUrl = latestEpisode ? latestEpisode.audioUrl : null;
    return {
      title: feed.title,
      description: feed.description,
      coverImage: feed.image?.url || feed.itunes?.image,
      author: feed.itunes?.author || feed.creator || feed.author,
      language: feed.language,
      categories: feed.itunes?.categories || [],
      explicit: feed.itunes?.explicit === 'yes',
      lastBuildDate: feed.lastBuildDate,
      episodes,
      rssFeed: rssFeedUrl,
      audioUrl,
    };
  } catch (error) {
    console.error('Error parsing RSS feed:', error);
    throw new Error('Failed to parse RSS feed');
  }
};