import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { TERMINAL_SNIPPETS } from '../lib/constants';
import { getInitialOrder, cycleToBack, stackOffset, shouldStopAutoFlip, clampScale } from '../lib/hero-terminal-logic';
import { highlightLine } from '../lib/syntax-highlight';

type RunState = 'idle' | 'running' | 'complete';

export default function HeroTerminal() {
  const [order, setOrder] = useState<string[]>(() => getInitialOrder(TERMINAL_SNIPPETS.map((s) => s.id)));
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingState, setIsResizingState] = useState(false);
  const isResizingRef = useRef(false);
  const [runState, setRunState] = useState<RunState>('idle');
  const [visibleLines, setVisibleLines] = useState(0);

  const dragScale = useMotionValue(1);
  const sizeScale = useMotionValue(1);
  const combinedScale = useTransform([dragScale, sizeScale], ([d, s]: number[]) => clampScale(d * s));

  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cycle = () => {
    if (isAnimating || isDragging || isResizingRef.current) return;
    setIsAnimating(true);
    setRunState('idle');
    setVisibleLines(0);
    cycleTimerRef.current = setTimeout(() => {
      setOrder((prev) => cycleToBack(prev));
      setIsAnimating(false);
    }, 350);
  };

  useEffect(() => {
    return () => clearTimeout(cycleTimerRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const flip = (delay: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;
        const frontId = order[order.length - 1];
        const frontSnippet = TERMINAL_SNIPPETS.find((s) => s.id === frontId)!;
        if (shouldStopAutoFlip(frontSnippet)) return;
        setOrder((prev) => cycleToBack(prev));
        flip(2000);
      }, delay);
    };

    flip(4000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // Track pending output-line timeouts so runSnippet's own timers get cleared
  // on unmount instead of firing setState calls against an unmounted component.
  const runTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      runTimersRef.current.forEach(clearTimeout);
      runTimersRef.current = [];
    };
  }, []);

  const handleResizeDrag = (delta: number) => {
    isResizingRef.current = true;
    setIsResizingState(true);
    sizeScale.set(clampScale(sizeScale.get() + delta / 200));
  };

  const stopResize = () => {
    isResizingRef.current = false;
    setIsResizingState(false);
  };

  const runSnippet = (e: React.MouseEvent, snippetId: string) => {
    e.stopPropagation();
    if (runState === 'complete') {
      setRunState('idle');
      setVisibleLines(0);
      return;
    }
    if (runState !== 'idle') return;
    setRunState('running');
    const snippet = TERMINAL_SNIPPETS.find((s) => s.id === snippetId)!;
    snippet.output.lines.forEach((line, i) => {
      const t = setTimeout(() => setVisibleLines(i + 1), line.delay);
      runTimersRef.current.push(t);
    });
    const completeTimer = setTimeout(() => setRunState('complete'), snippet.output.totalDelay + 100);
    runTimersRef.current.push(completeTimer);
  };

  return (
    <motion.div
      drag
      dragListener={!isResizingState}
      dragConstraints={typeof document !== 'undefined' ? { current: document.getElementById('hero') } : undefined}
      style={{ scale: combinedScale, transformOrigin: 'top right' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        dragScale.set(1);
      }}
      className="relative w-full max-w-lg aspect-[4/3]"
    >
      {order.map((id, i) => {
        const snippet = TERMINAL_SNIPPETS.find((s) => s.id === id)!;
        const indexFromTop = order.length - 1 - i;
        const isActive = indexFromTop === 0;
        const offset = stackOffset(indexFromTop);

        return (
          <div
            key={id}
            onClick={cycle}
            className="absolute inset-0 rounded-lg overflow-hidden shadow-lg cursor-pointer bg-surface-dark text-on-dark"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              zIndex: i,
            }}
          >
            <div className="h-11 flex items-center gap-2 px-4 bg-surface-dark-elevated">
              <span className="w-3 h-3 rounded-full bg-error/70" />
              <span className="w-3 h-3 rounded-full bg-warning/70" />
              <span className="w-3 h-3 rounded-full bg-success/70" />
              <span className="text-code text-on-dark-soft ml-2">{snippet.filename}</span>
            </div>

            {isActive && (
              <div className="p-4 text-code overflow-auto h-[calc(100%-44px)]">
                <pre className="whitespace-pre-wrap">
                  {snippet.code.map((line, li) => (
                    <div key={li}>
                      {highlightLine(line).map((tok, ti) => (
                        <span key={ti} className={tok.className}>{tok.text}</span>
                      ))}
                    </div>
                  ))}
                </pre>

                {snippet.runLabel && (
                  <button onClick={(e) => runSnippet(e, id)} className="mt-3 flex items-center gap-2 text-caption text-primary">
                    {runState === 'idle' && <span>▶ {snippet.runLabel}</span>}
                    {runState === 'running' && <span>◌ Running…</span>}
                    {runState === 'complete' && <span>✓ Completed in {snippet.output.latencyMs}ms</span>}
                  </button>
                )}

                {runState !== 'idle' && (
                  <div className="mt-2 text-code space-y-1">
                    {snippet.output.lines.slice(0, visibleLines).map((line, li) => (
                      <div key={li} className={{
                        info: 'text-on-dark-soft',
                        success: 'text-success',
                        warning: 'text-warning',
                        error: 'text-error',
                        muted: 'text-on-dark-soft/70',
                      }[line.type]}>{line.text}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isActive && (
              <svg
                className="absolute bottom-2 right-2 w-10 h-10"
                style={{ pointerEvents: 'none' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const startY = e.clientY;
                  const onMove = (ev: PointerEvent) => handleResizeDrag(ev.clientY - startY);
                  const onUp = () => {
                    stopResize();
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
              >
                <path
                  d="M 40 16 L 40 30 Q 40 40 30 40 L 16 40"
                  stroke="#cc785c"
                  strokeWidth="5"
                  fill="none"
                  style={{ pointerEvents: 'stroke' }}
                />
              </svg>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
