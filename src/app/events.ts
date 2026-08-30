type Handler = (payload?: unknown) => void;

const handlers = new Map<string, Set<Handler>>();

export const hwEvents = {
  on(type: string, h: Handler): void {
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type)!.add(h);
  },
  off(type: string, h: Handler): void {
    handlers.get(type)?.delete(h);
  },
  emit(type: string, payload?: unknown): void {
    handlers.get(type)?.forEach((h) => {
      try { h(payload); } catch { /* listener errors must not break the loop */ }
    });
  },
};
