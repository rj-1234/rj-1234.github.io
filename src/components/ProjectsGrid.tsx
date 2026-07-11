import { useMemo, useState } from 'react';
import { PROJECTS } from '../lib/constants';
import ProjectCard from './ProjectCard';
import ProjectsBg from './backgrounds/ProjectsBg';

const DOMAINS = ['All', 'AI/ML', 'Infrastructure', 'Platform', 'Privacy'];

export default function ProjectsGrid() {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.domains.includes(filter))),
    [filter]
  );

  return (
    <section id="projects" data-slide className="relative section-padding bg-canvas overflow-hidden">
      <ProjectsBg />
      <div data-slide-inner className="container-main relative z-10">
        <h2 className="font-display text-display-lg">Signature Projects</h2>
        <p className="text-body-md text-body mt-2">Enterprise AI systems built for scale, reliability, and measurable business impact.</p>

        <div className="flex flex-wrap gap-2 mt-6">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`text-caption rounded-md px-3.5 py-2 ${filter === d ? 'bg-surface-1 text-ink' : 'text-muted'}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </div>
    </section>
  );
}
