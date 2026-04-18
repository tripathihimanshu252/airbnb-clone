import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email)
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const validation = useMemo(() => {
    const errors = {}
    if (mode === 'register' && form.name.trim().length < 1) errors.name = 'Name is required'
    if (!validateEmail(form.email)) errors.email = 'Enter a valid email'
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'
    return errors
  }, [mode, form])

  const submit = async e => {
    e.preventDefault()
    setError(null)
    if (Object.keys(validation).length) {
      setError('Please fix validation errors')
      return
    }
    setLoading(true)
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await API.post(url, form)
      localStorage.setItem('token', res.data.token)
      nav('/')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={submit} className="form-grid">
        {mode === 'register' && (
          <label className="form-row">Name
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {validation.name && <small className="field-error">{validation.name}</small>}
          </label>
        )}
        <label className="form-row">Email
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          {validation.email && <small className="field-error">{validation.email}</small>}
        </label>
        <label className="form-row">Password
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {validation.password && <small className="field-error">{validation.password}</small>}
        </label>
        <div className="form-row">
          <button className="btn" type="submit" disabled={loading || Object.keys(validation).length}>{loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Register')}</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}>{mode === 'login' ? 'Switch to Register' : 'Switch to Login'}</button>
        </div>
      </form>
    </div>
  )
}
