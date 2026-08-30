import { hardwareAudio } from './HardwareAudio';
import { hwEvents } from '../app/events';

/** 首次用户手势后初始化 AudioContext（浏览器自动播放策略） */
export function ensureAudio(): void {
  hardwareAudio.init();
}

hwEvents.on('phaseChanged', () => hardwareAudio.chime());
