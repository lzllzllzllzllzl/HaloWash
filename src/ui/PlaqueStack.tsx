import React from 'react';
import { useStore } from '../app/store';

/** 顶部中央通告（阶段切换 / 完成提示），自动消退 */
export function PlaqueStack() {
  const plaques = useStore((s) => s.plaques);
  if (plaques.length === 0) return null;
  return (
    <div className="plaque-stack" aria-live="polite">
      {plaques.map((p) => (
        <div key={p.id} className={`plaque ${p.type}`}>{p.text}</div>
      ))}
    </div>
  );
}
