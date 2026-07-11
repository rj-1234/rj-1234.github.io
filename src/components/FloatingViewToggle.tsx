import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useStore } from '@nanostores/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { viewStore, toggleView } from '../lib/store';

// const EXECUTIVE_CAT_URL = '/assets/animations/Cat%20in%20a%20rocket.lottie';
const EXECUTIVE_CAT_URL = '/assets/animations/Dance%20cat.lottie';
const TECHNICAL_CAT_URL = '/assets/animations/Cat%20typing.lottie';

export default function FloatingViewToggle() {
  const view = useStore(viewStore);
  const [hasInteracted, setHasInteracted] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  const dragConstraints =
    typeof window === 'undefined'
      ? { top: 0, bottom: 0, left: 0, right: 0 }
      : { top: -window.innerHeight, bottom: window.innerHeight, left: -window.innerWidth, right: window.innerWidth };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      style={{ x, y, rotate }}
      onClick={() => {
        setHasInteracted(true);
        toggleView();
      }}
      className="fixed bottom-6 right-6 z-[60] w-20 h-20 rounded-full bg-surface-1 shadow-lg flex flex-col items-center justify-center cursor-pointer select-none"
    >
      <DotLottieReact
        src={view === 'executive' ? EXECUTIVE_CAT_URL : TECHNICAL_CAT_URL}
        autoplay
        loop
        speed={view === 'technical' ? 2.5 : 1}
        style={{ width: 48, height: 48 }}
      />
      {/* <span className="text-caption-uppercase">{view === 'executive' ? 'Exec' : 'Tech'}</span> */}
      {!hasInteracted && <span className="absolute -top-6 text-caption text-muted whitespace-nowrap">click me · drag me</span>}
    </motion.div>
  );
}
