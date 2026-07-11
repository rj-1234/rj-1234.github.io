import { atom } from 'nanostores';

export type ViewMode = 'executive' | 'technical';

export const viewStore = atom<ViewMode>('executive');

export function toggleView(): void {
  viewStore.set(viewStore.get() === 'executive' ? 'technical' : 'executive');
}
