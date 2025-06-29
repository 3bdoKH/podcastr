import './Podcasts.css'
import React, { useState, useEffect, useRef } from 'react'
import { Play, ChevronDown, ChevronUp } from 'lucide-react'
import { getPodcasts, setCurrentPodcast } from '../../api'

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEpisode, setSelectedEpisode] = useState(null)
  const [expandedPodcastId, setExpandedPodcastId] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const fetchPodcasts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPodcasts()
      setPodcasts(data)
    } catch (err) {
      console.error('Error fetching podcasts:', err)
      setError('Failed to load podcasts')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayEpisode = async (podcast, episode) => {
    try {
      const episodeIndex = podcast.episodes.findIndex(ep => ep.title === episode.title && ep.audioUrl === episode.audioUrl)
      await setCurrentPodcast(podcast._id, episodeIndex)
      setSelectedEpisode({ ...episode, podcastTitle: podcast.title })
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load()
          audioRef.current.play()
        }
      }, 100)
    } catch (err) {
      console.error('Error setting current podcast:', err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    })
  }

  const formatDuration = (duration) => {
    if (!duration) return '--:--'
    if (typeof duration === 'string' && duration.includes(':')) return duration
    const sec = parseInt(duration, 10)
    if (isNaN(sec)) return duration
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`
  }

  const toggleExpand = (podcastId) => {
    setExpandedPodcastId(expandedPodcastId === podcastId ? null : podcastId)
  }

  if (loading) {
    return (
      <div className='podcasts'>
        <h2 className="podcasts-title">All Podcasts</h2>
        <div className="loading-message">Loading podcasts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='podcasts'>
        <h2 className="podcasts-title">All Podcasts</h2>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className='podcasts'>
      <h2 className="podcasts-title">All Podcasts</h2>
      <div className="podcasts-container">
        <div className="podcasts-header">
          <span className="podcast-col">PODCAST</span>
          <span className="description-col">DESCRIPTION</span>
          <span className="date-col">DATE</span>
          <span className="episodes-col">EPISODES</span>
          <span className="play-col"></span>
        </div>
        {podcasts.length === 0 ? (
          <div className="no-podcasts">No podcasts found. Add some podcasts in the admin panel!</div>
        ) : (
          podcasts.map((podcast) => (
            <React.Fragment key={podcast._id}>
              <div className={`podcast-row ${podcast.isPlaying ? 'playing' : ''}`}> 
                <span className="podcast-col">
                  <img 
                    src={podcast.coverImage || "/image.png"} 
                    alt={podcast.title} 
                    className="podcast-img" 
                  />
                  <span className="podcast-title">{podcast.title}</span>
                </span>
                <span className="description-col">
                  {podcast.description ? 
                    podcast.description.substring(0, 50) + (podcast.description.length > 50 ? '...' : '') 
                    : 'No description'
                  }
                </span>
                <span className="date-col">{formatDate(podcast.createdAt)}</span>
                <span className="episodes-col">
                  {podcast.episodes && podcast.episodes.length > 0 ? podcast.episodes.length : 0}
                </span>
                <span className="play-col">
                  <button 
                    className="play-btn"
                    onClick={() => toggleExpand(podcast._id)}
                    title="Show episodes"
                  >
                    {expandedPodcastId === podcast._id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                </span>
              </div>
              {expandedPodcastId === podcast._id && podcast.episodes && podcast.episodes.length > 0 && (
                <div className="episodes-list">
                  {podcast.episodes.map((ep, idx) => (
                    <div className="episode-row" key={idx}>
                      <span className="episode-title">{ep.title}</span>
                      <div>
                        <span className="episode-duration">{formatDuration(ep.duration)}</span>
                        <button
                          className="play-btn"
                          onClick={() => handlePlayEpisode(podcast, ep)}
                          disabled={!ep.audioUrl}
                          title={ep.audioUrl ? 'Play Episode' : 'No audio available'}
                        >
                          <Play size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  )
}

export default Podcasts
