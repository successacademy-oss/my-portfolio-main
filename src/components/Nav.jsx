import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <header className="nav">
      <Link to="/" className="logo" onClick={close}><span>S/</span>SUCCESS ACADEMY TECH</Link>
      <button className="nav-toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
        {open ? '×' : '≡'}
      </button>
      <nav className={open ? 'open' : ''}>
        <Link to="/#services" onClick={close}>Services</Link>
        <NavLink to="/projects" onClick={close}>Work</NavLink>
        <NavLink to="/resume" onClick={close}>Resume</NavLink>
        <Link to="/#contact" className="btn btn-sm" onClick={close}>Start a project</Link>
      </nav>
    </header>
  )
}
