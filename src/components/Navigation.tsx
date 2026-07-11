import { NAV_ITEMS } from '../lib/constants';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container-main flex h-16 items-center justify-between">
        <a href="#hero" className="font-display text-lg">Rajeev Joshi</a>
        <ul className="hidden md:flex gap-6 text-caption">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-body hover:text-ink transition-colors">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
