import './admin.css'
import React, { useState, useEffect } from 'react'
import { addPodcast, getPodcasts, deletePodcast } from '../api'

const Admin = () => {
  const [rssFeed, setRssFeed] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [podcasts, setPodcasts] = useState([])
  const [loadingPodcasts, setLoadingPodcasts] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [authenticated, setAuthenticated] = useState(localStorage.getItem('adminAuthenticated'))
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  useEffect(() => {
    if (authenticated) fetchPodcasts()
  }, [authenticated])

  const fetchPodcasts = async () => {
    try {
      setLoadingPodcasts(true)
      const data = await getPodcasts()
      setPodcasts(data)
    } catch (error) {
      console.error('Error fetching podcasts:', error)
      setMessage('Failed to load podcasts')
      setMessageType('error')
    } finally {
      setLoadingPodcasts(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        localStorage.setItem('adminAuthenticated', 'true')
        setAuthenticated(true)
        setLoginUsername('')
        setLoginPassword('')
      } else {
        setLoginError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.')
      console.log(err)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    setAuthenticated(false)
    setPodcasts([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!rssFeed.trim()) {
      setMessage('Please enter an RSS feed URL')
      setMessageType('error')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const result = await addPodcast(rssFeed)
      if (result.message) {
        setMessage(result.message)
        setMessageType('error')
      } else {
        setMessage('Podcast added successfully!')
        setMessageType('success')
        setRssFeed('')
        fetchPodcasts()
      }
    } catch (error) {
      console.error('Error adding podcast:', error)
      setMessage('Failed to add podcast. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this podcast?')) return
    setDeletingId(id)
    setMessage('')
    try {
      const result = await deletePodcast(id)
      if (result.message === 'Podcast deleted') {
        setMessage('Podcast deleted successfully!')
        setMessageType('success')
        fetchPodcasts()
      } else {
        setMessage(result.message || 'Failed to delete podcast')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Failed to delete podcast. Please try again.')
      setMessageType('error')
    } finally {
      setDeletingId(null)
    }
  }

  const clearMessage = () => {
    setMessage('')
    setMessageType('')
  }

  if (!authenticated) {
    return (
      <div className="admin-login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-username">Username:</label>
            <input
              type="text"
              id="admin-username"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              required
              disabled={loginLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password:</label>
            <input
              type="password"
              id="admin-password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
              disabled={loginLoading}
            />
          </div>
          <button type="submit" disabled={loginLoading} className="submit-btn">
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
          {loginError && <div className="message error">{loginError}</div>}
        </form>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Podcast Admin Panel</h1>
        <p>Add new podcasts to the database using RSS feed URLs</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="admin-content">
        <div className="add-podcast-section">
          <h2>Add New Podcast</h2>
          <form onSubmit={handleSubmit} className="add-podcast-form">
            <div className="form-group">
              <label htmlFor="rssFeed">RSS Feed URL:</label>
              <input
                type="url"
                id="rssFeed"
                value={rssFeed}
                onChange={(e) => setRssFeed(e.target.value)}
                placeholder="https://example.com/feed.xml"
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !rssFeed.trim()}
              className="submit-btn"
            >
              {loading ? 'Adding Podcast...' : 'Add Podcast'}
            </button>
          </form>

          {message && (
            <div className={`message ${messageType}`}>
              <span>{message}</span>
              <button onClick={clearMessage} className="close-btn">×</button>
            </div>
          )}
        </div>
        <div className="podcasts-section">
          <h2>Existing Podcasts ({podcasts.length})</h2>
          
          {loadingPodcasts ? (
            <div className="loading">Loading podcasts...</div>
          ) : podcasts.length === 0 ? (
            <div className="no-podcasts">No podcasts found. Add your first podcast above!</div>
          ) : (
            <div className="podcasts-grid">
              {podcasts.map((podcast) => (
                <div key={podcast._id} className="podcast-card">
                  <div className="podcast-cover">
                    {podcast.coverImage ? (
                      <img src={podcast.coverImage} alt={podcast.title} />
                    ) : (
                      <div className="no-cover">No Cover</div>
                    )}
                  </div>
                  <div className="podcast-info">
                    <h3>{podcast.title}</h3>
                    <p className="podcast-description">
                      {podcast.description ? 
                        podcast.description.substring(0, 100) + (podcast.description.length > 100 ? '...' : '') 
                        : 'No description available'
                      }
                    </p>
                    <p className="podcast-date">
                      Added: {new Date(podcast.createdAt).toLocaleDateString()}
                    </p>
                    {podcast.isPlaying && (
                      <span className="playing-badge">Currently Playing</span>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(podcast._id)}
                  >
                    {deletingId === podcast._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin 