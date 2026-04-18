import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Listings from './components/Listings'
import ListingDetail from './components/ListingDetail'
import Auth from './components/Auth'
import Bookings from './components/Bookings'
import CreateListing from './components/CreateListing'

export default function App() {
  return (
    <div>
      <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/bookings">My Bookings</Link>
      </header>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>
    </div>
  )
}
