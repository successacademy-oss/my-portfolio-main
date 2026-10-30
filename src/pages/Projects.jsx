import { loadPublishedProjects, useAsync } from '../lib/data.js'
import ProjectCard, { ProjectSkeleton } from '../components/ProjectCard.jsx'

export default function Projects() {
  const { loading, data, error } = useAsync(loadPublishedProjects)
  return (
    <section className="page">
      <span className="section-label mono">Work</span>
      <h1>Projects</h1>
      {loading ? (
        <div className="project-grid"><ProjectSkeleton /><ProjectSkeleton /><ProjectSkeleton /></div>
      ) : error ? (
        <div className="empty"><span className="mono">Couldn't load projects. Please refresh.</span></div>
      ) : data.length ? (
        <div className="project-grid">{data.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}</div>
      ) : (
        <div className="empty"><span className="mono dim">// projects coming soon</span></div>
      )}
    </section>
  )
}
