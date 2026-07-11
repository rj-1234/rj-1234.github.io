import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '@nanostores/react';
import type { Project } from '../lib/constants';
import { viewStore } from '../lib/store';

export default function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const view = useStore(viewStore);

  return (
    <div className="card-pop glass rounded-lg p-6">
      <div className="flex flex-wrap gap-2">
        {project.domains.map((d) => (
          <span key={d} className="text-caption-uppercase rounded-pill bg-surface-1 px-3 py-1">{d}</span>
        ))}
      </div>
      <h3 className="font-display text-display-sm mt-3">{project.title}</h3>
      <p className="text-body-md text-body mt-2">{project.tagline}</p>
      <p className="text-title-sm text-primary mt-3">{project.headlineMetric}</p>

      {view === 'executive' && <p className="text-body-sm text-muted mt-3">{project.execSummary}</p>}

      {view === 'technical' && (
        <div className="flex flex-wrap gap-2 mt-3">
          {project.techStack.map((t) => (
            <span key={t} className="text-code rounded-sm bg-surface-1 px-2 py-0.5">{t}</span>
          ))}
        </div>
      )}

      <button onClick={() => setExpanded((v) => !v)} className="mt-4 text-body-sm text-primary">
        {expanded ? 'Show less' : 'Show more'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-title-sm">Problem</h4>
                <p className="text-body-sm text-muted">{project.problem}</p>
              </div>
              <div>
                <h4 className="text-title-sm">Approach</h4>
                <p className="text-body-sm text-muted">{project.approach}</p>
              </div>
              <div>
                <h4 className="text-title-sm">Architecture</h4>
                <p className="text-code text-muted">{project.architecture}</p>
              </div>
              <div>
                <h4 className="text-title-sm">Impact</h4>
                <ul className="list-disc list-inside text-body-sm text-muted">
                  {project.impact.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
