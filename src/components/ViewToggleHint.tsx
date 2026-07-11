import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'portfolio-hint-dismissed';

export default function ViewToggleHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (isMobile || dismissed) return;

    const showTimer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => dismiss(), 7000);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          onClick={dismiss}
          className="fixed z-[60] glass rounded-lg px-4 py-2 text-body-sm cursor-pointer"
          style={{ top: '176px', right: '24px' }}
        >
          Toggle executive / technical view ↑
        </motion.div>
      )}
    </AnimatePresence>
  );
}
