import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useStore } from '@nanostores/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { viewStore, toggleView } from '../lib/store';

const EXECUTIVE_CAT_URL = 'https://lottie.host/58d96d9b-94ca-4503-8922-08592d82d30f/L0toD2hoxg.lottie';
const TECHNICAL_CAT_URL = 'https://lottie.host/b4f060c0-c0d0-4ba5-9ea5-c48b0b90f09d/V7t826i9my.lottie';

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
      <DotLottieReact src={view === 'executive' ? EXECUTIVE_CAT_URL : TECHNICAL_CAT_URL} autoplay loop style={{ width: 48, height: 48 }} />
      <span className="text-caption-uppercase">{view === 'executive' ? 'Exec' : 'Tech'}</span>
      {!hasInteracted && <span className="absolute -top-6 text-caption text-muted whitespace-nowrap">click me · drag me</span>}
    </motion.div>
  );
}
