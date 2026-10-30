import { Link } from 'react-router-dom'

export default function ProjectCard({ project, index }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card" style={{ '--i': index }}>
      <div className="thumb">
        {project.thumbnail
          ? <img src={project.thumbnail} alt="" loading="lazy" />
          : <span className="thumb-fallback">{(project.title || '?').slice(0, 2)}</span>}
      </div>
      <div className="project-meta">
        <span className="mono dim">{String(index + 1).padStart(2, '0')}</span>
        <h3>{project.title}</h3>
        {project.summary && <p>{project.summary}</p>}
        {project.tags?.length > 0 && (
          <ul className="tags">{project.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        )}
      </div>
    </Link>
  )
}

export function ProjectSkeleton() {
  return (
    <div className="project-card skeleton">
      <div className="thumb" />
      <div className="project-meta"><div className="sk-line" /><div className="sk-line short" /></div>
    </div>
  )
}
