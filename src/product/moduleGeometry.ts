/**
 * 压暗 / 平滑辅助：选中某模块时其余模块半透明，聚焦视觉。
 * 与旧 HaloWash 项目的 applyDim 同一实现。
 */

import * as THREE from 'three';

const lastDim = new WeakMap<THREE.Object3D, number>();

type DimMaterial = THREE.MeshStandardMaterial & { userData: Record<string, unknown> };

export function applyDim(group: THREE.Object3D | null, dim: number): void {
  if (!group) return;
  const prev = lastDim.get(group);
  if (prev !== undefined && Math.abs(prev - dim) < 0.004) return;
  lastDim.set(group, dim);
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    const list = Array.isArray(mat) ? mat : [mat];
    for (const m of list) {
      const std = m as DimMaterial;
      if (!('opacity' in std)) continue;
      const base = (std.userData.baseOpacity as number | undefined) ?? (std.transparent ? std.opacity : 1);
      std.userData.baseOpacity = base;
      const keep = std.userData.keepAlpha === true;
      if (dim >= 0.999) {
        std.opacity = keep ? base : 1;
        std.transparent = keep || base < 0.999;
      } else {
        std.opacity = base * dim;
        std.transparent = true;
      }
    }
  });
}
