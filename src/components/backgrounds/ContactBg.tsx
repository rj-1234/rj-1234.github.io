import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const DOTS_AMOUNT = 1800;
const RADIUS = 120;
const CONNECT_DISTANCE = 12;
const COLORS = [0xcc785c, 0xe8a55a, 0x8e8b82];

const VERTEX_SHADER = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (350.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    if (alpha < 0.05) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function ContactBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import('three').then((THREE) => {
      if (cancelled || !container) return;

      const canvas = document.createElement('canvas');
      container.appendChild(canvas);

      let width = container.clientWidth;
      let height = container.clientHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
      camera.position.set(0, 0, 350);

      const colors = COLORS.map((c) => new THREE.Color(c));

      const positions = new Float32Array(DOTS_AMOUNT * 3);
      const sizes = new Float32Array(DOTS_AMOUNT);
      const colorAttr = new Float32Array(DOTS_AMOUNT * 3);
      const dots: { x: number; y: number; z: number; colorIndex: number; scaleX: number }[] = [];

      for (let i = 0; i < DOTS_AMOUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = (1 - Math.sqrt(Math.random())) * (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1);

        let x = Math.cos(theta) * Math.cos(phi);
        let y = Math.sin(phi);
        let z = Math.sin(theta) * Math.cos(phi);
        const scale = RADIUS + (Math.random() - 0.5) * 5;
        x *= scale;
        y *= scale;
        z *= scale;

        const colorIndex = Math.floor(Math.random() * colors.length);
        const dot = { x, y, z, colorIndex, scaleX: 5 };
        dots.push(dot);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        sizes[i] = 5;
        colors[colorIndex].toArray(colorAttr, i * 3);
      }

      const dotsGeometry = new THREE.BufferGeometry();
      const positionAttr = new THREE.BufferAttribute(positions, 3);
      dotsGeometry.setAttribute('position', positionAttr);
      const sizeAttr = new THREE.BufferAttribute(sizes, 1);
      dotsGeometry.setAttribute('size', sizeAttr);
      dotsGeometry.setAttribute('color', new THREE.BufferAttribute(colorAttr, 3));

      const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      });

      const points = new THREE.Points(dotsGeometry, shaderMaterial);
      scene.add(points);

      // Connecting line segments between nearby dots
      const linePositions: number[] = [];
      const lineColors: number[] = [];
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < CONNECT_DISTANCE) {
            linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
            const ca = colors[a.colorIndex];
            const cb = colors[b.colorIndex];
            lineColors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
          }
        }
      }
      const segmentsGeometry = new THREE.BufferGeometry();
      segmentsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      segmentsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      const segmentsMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.3,
        vertexColors: true,
      });
      const segments = new THREE.LineSegments(segmentsGeometry, segmentsMaterial);
      scene.add(segments);

      // Idle drift tweens (only some dots, matching the reference demo's density)
      const tweens: gsap.core.Tween[] = [];
      dots.forEach((dot, index) => {
        if (Math.random() <= 0.5) return;
        const target = {
          x: dot.x * ((Math.random() - 0.5) * 0.2 + 1),
          y: dot.y * ((Math.random() - 0.5) * 0.2 + 1),
          z: dot.z * ((Math.random() - 0.5) * 0.2 + 1),
        };
        const tween = gsap.to(dot, {
          x: target.x,
          y: target.y,
          z: target.z,
          yoyo: true,
          repeat: -1,
          delay: -Math.random() * 3,
          duration: Math.random() * 3 + 3,
          ease: 'none',
          onUpdate: () => {
            positions[index * 3] = dot.x;
            positions[index * 3 + 1] = dot.y;
            positions[index * 3 + 2] = dot.z;
          },
        });
        tweens.push(tween);
      });

      // Mouse hover raycast pulse
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points = { threshold: 6 };
      const mouse = new THREE.Vector2(-100, -100);
      let hovered: number[] = [];
      let prevHovered: number[] = [];
      const hoverTweens = new Map<number, gsap.core.Tween>();

      const onDotHover = (index: number) => {
        hoverTweens.get(index)?.kill();
        const dot = dots[index];
        const tween = gsap.to(dot, {
          scaleX: 10,
          duration: 1,
          ease: 'elastic.out(2, 0.2)',
          onUpdate: () => {
            sizes[index] = dot.scaleX;
          },
        });
        hoverTweens.set(index, tween);
      };

      const onDotUnhover = (index: number) => {
        hoverTweens.get(index)?.kill();
        const dot = dots[index];
        const tween = gsap.to(dot, {
          scaleX: 5,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: () => {
            sizes[index] = dot.scaleX;
          },
        });
        hoverTweens.set(index, tween);
      };

      const onPointerMove = (e: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - bounds.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - bounds.top) / height) * 2 + 1;
      };
      container.addEventListener('pointermove', onPointerMove);

      let rafId = 0;
      const render = () => {
        raycaster.setFromCamera(mouse, camera);
        const intersections = raycaster.intersectObject(points);
        hovered = [];
        for (const hit of intersections) {
          if (hit.index === undefined) continue;
          hovered.push(hit.index);
          if (!prevHovered.includes(hit.index)) onDotHover(hit.index);
        }
        for (const index of prevHovered) {
          if (!hovered.includes(index)) onDotUnhover(index);
        }
        prevHovered = hovered.slice();

        positionAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(render);
      };
      rafId = requestAnimationFrame(render);

      const resizeObserver = new ResizeObserver(() => {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
      resizeObserver.observe(container);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        tweens.forEach((t) => t.kill());
        hoverTweens.forEach((t) => t.kill());
        resizeObserver.disconnect();
        container.removeEventListener('pointermove', onPointerMove);
        dotsGeometry.dispose();
        segmentsGeometry.dispose();
        shaderMaterial.dispose();
        segmentsMaterial.dispose();
        renderer.dispose();
        canvas.remove();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 opacity-50" />;
}
