import { Link, useLoaderData } from '@tanstack/react-router'
import type { Project } from '../data/projects'

export default function ProjectDetailPage() {
  const project = useLoaderData({ from: '/projects/$slug' }) as Project

  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-200"
      >
        &larr; Back to projects
      </Link>

      <h1 className="text-3xl font-bold text-white sm:text-4xl">{project.name}</h1>
      <p className="mt-2 text-lg text-blue-300">{project.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span
            key={t}
            className="rounded-full bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-300"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          Visit Site &rarr;
        </a>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            View on GitHub
          </a>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">About this project</h2>
        <p className="mt-3 leading-relaxed text-slate-300">{project.description}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Key Features</h2>
        <ul className="mt-3 space-y-2">
          {project.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
