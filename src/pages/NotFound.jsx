import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page not-found">
      <span className="mono accent">404</span>
      <h1>This page doesn't exist.</h1>
      <Link to="/" className="btn">Go home</Link>
    </section>
  )
}
