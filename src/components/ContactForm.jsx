import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

const EMPTY = { name: '', email: '', phone: '', service: '', description: '' }

export default function ContactForm({ services = [] }) {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please add your name and a valid email address.')
      return
    }
    if (!db) {
      setError('The contact form is not connected yet. Please try again later.')
      return
    }
    setStatus('sending')
    try {
      await addDoc(collection(db, 'enquiries'), {
        name: form.name.trim().slice(0, 119),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service: form.service,
        description: form.description.trim().slice(0, 2999),
        status: 'new',
        createdAt: serverTimestamp(),
      })
      setForm(EMPTY)
      setStatus('sent')
    } catch {
      setStatus('idle')
      setError('Something went wrong sending your message. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done">
        <span className="mono accent">// message received</span>
        <h3>Thanks, I'll be in touch soon.</h3>
        <button className="btn btn-ghost" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <label>Name<input value={form.name} onChange={set('name')} maxLength={119} required /></label>
      <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
      <label>Phone / WhatsApp <em>optional</em><input value={form.phone} onChange={set('phone')} /></label>
      <label>What do you need?
        <select value={form.service} onChange={set('service')}>
          <option value="">Not sure yet</option>
          {services.map((s) => <option key={s.id}>{s.title}</option>)}
        </select>
      </label>
      <label className="full">Tell me about the project
        <textarea rows={5} value={form.description} onChange={set('description')} maxLength={2999} />
      </label>
      {error && <p className="form-error full" role="alert">{error}</p>}
      <button className="btn full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send enquiry →'}
      </button>
    </form>
  )
}
