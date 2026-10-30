import { useEffect, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore'
import { auth, db, firebaseReady } from '../firebase.js'
import { DEFAULT_HOME, driveLinks, lines, tags } from '../lib/data.js'

export default function Admin() {
  const [user, setUser] = useState(undefined)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, async (u) => {
      setIsAdmin(u ? (await getDoc(doc(db, 'admins', u.uid)).catch(() => null))?.exists() ?? false : false)
      setUser(u)
    })
  }, [])

  if (!firebaseReady) {
    return (
      <AdminShell>
        <div className="panel">
          <h2>Firebase isn't configured</h2>
          <p>Add the five VITE_FIREBASE_* environment variables in Netlify and redeploy. See the README.</p>
        </div>
      </AdminShell>
    )
  }
  if (user === undefined) return <AdminShell><p className="mono dim">Checking session…</p></AdminShell>
  if (!user) return <AdminShell><Login /></AdminShell>
  if (!isAdmin) {
    return (
      <AdminShell>
        <div className="panel">
          <h2>Not an administrator</h2>
          <p>{user.email} is signed in but has no document in the <code>admins</code> collection.</p>
          <button className="btn btn-ghost" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell user={user}>
      <nav className="admin-tabs">
        <NavLink to="/admin/home">Homepage</NavLink>
        <NavLink to="/admin/services">Services</NavLink>
        <NavLink to="/admin/projects">Projects</NavLink>
        <NavLink to="/admin/resume">Resume</NavLink>
        <NavLink to="/admin/enquiries">Enquiries</NavLink>
      </nav>
      <Routes>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomeEditor />} />
        <Route path="services" element={<ServicesEditor />} />
        <Route path="projects" element={<ProjectsEditor />} />
        <Route path="resume" element={<ResumeEditor />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Routes>
    </AdminShell>
  )
}

function AdminShell({ user, children }) {
  return (
    <div className="admin">
      <header className="admin-head">
        <a href="/" className="logo"><span>S/</span>admin</a>
        {user && (
          <span className="mono dim">
            {user.email} · <button className="link-btn" onClick={() => signOut(auth)}>sign out</button>
          </span>
        )}
      </header>
      {children}
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Wrong email or password.')
    }
    setBusy(false)
  }
  return (
    <form className="panel login" onSubmit={submit}>
      <h2>Sign in</h2>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

function useSaved() {
  const [msg, setMsg] = useState('')
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  return [msg, flash]
}

function Field({ label, hint, className, ...props }) {
  return (
    <label className={className}>
      {label}{hint && <em>{hint}</em>}
      {props.rows ? <textarea {...props} /> : <input {...props} />}
    </label>
  )
}

function HomeEditor() {
  const [data, setData] = useState(null)
  const [msg, flash] = useSaved()
  useEffect(() => {
    getDoc(doc(db, 'site', 'home')).then((s) => setData({ ...DEFAULT_HOME, ...(s.exists() ? s.data() : {}) }))
  }, [])
  if (!data) return <p className="mono dim">Loading…</p>
  const f = (k) => ({ value: data[k] || '', onChange: (e) => setData({ ...data, [k]: e.target.value }) })
  async function save(e) {
    e.preventDefault()
    try { await setDoc(doc(db, 'site', 'home'), data); flash('Homepage saved.') } catch { flash('Save failed.') }
  }
  return (
    <form className="panel grid-form" onSubmit={save}>
      <h2 className="full">Homepage</h2>
      <Field label="Headline" {...f('headline')} />
      <Field label="Location" hint="optional" {...f('location')} />
      <Field className="full" label="Tagline" rows={2} {...f('tagline')} />
      <Field label="About" rows={5} {...f('about')} />
      <Field label="Profile photo link" hint="Cloudinary URL" {...f('photoUrl')} />
      <Field label="Email" type="email" {...f('email')} />
      <Field label="Phone" {...f('phone')} />
      <Field label="WhatsApp number" hint="with country code" {...f('whatsapp')} />
      <Field label="GitHub URL" {...f('github')} />
      <Field label="LinkedIn URL" {...f('linkedin')} />
      {data.photoUrl && <img className="preview" src={data.photoUrl} alt="Profile preview" />}
      <div className="full save-row"><button className="btn">Save homepage</button><span className="mono accent">{msg}</span></div>
    </form>
  )
}

function ServicesEditor() {
  const [items, setItems] = useState(null)
  const [msg, flash] = useSaved()
  const reload = () => getDocs(collection(db, 'services')).then((s) =>
    setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0))))
  useEffect(() => { reload() }, [])
  if (!items) return <p className="mono dim">Loading…</p>

  const update = (i, k, v) => setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
  async function save(it, i) {
    const data = { title: it.title || '', description: it.description || '', order: i }
    try {
      if (it.id) await setDoc(doc(db, 'services', it.id), data)
      else await addDoc(collection(db, 'services'), data)
      flash('Service saved.')
      reload()
    } catch { flash('Save failed.') }
  }
  async function remove(it) {
    if (!it.id) return setItems(items.filter((x) => x !== it))
    if (!confirm(`Delete "${it.title}"?`)) return
    await deleteDoc(doc(db, 'services', it.id))
    reload()
  }
  return (
    <div className="panel">
      <h2>Services</h2>
      <p className="dim">Until you add one, the site shows four default services.</p>
      {items.map((it, i) => (
        <div className="row-card" key={it.id || `new-${i}`}>
          <Field label="Title" value={it.title || ''} onChange={(e) => update(i, 'title', e.target.value)} />
          <Field label="Description" rows={2} value={it.description || ''} onChange={(e) => update(i, 'description', e.target.value)} />
          <div className="save-row">
            <button className="btn btn-sm" onClick={() => save(it, i)}>Save</button>
            <button className="btn btn-sm btn-ghost" onClick={() => remove(it)}>Delete</button>
          </div>
        </div>
      ))}
      <div className="save-row">
        <button className="btn btn-ghost" onClick={() => setItems([...items, { title: '', description: '' }])}>+ Add service</button>
        <span className="mono accent">{msg}</span>
      </div>
    </div>
  )
}

