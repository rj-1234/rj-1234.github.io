import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { SKILLS, PROJECTS } from '../lib/constants';
import { viewStore } from '../lib/store';
import SkillsBg from './backgrounds/SkillsBg';

export default function TechDepth() {
  const [active, setActive] = useState<string | null>(null);
  const view = useStore(viewStore);

  return (
    <section id="skills" data-slide className="relative section-padding bg-surface-1 overflow-hidden">
      <SkillsBg />
      <div data-slide-inner className="container-main relative z-10">
        <h2 className="font-display text-display-lg">Technical Depth</h2>
        <p className="text-body-md text-body mt-2">Full-stack ML engineering from model development through production serving and governance.</p>

        <div className={`grid gap-10 mt-8 ${view === 'technical' ? 'lg:grid-cols-2' : ''}`}>
          <div className="space-y-6">
            {SKILLS.map((cat) => (
              <div key={cat.name}>
                <button
                  onClick={() => setActive(active === cat.name ? null : cat.name)}
                  className={`text-title-sm ${active === cat.name ? 'text-primary' : 'text-ink'}`}
                >
                  {cat.name}
                </button>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cat.skills.map((s) => (
                    <span
                      key={s}
                      className={`text-caption rounded-pill px-3 py-1 ${active === cat.name ? 'bg-primary text-on-primary' : 'bg-surface-0 text-body'}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {view === 'technical' && (
            <div className="space-y-4">
              {PROJECTS.map((p) => (
                <div key={p.id} className="card-pop glass rounded-lg p-5">
                  <h4 className="text-title-sm">{p.title}</h4>
                  <p className="text-code text-muted mt-1">{p.architecture}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
