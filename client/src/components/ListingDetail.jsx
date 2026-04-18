import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from '../api'

export default function ListingDetail() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [booking, setBooking] = useState({ startDate: '', endDate: '', totalPrice: '' })

  useEffect(() => {
    API.get(`/listings/${id}`).then(res => setListing(res.data.listing)).catch(console.error)
  }, [id])

  // Update featured image when listing loads
  useEffect(() => {
    if (listing && listing.images && listing.images.length) setMainImage(listing.images[0].url)
    else setMainImage(null)
  }, [listing])

  const handleBooking = async e => {
    e.preventDefault()
    try {
      const payload = { listingId: id, ...booking }
      await API.post('/bookings', payload)
      alert('Booking created')
      setBooking({ startDate: '', endDate: '', totalPrice: '' })
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Booking failed')
    }
  }

  if (!listing) return <div>Loading...</div>

  return (
    <div className="listing-detail">
      <div className="gallery">
        {mainImage && <img className="featured" src={mainImage} alt={listing.title} />}
        <div className="thumbs">
          {(listing.images || []).map((img) => (
            <img
              key={img.url}
              src={img.url}
              alt={`${listing.title} thumbnail`}
              onClick={() => setMainImage(img.url)}
              className={img.url === mainImage ? 'active' : ''}
            />
          ))}
        </div>
      </div>
      <div className="detail-body">
        <h2>{listing.title}</h2>
        <div className="muted">{listing.location} • {listing.country}</div>
        <p>{listing.description}</p>
        <p className="price">Price: ${listing.price}</p>

        <h3>Book this listing</h3>
        <form onSubmit={handleBooking} className="form-grid">
          <label className="form-row">Start: <input type="date" value={booking.startDate} onChange={e => setBooking({...booking, startDate: e.target.value})} required /></label>
          <label className="form-row">End: <input type="date" value={booking.endDate} onChange={e => setBooking({...booking, endDate: e.target.value})} required /></label>
          <label className="form-row">Total Price: <input type="number" value={booking.totalPrice} onChange={e => setBooking({...booking, totalPrice: e.target.value})} required /></label>
          <div className="form-row"><button className="btn" type="submit">Book</button></div>
        </form>
      </div>
    </div>
  )
}
