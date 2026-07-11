import { useRef, useState } from 'react';
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
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-59" />
      <motion.div
        drag
        dragMomentum
        dragTransition={{ power: 0.4, timeConstant: 200, bounceStiffness: 400, bounceDamping: 12 }}
        dragElastic={0.5}
        dragConstraints={constraintsRef}
        style={{ x, y, rotate }}
        onClick={() => {
          setHasInteracted(true);
          toggleView();
        }}
        className="fixed top-20 right-6 z-60 w-20 h-20 rounded-full bg-surface-1 shadow-lg flex flex-col items-center justify-center cursor-pointer select-none"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DotLottieReact
            src={view === 'executive' ? EXECUTIVE_CAT_URL : TECHNICAL_CAT_URL}
            autoplay
            loop
            speed={view === 'technical' ? 2.5 : 1}
            style={{ width: 48, height: 48 }}
          />
        </motion.div>
        {/* <span className="text-caption-uppercase">{view === 'executive' ? 'Exec' : 'Tech'}</span> */}
        {!hasInteracted && <span className="absolute -bottom-6 text-caption text-muted whitespace-nowrap">click me · drag me</span>}
      </motion.div>
    </>
  );
}
