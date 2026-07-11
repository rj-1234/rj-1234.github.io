import * as THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE;
    VANTA: Record<string, any>;
  }
}

function ensureThree() {
  if (typeof window !== 'undefined') {
    window.THREE = THREE;
  }
}

export async function loadBirds() {
  ensureThree();
  await import('vanta/dist/vanta.birds.min');
  return window.VANTA.BIRDS;
}

export async function loadNet() {
  ensureThree();
  await import('vanta/dist/vanta.net.min');
  return window.VANTA.NET;
}

export async function loadClouds() {
  ensureThree();
  await import('vanta/dist/vanta.clouds.min');
  return window.VANTA.CLOUDS;
}

export async function loadClouds2() {
  ensureThree();
  await import('vanta/dist/vanta.clouds2.min');
  return window.VANTA.CLOUDS2;
}

export async function loadDots() {
  ensureThree();
  await import('vanta/dist/vanta.dots.min');
  return window.VANTA.DOTS;
}

export async function loadWaves() {
  ensureThree();
  await import('vanta/dist/vanta.waves.min');
  return window.VANTA.WAVES;
}

export async function loadCells() {
  ensureThree();
  await import('vanta/dist/vanta.cells.min');
  return window.VANTA.CELLS;
}
