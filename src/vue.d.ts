import { ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    key_height: number,
    beat_width: number,
    piano_width: number,
    cut_num: number,
    midiEditor: any,
    duration_ticks: number,
    ppq: number,
    more_beat: number,
    ticks_progress: number
  }
}
