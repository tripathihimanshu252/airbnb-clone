import React, { useEffect, useState } from 'react'
import API from '../api'

export default function Bookings() {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    API.get('/bookings')
      .then(res => setBookings(res.data.bookings || []))
      .catch(err => {
        console.error(err)
        alert('Could not load bookings (are you logged in?)')
      })
  }, [])

  const cancel = async id => {
    if (!confirm('Cancel this booking?')) return
    try {
      await API.delete(`/bookings/${id}`)
      setBookings(b => b.filter(x => x._id !== id))
    } catch (err) {
      console.error(err)
      alert('Cancel failed')
    }
  }

  return (
    <div>
      <h2>My Bookings</h2>
      <ul>
        {bookings.map(b => (
          <li key={b._id}>
            {b.listing?.title} — {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()} — ${b.totalPrice}
            <button onClick={() => cancel(b._id)} style={{ marginLeft: 8 }}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
