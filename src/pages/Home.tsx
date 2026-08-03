import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'
import FloatingText from '../components/FloatingText'

export default function HomePage() {
  return (
    <div>
      <section className="py-8 sm:py-16 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <FloatingText text="David Moritz" />
          </h1>
          <p className="mt-2 text-lg text-blue-300 font-medium">
            Full-Stack Developer
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400 leading-relaxed">
            I build modern web applications with React, TypeScript, and AWS.
            Focused on clean code, great UX, and shipping products that people actually use.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold text-white">Projects</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  )
}
