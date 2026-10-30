import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'

export const DEFAULT_HOME = {
  name: 'SUCCESS ACADEMY TECH',
  headline: 'Websites that work as hard as you do.',
  tagline: 'Modern, responsive websites, web apps and digital solutions for individuals, schools, churches and businesses.',
  about: 'I design and build fast, accessible websites and web applications. From a simple landing page to a full dashboard with logins and data, I handle the design, the code and the launch so you can focus on your work.',
  photoUrl: '',
  email: '',
  phone: '',
  whatsapp: '',
  location: '',
  github: '',
  linkedin: '',
}

export const DEFAULT_SERVICES = [
  { id: 'd1', title: 'Business websites', description: 'Clean, mobile-first sites that explain what you do and turn visitors into customers.' },
  { id: 'd2', title: 'School & church portals', description: 'Announcements, events, galleries and contact pages your team can update themselves.' },
  { id: 'd3', title: 'Web applications', description: 'Dashboards, booking systems and admin panels with secure logins and live data.' },
  { id: 'd4', title: 'Redesign & support', description: 'Refresh an outdated site, speed it up, fix bugs and keep it running smoothly.' },
]

const byOrder = (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)

export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true }))
    fn()
      .then((data) => live && setState({ loading: false, data, error: null }))
      .catch((error) => live && setState({ loading: false, data: null, error }))
    return () => { live = false }
  }, deps)
  return state
}

export async function loadHome() {
  if (!db) return DEFAULT_HOME
  const snap = await getDoc(doc(db, 'site', 'home'))
  return { ...DEFAULT_HOME, ...(snap.exists() ? snap.data() : {}) }
}

export async function loadResume() {
  if (!db) return {}
  const snap = await getDoc(doc(db, 'site', 'resume'))
  return snap.exists() ? snap.data() : {}
}

export async function loadServices() {
  if (!db) return DEFAULT_SERVICES
  const snap = await getDocs(collection(db, 'services'))
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder)
  return list.length ? list : DEFAULT_SERVICES
}

// Firestore rules only allow public reads of published projects, so the query must filter on it.
export async function loadPublishedProjects() {
  if (!db) return []
  const snap = await getDocs(query(collection(db, 'projects'), where('published', '==', true)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder)
}

export async function loadProject(id) {
  if (!db) return null
  const snap = await getDoc(doc(db, 'projects', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Turns a Google Drive share link into preview and download links.
export function driveLinks(url = '') {
  const m = url.match(/\/file\/d\/([^/?#]+)/) || url.match(/[?&]id=([^&#]+)/)
  if (!m) return { preview: url, download: url }
  return {
    preview: `https://drive.google.com/file/d/${m[1]}/preview`,
    download: `https://drive.google.com/uc?export=download&id=${m[1]}`,
  }
}

export const lines = (text = '') => text.split('\n').map((s) => s.trim()).filter(Boolean)
export const tags = (text = '') => text.split(',').map((s) => s.trim()).filter(Boolean)
