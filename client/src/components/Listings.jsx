import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'

export default function Listings() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    API.get('/listings')
      .then(res => setListings(res.data.listings || res.data))
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>Listings</h2>
      <div className="grid">
        {listings.map(l => {
          const img = l.images?.[0]?.url || l.image?.url || `https://picsum.photos/seed/${l._id || encodeURIComponent(l.title)}/800/500`;
          return (
            <div key={l._id} className="card listing-card">
              <Link to={`/listings/${l._id}`} className="card-link">
                <div className="media"><img src={img} alt={l.title} /></div>
                <div className="card-body">
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <h3 className="title">{l.title || 'Untitled'}</h3>
                    <div className="rating">{l.rating ? l.rating.toFixed(1) : '—'}</div>
                  </div>
                  <div className="muted">{l.location}{l.country ? ` • ${l.country}` : ''}</div>
                  <div className="price">${l.price}</div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
