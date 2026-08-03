const skills = [
  { category: 'Frontend', items: ['React', 'TypeScript', 'Tailwind CSS', 'TanStack Router', 'Vite'] },
  { category: 'Backend', items: ['Node.js', 'AWS Lambda', 'GraphQL', 'REST APIs'] },
  { category: 'Cloud & DevOps', items: ['AWS Amplify', 'S3', 'CloudFront', 'DynamoDB', 'CI/CD'] },
  { category: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Figma'] },
]

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">About Me</h1>

      <section className="mt-6 max-w-2xl">
        <p className="leading-relaxed text-slate-300">
          I'm David Moritz, a full-stack developer who loves building web apps that solve real problems.
          I work primarily with React, TypeScript, and AWS, and I care deeply about writing clean,
          maintainable code that delivers a great user experience.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          My projects range from real-time multiplayer games to crowdfunding platforms to interactive
          educational content. I enjoy taking ideas from concept to deployed product, handling everything
          from UI design to cloud infrastructure.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Skills & Technologies</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {skills.map((group) => (
            <div
              key={group.category}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300">
                {group.category}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
