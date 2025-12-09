import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [ip, setIp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/ip')
      .then(res => res.json())
      .then(data => {
        setIp(data.ip)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching IP:', err)
        setIp('Error')
        setLoading(false)
      })
  }, [])

  return (
    <div className="container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="glass-card">
        <h1 className="title">Your IP Address</h1>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="ip-display">
            <span className="ip-text">{ip}</span>
            <div className="status-indicator"></div>
          </div>
        )}
        <p className="subtitle">Secure • Fast • Reliable</p>
      </div>
    </div>
  )
}

export default App
