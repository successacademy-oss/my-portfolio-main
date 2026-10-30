import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <span className="mono">© {new Date().getFullYear()} SUCCESS ACADEMY TECH</span>
      <span className="mono dim">Built to load fast, read well and work everywhere.</span>
      <Link to="/admin" className="mono dim">Admin</Link>
    </footer>
  )
}
