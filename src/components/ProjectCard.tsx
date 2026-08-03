import { Link } from '@tanstack/react-router'
import type { Project } from '../data/projects'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-blue-400/30 hover:bg-white/10"
    >
      <h3 className="text-lg font-semibold text-white transition group-hover:text-blue-300">
        {project.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
        {project.tagline}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {project.appStore && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
            App Store
          </span>
        )}
        {project.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-full bg-blue-400/10 px-2.5 py-0.5 text-xs font-medium text-blue-300"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  )
}
