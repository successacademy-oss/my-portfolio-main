import { Link } from 'react-router-dom'
import { DEFAULT_HOME, DEFAULT_SERVICES, loadHome, loadPublishedProjects, loadServices, useAsync } from '../lib/data.js'
import ProjectCard, { ProjectSkeleton } from '../components/ProjectCard.jsx'
import ContactForm from '../components/ContactForm.jsx'

export default function Home() {
  const home = useAsync(loadHome).data || DEFAULT_HOME
  const services = useAsync(loadServices).data || DEFAULT_SERVICES
  const projects = useAsync(loadPublishedProjects)
  const featured = (projects.data || []).slice(0, 4)
  const waLink = home.whatsapp && `https://wa.me/${home.whatsapp.replace(/\D/g, '')}`

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="mono accent reveal" style={{ '--d': 0 }}>
            {'>'} web developer{home.location ? ` · ${home.location}` : ''}
          </span>
          <h1 className="reveal" style={{ '--d': 1 }}>{home.headline}</h1>
          <p className="lead reveal" style={{ '--d': 2 }}>{home.tagline}</p>
          <div className="hero-cta reveal" style={{ '--d': 3 }}>
            <Link to="/#contact" className="btn">Start a project →</Link>
            <Link to="/projects" className="btn btn-ghost">See my work</Link>
          </div>
        </div>
        <div className="hero-visual reveal" style={{ '--d': 2 }}>
          {home.photoUrl
            ? <img src={home.photoUrl} alt={home.name} />
            : <div className="hero-mark" aria-hidden="true">S/</div>}
          <span className="hero-badge mono">available for new work</span>
        </div>
      </section>

      <section className="about">
        <span className="section-label mono">01 / About</span>
        <p className="about-text">{home.about}</p>
      </section>

      <section id="services" className="services">
        <span className="section-label mono">02 / Services</span>
        <div className="service-grid">
          {services.map((s, i) => (
            <article key={s.id} className="service" style={{ '--i': i }}>
              <span className="mono accent">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="work">
        <div className="section-head">
          <span className="section-label mono">03 / Selected work</span>
          {featured.length > 0 && <Link to="/projects" className="mono link">All projects →</Link>}
        </div>
        {projects.loading ? (
          <div className="project-grid"><ProjectSkeleton /><ProjectSkeleton /></div>
        ) : featured.length ? (
          <div className="project-grid">{featured.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}</div>
        ) : (
          <div className="empty"><span className="mono dim">// projects coming soon</span></div>
        )}
      </section>

      <section id="contact" className="contact">
        <div className="contact-intro">
          <span className="section-label mono">04 / Contact</span>
          <h2>Got a project in mind?</h2>
          <p>Tell me what you need and I'll reply with ideas, a timeline and a price.</p>
          <ul className="contact-links mono">
            {home.email && <li><a href={`mailto:${home.email}`}>{home.email}</a></li>}
            {home.phone && <li><a href={`tel:${home.phone}`}>{home.phone}</a></li>}
            {waLink && <li><a href={waLink} target="_blank" rel="noreferrer">WhatsApp</a></li>}
            {home.github && <li><a href={home.github} target="_blank" rel="noreferrer">GitHub</a></li>}
            {home.linkedin && <li><a href={home.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
          </ul>
        </div>
        <ContactForm services={services} />
      </section>
    </>
  )
}
