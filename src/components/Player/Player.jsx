import './Player.css'
import React, { useState, useEffect, useRef } from 'react'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Headphones, ChevronUp, XIcon } from 'lucide-react';
import { getCurrentPodcast, setCurrentPodcast } from '../../api';

const Player = () => {
  const [isFull, setIsFull] = useState(false)
  const [current, setCurrent] = useState({ podcast: null, episode: null })
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeat, setRepeat] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
  const audioRef = useRef(null)

  const handleClick = () => {
    setIsFull(!isFull)
  }

  useEffect(() => {
    const playerElement = document.querySelector(".player")
    if (playerElement) {
      if (isFull) {
        playerElement.classList.add("full")
      } else {
        playerElement.classList.remove("full")
      }
    }
  }, [isFull])

  useEffect(() => {
    const fetchCurrent = async () => {
      const data = await getCurrentPodcast()
      setCurrent(data || { podcast: null, episode: null })
    }
    fetchCurrent()
    const interval = setInterval(fetchCurrent, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying && userInteracted) {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, current.episode?.audioUrl, userInteracted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const updateProgress = () => {
      setProgress(audio.currentTime)
      setDuration(audio.duration || 0)
    }
    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateProgress)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [current.episode?.audioUrl, repeat])

  const { podcast, episode } = current

  const handlePlayPause = () => {
    setUserInteracted(true)
    setIsPlaying((prev) => !prev)
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }

  const handleSeek = (e) => {
    setUserInteracted(true)
    const audio = audioRef.current
    if (!audio) return
    const seekTime = (e.target.value / 100) * duration
    audio.currentTime = seekTime
    setProgress(seekTime)
  }

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '00:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSkip = async (dir) => {
    if (!podcast || !podcast.episodes || !episode) return
    const currentIndex = podcast.episodes.findIndex(
      ep => ep.title === episode.title && ep.audioUrl === episode.audioUrl
    )
    let newIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0) newIndex = 0
    if (newIndex >= podcast.episodes.length) newIndex = podcast.episodes.length - 1
    await setCurrentPodcast(podcast._id, newIndex)
    setIsPlaying(false) 
  }
  const handleRepeat = () => {
    setRepeat((prev) => !prev)
  }
  function handleEnded() {
    if (repeat) {
      setProgress(0)
      setTimeout(() => {
        if (audioRef.current) audioRef.current.play().catch(() => setIsPlaying(false))
      }, 100)
    } else {
      handleSkip('next')
    }
  }


  useEffect(() => {
    setProgress(0)
    setIsPlaying(false)
  }, [episode?.audioUrl])

  return (
    <div className="player" >
      <div className="player-controls-mobile" onClick={handleClick}>
        <img src={podcast?.coverImage || require('../../data/download.jpeg')} alt="" />
        <p>{podcast ? podcast.title : 'podcast title'}</p>
        {isFull ? <XIcon  /> : <ChevronUp />}
      </div>
      <div className="player-header">
        <span className="player-logo"><Headphones /></span>
        <span className="player-title">Now Playing</span>
      </div>
      <div className="player-podcast-area">
        {podcast && episode ? (
          <>
            <img className="player-podcast-cover" src={podcast.coverImage || require('../../data/download.jpeg')} alt={podcast.title} />
            <div className="player-podcast-meta">
              <h3 className="player-podcast-title">{podcast.title}</h3>
              <h4 className="player-episode-title">{episode.title}</h4>
            </div>
            <audio ref={audioRef} style={{ width: '100%', marginTop: 12 }}>
              <source src={episode.audioUrl} type="audio/mpeg" />
            </audio>
          </>
        ) : (
          <span className="player-podcast-text">Select a<br/>podcast to listen to</span>
        )}
      </div>
      <div className="player-progress">
        <span className="player-time">{formatTime(progress)}</span>
        <input
          type="range"
          className="player-slider"
          min="0"
          max="100"
          value={duration ? (progress / duration) * 100 : 0}
          onChange={handleSeek}
        />
        <span className="player-time">{formatTime(duration)}</span>
      </div>
      <div className="player-controls">
        <button className="player-btn" title="Shuffle" ><Shuffle /></button>
        <button className="player-btn" title="Previous" onClick={() => handleSkip('prev')}><SkipBack /></button>
        <button className="player-btn player-btn-play" title={isPlaying ? 'Pause' : 'Play'} onClick={handlePlayPause}>
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button className="player-btn" title="Next" onClick={() => handleSkip('next')}><SkipForward /></button>
        <button className={`player-btn${repeat ? ' active' : ''}`} title="Repeat" onClick={handleRepeat}><Repeat /></button>
      </div>
    </div>
  )
};

export default Player
