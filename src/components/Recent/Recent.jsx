import './Recent.css'
import React, { useEffect, useState } from 'react'
import Box from '../Box/Box'
import { getPodcasts } from '../../api'

const Recent = () => {
  const [recentPodcasts, setRecentPodcasts] = useState([])

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const podcasts = await getPodcasts()
        setRecentPodcasts(podcasts.slice(0, 2))
      } catch (err) {
        setRecentPodcasts([])
      }
    }
    fetchRecent()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  return (
    <div className='recent'>
      <h2>Latest releases</h2>
      <div className="box-container">
        {recentPodcasts.length === 0 ? (
          <p>No recent podcasts found.</p>
        ) : (
          recentPodcasts.map((podcast) => (
            <Box
              key={podcast._id}
              img={podcast.coverImage || '/image.png'}
              title={podcast.title}
              author={podcast.author || 'Unknown'}
              date={formatDate(podcast.createdAt)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Recent