const EMPTY_PROJECT = {
  title: '', summary: '', description: '', thumbnail: '', screenshots: '', tags: '', liveUrl: '', repoUrl: '', order: 0, published: false,
}

function ProjectsEditor() {
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [msg, flash] = useSaved()
  const reload = () => getDocs(collection(db, 'projects')).then((s) =>
    setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0))))
  useEffect(() => { reload() }, [])
  if (!items) return <p className="mono dim">Loading…</p>

  function edit(p) {
    setEditing(p
      ? { ...EMPTY_PROJECT, ...p, screenshots: (p.screenshots || []).join('\n'), tags: (p.tags || []).join(', ') }
      : { ...EMPTY_PROJECT, order: items.length })
  }
  async function save(e) {
    e.preventDefault()
    const { id, ...rest } = editing
    const data = { ...rest, screenshots: lines(rest.screenshots), tags: tags(rest.tags), order: Number(rest.order) || 0, updatedAt: serverTimestamp() }
    try {
      if (id) await setDoc(doc(db, 'projects', id), data)
      else await addDoc(collection(db, 'projects'), { ...data, createdAt: serverTimestamp() })
      flash('Project saved.')
      setEditing(null)
      reload()
    } catch { flash('Save failed.') }
  }
  async function remove(p) {
    if (!confirm(`Delete "${p.title}"?`)) return
    await deleteDoc(doc(db, 'projects', p.id))
    reload()
  }

  if (editing) {
    const f = (k) => ({ value: editing[k] ?? '', onChange: (e) => setEditing({ ...editing, [k]: e.target.value }) })
    return (
      <form className="panel grid-form" onSubmit={save}>
        <h2 className="full">{editing.id ? 'Edit project' : 'New project'}</h2>
        <Field label="Title" required {...f('title')} />
        <Field label="Order" hint="lower shows first" type="number" {...f('order')} />
        <Field className="full" label="Short summary" {...f('summary')} />
        <Field label="Description" hint="blank line = new paragraph" rows={6} {...f('description')} />
        <Field label="Screenshot links" hint="one per line" rows={6} {...f('screenshots')} />
        <Field label="Thumbnail link" hint="Cloudinary URL" {...f('thumbnail')} />
        <Field label="Tags" hint="comma separated" {...f('tags')} />
        <Field label="Live site URL" {...f('liveUrl')} />
        <Field label="Code / repo URL" {...f('repoUrl')} />
        <label className="check full">
          <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
          Published (visible on the public site)
        </label>
        <div className="full save-row">
          <button className="btn">Save project</button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          <span className="mono accent">{msg}</span>
        </div>
      </form>
    )
  }

  return (
    <div className="panel">
      <div className="save-row"><h2>Projects</h2><button className="btn btn-sm" onClick={() => edit(null)}>+ New project</button><span className="mono accent">{msg}</span></div>
      {items.length === 0 && <p className="dim">No projects yet.</p>}
      <table className="table">
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td className="mono">{p.published ? <span className="accent">published</span> : <span className="dim">draft</span>}</td>
              <td className="actions">
                <button className="link-btn" onClick={() => edit(p)}>edit</button>
                <button className="link-btn" onClick={() => remove(p)}>delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResumeEditor() {
  const [data, setData] = useState(null)
  const [msg, flash] = useSaved()
  useEffect(() => { getDoc(doc(db, 'site', 'resume')).then((s) => setData(s.exists() ? s.data() : { pdfUrl: '', summary: '' })) }, [])
  if (!data) return <p className="mono dim">Loading…</p>
  async function save(e) {
    e.preventDefault()
    try { await setDoc(doc(db, 'site', 'resume'), data); flash('Resume saved.') } catch { flash('Save failed.') }
  }
  return (
    <form className="panel" onSubmit={save}>
      <h2>Resume</h2>
      <Field label="Resume PDF link" hint="Google Drive share link" value={data.pdfUrl || ''} onChange={(e) => setData({ ...data, pdfUrl: e.target.value })} />
      <Field label="Short intro" hint="optional" rows={3} value={data.summary || ''} onChange={(e) => setData({ ...data, summary: e.target.value })} />
      {data.pdfUrl && <iframe className="resume-frame small" src={driveLinks(data.pdfUrl).preview} title="Resume preview" />}
      <div className="save-row"><button className="btn">Save resume</button><span className="mono accent">{msg}</span></div>
    </form>
  )
}

function Enquiries() {
  const [items, setItems] = useState(null)
  const reload = () => getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')))
    .then((s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
  useEffect(() => { reload() }, [])
  if (!items) return <p className="mono dim">Loading…</p>

  async function toggle(e) {
    await updateDoc(doc(db, 'enquiries', e.id), { status: e.status === 'done' ? 'new' : 'done' })
    reload()
  }
  async function remove(e) {
    if (!confirm(`Delete enquiry from ${e.name}?`)) return
    await deleteDoc(doc(db, 'enquiries', e.id))
    reload()
  }
  return (
    <div className="panel">
      <h2>Enquiries <span className="mono dim">({items.filter((e) => e.status !== 'done').length} open)</span></h2>
      {items.length === 0 && <p className="dim">No enquiries yet.</p>}
      {items.map((e) => (
        <article key={e.id} className={`row-card enquiry ${e.status === 'done' ? 'done' : ''}`}>
          <div className="save-row">
            <strong>{e.name}</strong>
            <a className="mono" href={`mailto:${e.email}`}>{e.email}</a>
            {e.phone && <span className="mono dim">{e.phone}</span>}
            {e.service && <span className="tag">{e.service}</span>}
            <span className="mono dim">{e.createdAt?.toDate?.().toLocaleString()}</span>
          </div>
          {e.description && <p>{e.description}</p>}
          <div className="save-row">
            <button className="btn btn-sm btn-ghost" onClick={() => toggle(e)}>{e.status === 'done' ? 'Reopen' : 'Mark done'}</button>
            <button className="link-btn" onClick={() => remove(e)}>delete</button>
          </div>
        </article>
      ))}
    </div>
  )
}
