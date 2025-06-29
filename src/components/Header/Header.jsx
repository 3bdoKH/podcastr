import './Header.css'
import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../logo.svg'

const Header = () => {
  return (
    <header>
      <div className="logo">
        <img src={logo} alt="" />
        <span>Podcastr</span>
      </div>
      <p>The best for you to hear, always</p>
      <div className="header-actions">
        <div className="date">
          {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        <Link to="/admin" className="admin-link">Admin</Link>
      </div>
    </header>
  )
}

export default Header
