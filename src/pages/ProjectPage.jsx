import { Link, useParams } from 'react-router-dom'
import { loadProject, useAsync } from '../lib/data.js'

export default function ProjectPage() {
  const { id } = useParams()
  const { loading, data: p, error } = useAsync(() => loadProject(id), [id])

  if (loading) return <section className="page"><div className="sk-line" /><div className="sk-line short" /></section>
  if (error || !p) {
    return (
      <section className="page">
        <h1>Project not found</h1>
        <Link to="/projects" className="btn btn-ghost">← Back to projects</Link>
      </section>
    )
  }

  return (
    <article className="page project-page">
      <Link to="/projects" className="mono link">← All projects</Link>
      <h1>{p.title}</h1>
      {p.summary && <p className="lead">{p.summary}</p>}
      {p.tags?.length > 0 && <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
      <div className="hero-cta">
        {p.liveUrl && <a href={p.liveUrl} className="btn" target="_blank" rel="noreferrer">Visit live site →</a>}
        {p.repoUrl && <a href={p.repoUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">View code</a>}
      </div>
      {p.thumbnail && <img className="project-hero" src={p.thumbnail} alt="" />}
      {p.description && <div className="prose">{p.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}</div>}
      {p.screenshots?.length > 0 && (
        <div className="shots">{p.screenshots.map((s) => <img key={s} src={s} alt="" loading="lazy" />)}</div>
      )}
    </article>
  )
}
