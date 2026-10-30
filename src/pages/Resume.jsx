import { driveLinks, loadResume, useAsync } from '../lib/data.js'

export default function Resume() {
  const { loading, data } = useAsync(loadResume)
  const links = data?.pdfUrl ? driveLinks(data.pdfUrl) : null
  return (
    <section className="page">
      <span className="section-label mono">Resume</span>
      <h1>Experience & skills</h1>
      {data?.summary && <p className="lead">{data.summary}</p>}
      {loading ? (
        <div className="resume-frame skeleton" />
      ) : links ? (
        <>
          <div className="hero-cta">
            <a href={links.download} className="btn">Download PDF ↓</a>
            <a href={data.pdfUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">Open in new tab</a>
          </div>
          <iframe className="resume-frame" src={links.preview} title="Resume" allow="autoplay" />
        </>
      ) : (
        <div className="empty"><span className="mono dim">// resume coming soon</span></div>
      )}
    </section>
  )
}
