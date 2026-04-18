import React, { useState, useEffect, useRef } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function CreateListing() {
  const [form, setForm] = useState({ title: '', description: '', price: '', location: '', country: '' })
  const [images, setImages] = useState([]) // {id,file,preview,progress}
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [useMock, setUseMock] = useState(true)
  const nav = useNavigate()
  const dropRef = useRef(null)

  useEffect(() => {
    return () => {
      images.forEach(img => img.preview && URL.revokeObjectURL(img.preview))
    }
  }, [images])

  const addFiles = files => {
    const arr = Array.from(files).slice(0, 8).map((f, i) => ({ id: `${Date.now()}-${i}`, file: f, preview: URL.createObjectURL(f), progress: 0 }))
    setImages(prev => [...prev, ...arr])
  }

  const onFileChange = e => {
    if (!e.target.files) return
    addFiles(e.target.files)
    e.target.value = null
  }

  const onDrop = e => {
    e.preventDefault()
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
  }

  const onDragOver = e => { e.preventDefault() }

  const removeImage = id => {
    setImages(prev => {
      const found = prev.find(p => p.id === id)
      if (found && found.preview) URL.revokeObjectURL(found.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.title || !form.price) return alert('Title and price required')
    if (images.length === 0) return alert('Please add at least one image')
    setLoading(true)
    setProgress(0)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('location', form.location)
      fd.append('country', form.country)
      images.forEach(img => fd.append('images', img.file, img.file.name))

      const endpoint = useMock ? '/listings/upload-mock' : '/listings/upload-multiple'
      const res = await API.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const p = Math.round((event.loaded * 100) / event.total)
            setProgress(p)
          }
        }
      })

      nav(`/listings/${res.data.listing._id}`)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="card">
      <h2>Create Listing</h2>
      <form onSubmit={submit} className="form-grid">
        <label className="form-row">Title
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label className="form-row">Price
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        </label>
        <label className="form-row">Location
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </label>
        <label className="form-row">Country
          <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
        </label>
        <label className="form-row">Description
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </label>

        <div className="form-row">
          <div
            ref={dropRef}
            className="dropzone"
            onDrop={onDrop}
            onDragOver={onDragOver}
            style={{ padding: 12 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input id="file" type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: 'none' }} />
              <label htmlFor="file" className="btn">Select Images</label>
              <div style={{ marginLeft: 8 }}>or drag & drop images here (max 8)</div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="preview-grid" style={{ marginTop: 10 }}>
              {images.map(img => (
                <div key={img.id} className="preview-cell">
                  <img src={img.preview} alt="preview" />
                  <button type="button" className="btn btn-ghost" onClick={() => removeImage(img.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="form-row">
            <div className="progress-bar"><div className="progress-inner" style={{ width: `${progress}%` }} /></div>
            <small>{progress}%</small>
          </div>
        )}

        <label className="form-row">
          <input type="checkbox" checked={useMock} onChange={e => setUseMock(e.target.checked)} /> Use mock upload (no Cloudinary required)
        </label>

        <div className="form-row">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Uploading…' : 'Create'}</button>
        </div>
      </form>
    </div>
  )
}
