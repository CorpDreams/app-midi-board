<template>
  <div
    class="paino-roll-wrap"
    :style="cssVars"
    :class="{ pen: tool_id == 1, eraser: tool_id == 2 }"
  >
    <div class="fixed-wrap">
      <div class="tool-bar">
        <button
          class="btn-open btn-action"
          title="打开MIDI文件"
          @click="InputFileDOM.click()"
        >
          <input
            class="input-file"
            type="file"
            @change="fileChange"
            ref="input-file"
            accept=".mid"
          />
          <Icon name="open" height="20" width="20" />
        </button>
        <button class="btn-new btn-action" @click="newMidi" title="新建文件">
          <Icon name="new" height="20" width="20" />
        </button>
        <button class="btn-save btn-action" @click="saveMidi" title="保存文件">
          <Icon name="save" height="20" width="20" />
        </button>
        <div class="midi-name">{{ midi_name }}</div>
        <div class="combo-track combo-wrap">
          <div class="track-focus track-wrap">
            <span class="track-index">{{ track_index }}</span>
            <span class="track-name">{{ getTracks()[track_index].name }}</span>
          </div>
          <div class="combo-option-wrap">
            <template v-for="(track, index) in getTracks()" :key="track.name">
              <div
                class="combo-option track-wrap"
                v-if="track_index !== index"
                @click="switchTrackIndex($event, index)"
              >
                <span class="track-index">{{ index }}</span>
                <span class="track-name">{{ track.name }}</span>
                <span class="btn-remove" @click="removeTrack(index)">
                  <Icon name="close" height="12" width="12" />
                </span>
              </div>
            </template>
          </div>
        </div>
        <button
          class="btn-add-track btn-action"
          @click="addTrack"
          title="新建轨道"
        >
          <Icon name="add-track" height="20" width="20" />
        </button>
        <button
          class="btn-play btn-action"
          :class="{ unavailable: !can_play }"
          @click="play()"
          title="播放/暂停（空格）"
        >
          <Icon :name="playStatus" height="20" width="20" />
        </button>
        <button
          class="btn-reset btn-action"
          @click="reset"
          title="从头播放"
          :class="{ unavailable: !can_play }"
        >
          <Icon name="reset" height="20" width="20" />
        </button>
        <div class="btn-tool-wrap">
          <div class="combo-cut-wrap">
            <span class="combo-label">对齐:</span>
            <div class="combo-cut combo-wrap">
              <div class="cut-focus cut-wrap">
                <span class="cut-text">{{ `1/${cut_num}` }}</span>
              </div>
              <div class="combo-option-wrap">
                <template v-for="cut in cut_arr" :key="cut">
                  <div
                    class="combo-option cut-wrap"
                    v-if="cut !== cut_num"
                    @click="changeCutNum(cut)"
                  >
                    <span class="cut-text">{{ `1/${cut}` }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <button
            class="btn-cursor btn-tool"
            :class="{ active: tool_id == 0 }"
            @click="switchTool(0)"
            title="鼠标"
          >
            <Icon name="cursor" height="20" width="20" />
          </button>
          <button
            class="btn-pen btn-tool"
            :class="{ active: tool_id == 1 }"
            @click="switchTool(1)"
            title="音符画笔"
          >
            <Icon name="pen" height="20" width="20" />
          </button>
          <button
            class="btn-eraser btn-tool"
            :class="{ active: tool_id == 2 }"
            @click="switchTool(2)"
            title="橡皮擦"
          >
            <Icon name="eraser" height="20" width="20" />
          </button>
        </div>
        <!--<button @click="reset">reset</button>-->
      </div>
      <div class="paino-scroll-bar-wrap">
        <div
          class="btn-left"
          @click="toRollRange(scroll_left_tick - 500)"
        ></div>
        <div class="scroll-bar" ref="scroll-bar">
          <div
            class="thumb"
            ref="thumb"
            :style="{
              left: `${scroll_left_tick * tick_width_bar}px`,
              width: `${scroll_view_ticks * tick_width_bar}px`,
              maxWidth: `${
                (duration_ticks + more_beat * ppq - scroll_left_tick) *
                tick_width_bar
              }px`,
            }"
          >
            <div class="drag-area" @mousedown="moveRollRange"></div>
          </div>
        </div>
        <div
          class="btn-right"
          @click="toRollRange(scroll_left_tick + 500)"
        ></div>
      </div>
      <table
        class="time-line-wrap"
        ref="time-line-wrap"
        :key="midiEditor"
        :style="{
          width: `${beat_width * getBeatArr.length}px`,
          height: `${key_height}px`,
          left: `${paino_width - paino_wraps_scroll_left + 0.5}px`,
        }"
      >
        <tr
          class="time-line"
          @mousewheel.prevent="mouseWheelZoom"
          @click="locateTick"
        >
          <td
            class="time-line-beat"
            v-for="beat_index in getBeatArr"
            :key="beat_index"
            :class="{
              'bar-end': (beat_index + 1) % midiEditor.time_signature[0] == 0,
              'bar-start': (beat_index + 1) % midiEditor.time_signature[0] == 1,
            }"
            :style="getTimeLineBeatStyle(beat_index)"
            :id="`time-line-beat-${beat_index}`"
          >
            {{ Math.ceil((beat_index + 1) / midiEditor.time_signature[0]) }}
          </td>
        </tr>
      </table>
    </div>
    <div class="content-wrap" ref="content-wrap">
      <div class="content-scroll-wrap">
        <div class="side-paino-key">
          <div
            class="octave-wrap"
            v-for="(octave, octave_index) in paino_key.octave"
            :key="octave"
          >
            <div
              class="key"
              :class="keyClass(paino_key, note_index)"
              v-for="(code, note_index) in paino_key.code"
              :key="code"
              :id="`key-${131 - (code + octave_index * 12)}`"
              @mousedown="keyDown(131 - (code + octave_index * 12))"
              @mouseenter="keyDown(131 - (code + octave_index * 12))"
              @mouseup="keyUp(131 - (code + octave_index * 12))"
              @mouseout="keyUp(131 - (code + octave_index * 12))"
            >
              {{ keyLabel(octave, paino_key, note_index) }}
            </div>
          </div>
        </div>
        <div class="paino-wrap" ref="paino-wrap" @mousedown="addNote">
          <div class="paino-roll">
            <!--钢琴卷帘-->
            <table
              class="roll-wrap"
              :style="{ width: `${beat_width * getBeatArr.length}px` }"
              ref="paino-roll-wrap"
            >
              <!--八度循环渲染-->
              <template
                v-for="(octave, octave_index) in paino_key.octave"
                :key="octave"
              >
                <!--八度内音高（行）循环渲染-->
                <tr
                  class="pitch"
                  :class="keyClass(paino_key, note_index)"
                  :id="`row-${octave_index}-${note_index}`"
                  v-for="(code, note_index) in paino_key.code"
                  :key="code"
                >
                  <td class="pitch-line"></td>
                </tr>
              </template>
            </table>
            <template v-for="(track, track_num) in tracks" :key="track_num">
              <div
                class="notes-wrap"
                v-if="tracks[track_num]"
                :class="{ active: track_num == track_index }"
              >
                <div
                  class="note"
                  v-for="(note, index) in tracks[track_num].notes"
                  :key="note"
                  :style="{
                    top: `${getNoteStyle(note)[0]}px`,
                    left: `${getNoteStyle(note)[1]}px`,
                    width: `${getNoteStyle(note)[2]}px`,
                    padding: `${getNoteStyle(note)[3]}px`,
                    fontSize: `${getNoteStyle(note)[4]}px`,
                  }"
                  :id="`note-${track_num}-${index}`"
                  :class="{
                    focus:
                      fucus_notes.indexOf(`note-${track_num}-${index}`) >= 0,
                  }"
                  @mousedown="removeNote"
                  @mouseenter="removeNote"
                >
                  <div
                    class="move-area"
                    :id="`notemove-${track_num}-${index}`"
                    @mousedown="moveNote"
                  >
                    {{ note.name }}
                  </div>
                  <div
                    class="drag-area"
                    :id="`notedrag-${track_num}-${index}`"
                    @mousedown="changeNoteDuration"
                  ></div>
                </div>
              </div>
            </template>
            <div
              class="progress-line"
              :style="{
                left: `${getProgressLeft}px`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import type { AppContext } from "@netless/window-manager";
import { Midi, MidiJSON } from "@tonejs/midi";
import { inject, ref, toRef, watch, computed } from "vue";
import Icon from "./Icon.vue";

export default {
  name: "paino-roll",
  components: {
    Icon,
  },
  setup() {
    const context = inject<AppContext>("context");
    if (!context)
      throw new Error("must call provide('context') before mount App");

    interface midi_board {
      midi_json: any;
      midi_name: string;
      ticks_progress: number;
      content_scroll_top: number;
      track_index: number;
    }

    const midi_board: midi_board = {
      midi_json: null,
      midi_name: "",
      ticks_progress: 0,
      content_scroll_top: 0,
      track_index: 0,
    };
    const storage = context.createStorage("midi-board", midi_board);

    const data: any = {
      midi_json: ref(storage.state.midi_json),
      midi_name: ref(storage.state.midi_name),
      ticks_progress: ref(storage.state.ticks_progress),
      content_scroll_top: ref(storage.state.content_scroll_top),
      track_index: ref(storage.state.track_index),
    };

    const midiEditor = inject<any>("midiEditor");
    if (!midiEditor) throw new Error("must call provide('midiEditor')");

    const duration_ticks = ref(midiEditor.duration_ticks);
    const ppq = ref(midiEditor.ppq);
    const time_signature = ref(midiEditor.time_signature);
    const ticks_progress = ref(midiEditor.ticks_progress);
    const is_play = ref(midiEditor.is_play);

    Object.defineProperty(midiEditor, "ticks_progress", {
      set: (value) => {
        ticks_progress.value = value;
      },
      get: () => {
        return ticks_progress;
      },
    });

    Object.defineProperty(midiEditor, "is_play", {
      set: (value) => {
        is_play.value = value;
        midiEditor._is_play = value;
      },
      get: () => {
        return midiEditor._is_play;
      },
    });

    const midi_json = computed<any>({
      get: () => data.midi_json.value,
      set: (midi_json) => storage.setState({ midi_json }),
    });

    const midi_name = computed<any>({
      get: () => data.midi_name.value,
      set: (midi_name) => storage.setState({ midi_name }),
    });

    const content_scroll_top = computed<any>({
      get: () => data.content_scroll_top.value,
      set: (content_scroll_top) => storage.setState({ content_scroll_top }),
    });

    const tracks: any[] = [];

    const track_index = computed<number>({
      get: () => data.track_index.value,
      set: (track_index) => storage.setState({ track_index }),
    });

    return {
      context,
      storage,
      data,
      midiEditor,
      duration_ticks,
      ppq,
      time_signature,
      ticks_progress,
      midi_json,
      midi_name,
      content_scroll_top,
      track_index,
      tracks,
      is_play,
    };
  },
  data() {
    const paino_key = {
      octave: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      notes: ["B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"],
      key_type: [1, 0, 2, 0, 2, 0, 1, 1, 0, 2, 0, 1],
      code: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    };

    const tool_id = 0;
    const can_play = false;

    const cut_num = 4;
    const cut_arr = [2, 3, 4, 6];
    const align_num = 4;
    const beat_arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const more_beat = 8;

    const key_height = 20;
    const beat_width = 60;
    const paino_width = 80;

    const InputFileDOM: any = null;
    const ScrollBarDOM: any = null;
    const ThumbDOM: any = null;
    const TimeLineWrapDOM: any = null;
    const ContentWrapDOM: any = null;
    const PainoWrapDOM: any = null;
    const PainoRollDOM: any = null;
    const PainoRollWrapDOM: any = null;

    const paino_wraps_scroll_left: any = 0;

    const scroll_left_tick: number = 0;
    const scroll_view_ticks: number = 0;

    const tick_width = 0;
    const tick_width_bar = 0;

    const fucus_notes: any[] = [];

    return {
      paino_key,
      tool_id,
      can_play,
      key_height,
      beat_width,
      paino_width,
      cut_num,
      cut_arr,
      align_num,
      beat_arr,
      more_beat,
      InputFileDOM,
      ScrollBarDOM,
      ThumbDOM,
      TimeLineWrapDOM,
      ContentWrapDOM,
      PainoRollDOM,
      PainoWrapDOM,
      PainoRollWrapDOM,
      paino_wraps_scroll_left,
      scroll_left_tick,
      scroll_view_ticks,
      tick_width,
      tick_width_bar,
      fucus_notes,
    };
  },
  methods: {
    test() {
      console.log(
        this.PainoRollWrapDOM.offsetWidth,
        this.PainoWrapDOM.scrollLeft
      );
    },
    switchTool(tool_id: number) {
      if (this.tool_id !== tool_id) {
        return (this.tool_id = tool_id);
      }
      return (this.tool_id = 0);
    },
    switchTrackIndex(e: any, track_index: number) {
      if (!e.target.classList.contains("btn-remove")) {
        if (track_index < this.tracks.length) {
          return (this.track_index = track_index);
        }
        return (this.track_index = 0);
      }
    },
    changeCutNum(cut_num: number) {
      this.cut_num = cut_num;
    },
    focusNote(e: any) {
      if (this.fucus_notes.indexOf(e.target.id) < 0) {
        this.fucus_notes = [e.target.id];
        return;
      }
      this.fucus_notes = [];
    },
    moveNote(e: any) {
      // 移动音符位置（开始时间及音高），因性能问题只能按照拍子分割对齐
      if (this.tool_id !== 2) {
        let is_play = false;
        if (this.midiEditor.is_play) {
          this.pause();
          is_play = true;
        }
        let note_index = e.target.id.split("-")[2];
        let track = this.midiEditor.midi_json.tracks[this.track_index];
        let note = track.notes[note_index];
        let midi = note.midi;
        let code = midi - 12;
        this.keyDown(code);
        let time = note.time;
        let ticks = note.ticks;
        let start_x = e.clientX;
        let y_layer = e.layerY;
        let start_y = e.clientY;
        document.onmousemove = (e: any) => {
          let x_move = e.clientX - start_x;
          let y_move = e.clientY - start_y + y_layer;
          let delta = Math.floor(y_move / this.key_height);
          let midi_new = midi - delta;
          if (midi_new - 12 !== code) {
            this.keyUp(code);
            code = midi_new - 12;
            this.keyDown(code);
          }
          let time_new = 0;
          let ticks_new = 0;
          if (this.cut_num !== 0) {
            let move_cut = Math.ceil(x_move / (this.beat_width / this.cut_num));
            let move_tick = move_cut * (this.ppq / this.cut_num); // 不再使用独立align_num，改为cut_num
            ticks_new = ticks + move_tick;
            let move_time = this.midiEditor.ticksToSeconds(move_tick);
            time_new = time + move_time;
          }
          note.midi = midi_new;
          note.time = time_new;
          note.ticks = ticks_new;
          note.name = this.midiEditor.midiToName(midi_new);
          if (track.endOfTrackTicks < note.ticks + note.duration) {
            track.endOfTrackTicks = note.ticks + note.duration;
          }
        };
        document.onmouseup = () => {
          this.keyUp(code);
          this.midi_json = JSON.parse(
            JSON.stringify(this.midiEditor.midi_json)
          );
          if (is_play) {
            this.play();
          }
          document.onmousemove = document.onmouseup = null;
        };
      }
    },
    changeNoteDuration(e: any) {
      // 调整音符时值
      if (this.tool_id !== 2) {
        let note_index = e.target.id.split("-")[2];
        let track = this.midiEditor.midi_json.tracks[this.track_index];
        let note = track.notes[note_index];
        let duration = note.duration;
        let duration_ticks = note.durationTicks;
        let start_x = e.clientX;
        document.onmousemove = (e: any) => {
          let x_move = e.clientX - start_x;
          let duration_new = duration;
          let duration_ticks_new = duration_ticks;
          if (this.cut_num !== 0) {
            let move_cut = Math.ceil(x_move / (this.beat_width / this.cut_num));
            let move_tick = move_cut * (this.ppq / this.cut_num); // 不再使用独立align_num，改为cut_num
            duration_ticks_new = duration_ticks + move_tick;
            let move_time = this.midiEditor.ticksToSeconds(move_tick);
            duration_new = duration + move_time;
          }
          note.duration = duration_new;
          note.durationTicks = duration_ticks_new;
          if (track.endOfTrackTicks < note.ticks + note.duration) {
            track.endOfTrackTicks = note.ticks + note.duration;
          }
        };
        document.onmouseup = () => {
          this.midi_json = JSON.parse(
            JSON.stringify(this.midiEditor.midi_json)
          );
          document.onmousemove = document.onmouseup = null;
        };
      }
    },
    removeNote(e: any) {
      // 使用橡皮擦删除音符
      if (this.tool_id == 2 && (window as any).event.buttons == 1) {
        let note_index = e.target.id.split("-")[2];
        let track = this.midiEditor.midi_json.tracks[this.track_index];
        track.notes.splice(note_index, 1);
        document.onmouseup = () => {
          this.midi_json = JSON.parse(
            JSON.stringify(this.midiEditor.midi_json)
          );
          document.onmouseup = null;
        };
      }
    },
    addNote(e: any) {
      if (this.tool_id == 1 && e.target.classList.contains("notes-wrap")) {
        let is_play = false;
        if (this.midiEditor.is_play) {
          this.pause();
          is_play = true;
        }
        let code_add = Math.ceil(131 - e.layerY / this.key_height);
        let midi_add = code_add + 12;
        let name = this.midiEditor.midiToName(midi_add);
        let ticks_add = Math.floor(
          Math.floor(e.layerX / (this.beat_width / this.cut_num)) *
            (this.ppq / this.cut_num)
        );
        if (ticks_add < this.ticks_progress) {
          this.context.dispatchMagixEvent("midi-locate", ticks_add - 100);
        }
        let time_add = this.midiEditor.ticksToSeconds(ticks_add);
        let duration_ticks_add = Math.floor(this.ppq / this.cut_num);
        let duration_add = this.midiEditor.ticksToSeconds(duration_ticks_add);
        let note_add = {
          time: time_add,
          midi: midi_add,
          name: name,
          velocity: 0.75,
          duration: duration_add,
          ticks: ticks_add,
          durationTicks: duration_ticks_add,
        };
        let note_index =
          this.midiEditor.midi_json.tracks[this.track_index].notes.length;
        this.midiEditor.midi_json.tracks[this.track_index].notes.push(note_add);
        this.midi_json = JSON.parse(JSON.stringify(this.midiEditor.midi_json));

        this.keyDown(code_add);
        let track = this.midiEditor.midi_json.tracks[this.track_index];
        let note = track.notes[note_index];
        let duration = note.duration;
        let duration_ticks = note.durationTicks;
        let start_x = e.clientX;
        document.onmousemove = (e: any) => {
          let x_move = e.clientX - start_x;
          let duration_new = duration;
          let duration_ticks_new = duration_ticks;
          if (this.cut_num !== 0) {
            let move_cut = Math.ceil(x_move / (this.beat_width / this.cut_num));
            let move_tick = move_cut * (this.ppq / this.cut_num); // 不再使用独立align_num，改为cut_num
            duration_ticks_new = duration_ticks + move_tick;
            let move_time = this.midiEditor.ticksToSeconds(move_tick);
            duration_new = duration + move_time;
          }
          note.duration = duration_new;
          note.durationTicks = duration_ticks_new;
          if (track.endOfTrackTicks < note.ticks + note.duration) {
            track.endOfTrackTicks = note.ticks + note.duration;
          }
        };
        document.onmouseup = () => {
          this.keyUp(code_add);
          this.midi_json = JSON.parse(
            JSON.stringify(this.midiEditor.midi_json)
          );
          document.onmousemove = document.onmouseup = null;
        };
      }
    },
    mouseWheelZoom(e: any) {
      // 在时间轴上使用滚轮缩放
      let wheel_tick =
        (e.layerX / this.TimeLineWrapDOM.offsetWidth) * this.duration_ticks;
      let wheel_x =
        (e.clientX - this.PainoWrapDOM.offsetLeft) /
        this.PainoWrapDOM.offsetWidth;

      let delta_ticks = -((e.deltaY / Math.abs(e.deltaY)) * this.ppq * 2);
      let view_ticks_before = this.scroll_view_ticks;

      if (
        this.scroll_left_tick + this.scroll_view_ticks + delta_ticks <=
        this.duration_ticks + this.more_beat * this.ppq
      ) {
        this.scroll_view_ticks += delta_ticks;
      } else {
        this.scroll_view_ticks =
          this.duration_ticks +
          this.more_beat * this.ppq -
          this.scroll_left_tick;
      }
      //TODO: 缩放聚焦于单一tick
      /*
      this.beat_width =
        this.PainoWrapDOM.offsetWidth / (this.scroll_view_ticks / this.ppq);

      let left_tick = this.scroll_left_tick - (this.scroll_view_ticks - view_ticks_before) * wheel_x
      console.log(this.beat_width)

      if(left_tick <= 0){
        this.scroll_left_tick = 0
        return
      }
      if(left_tick + this.scroll_view_ticks >= this.duration_ticks){
        this.scroll_left_tick = this.duration_ticks - this.scroll_view_ticks
        return
      }
      this.scroll_left_tick = left_tick
      this.updateTickWidth()
      this.updatePainoWrapScroll()
      */
    },
    locateTick(e: any) {
      // 点击时间轴移动播放位置
      let target_tick =
        (e.layerX / this.TimeLineWrapDOM.offsetWidth) *
        (this.duration_ticks + this.more_beat * this.ppq);
      this.context.dispatchMagixEvent("midi-locate", target_tick);
      // this.midiEditor.locateTick(target_tick);
    },
    moveRollRange(e: any) {
      // 滑块拖拽，按比例移动钢琴卷帘
      let start_x = e.clientX;
      let start_left_tick = this.scroll_left_tick;
      document.onmousemove = (e: any) => {
        let x_move = e.clientX - start_x;
        let end_left_tick = start_left_tick + x_move / this.tick_width_bar;
        if (end_left_tick < 0) {
          // 越过左端，归零
          this.scroll_left_tick = 0;
        } else if (
          end_left_tick >
          this.duration_ticks +
            this.more_beat * this.ppq -
            this.scroll_view_ticks
        ) {
          // 越过右端，设为最大值
          this.scroll_left_tick =
            this.duration_ticks +
            this.more_beat * this.ppq -
            this.scroll_view_ticks;
        } else {
          // 正常移动
          this.scroll_left_tick =
            start_left_tick + x_move / this.tick_width_bar;
        }
        this.updatePainoWrapScroll();
      };
      document.onmouseup = function () {
        document.onmousemove = document.onmousemove = null;
      };
    },
    toRollRange(left_tick: number) {
      if (left_tick < 0) {
        // 越过左端，归零
        this.scroll_left_tick = 0;
      } else if (
        left_tick >
        this.duration_ticks + this.more_beat * this.ppq - this.scroll_view_ticks
      ) {
        // 越过右端，设为最大值
        this.scroll_left_tick =
          this.duration_ticks +
          this.more_beat * this.ppq -
          this.scroll_view_ticks;
      } else {
        // 正常移动
        this.scroll_left_tick = left_tick;
      }
      this.updatePainoWrapScroll();
    },
    updatePainoWrapScroll() {
      // 滑条滚动同步
      this.PainoWrapDOM.scrollLeft =
        this.PainoRollWrapDOM.offsetWidth -
        this.PainoWrapDOM.offsetWidth -
        (this.duration_ticks +
          this.more_beat * this.ppq -
          (this.scroll_left_tick + this.scroll_view_ticks)) *
          this.tick_width;
    },
    getNoteStyle(note: any) {
      // 动态音符块样式：宽度过小不显示标签
      let ticks = note.ticks;
      let name = note.name;
      let note_duration_ticks = note.durationTicks;
      let left = this.tick_width * ticks;

      let key = name.substring(0, name.length - 1);
      let key_index = this.paino_key.notes.indexOf(key);
      let octave = parseInt(name.charAt(name.length - 1));
      let top =
        this.key_height * 12 * (10 - octave) + key_index * this.key_height;

      let width = note_duration_ticks * this.tick_width;
      let padding = 2;
      if (this.beat_width < 20) {
        padding = 0;
      }
      let font_size = 10;
      if (width < 25) {
        font_size = 0;
      }
      return [top, left, width, padding, font_size];
    },
    fileChange: async function (e: any) {
      if(!e.target.files[0]){
        return
      }
      let file = e.target.files[0];
      this.midi_name = file.name;
      let midi = await this.readMidi(file);
      this.midi_json = midi.toJSON();
      this.track_index = 0;
      this.loadMidi(this.midi_json);
      this.ticks_progress = 0;
      this.PainoWrapDOM.scrollLeft = 0;
      if (this.midi_json.tracks[0].notes[0]) {
        this.ContentWrapDOM.scrollTop =
          this.key_height *
          (125 - (this.midi_json.tracks[0].notes[0].midi - 12));
      }
    },
    readMidi(file: any) {
      return new Promise((resolve: (value: Midi) => void, reject) => {
        const reader = new FileReader();
        reader.onload = function (e: any) {
          const midi = new Midi(e.target.result);
          return resolve(midi);
        };
        reader.readAsArrayBuffer(file);
      });
    },
    loadMidi(midi: MidiJSON) {
      this.midiEditor.loadMidiJSON(midi);
      this.ppq = this.midiEditor.ppq;
      this.duration_ticks = this.midiEditor.duration_ticks;
      this.tracks = [];
      this.tracks = ref(this.midiEditor.midi_json.tracks);
      this.$forceUpdate();
      this.initScrollBar();
    },
    updateMidi(midi: MidiJSON) {
      this.midiEditor.updateMidiJSON(midi);
      this.ppq = this.midiEditor.ppq;
      this.duration_ticks = this.midiEditor.duration_ticks;
      this.tracks = [];
      this.tracks = ref(this.midiEditor.midi_json.tracks);
      this.$forceUpdate();
      this.updateScrollBar();
    },
    keyDown(code: number) {
      // 钢琴键：开始弹奏
      if ((window as any).event.buttons == 1) {
        this.midiEditor.keyDown(code);
      }
    },
    keyUp(code: number) {
      // 钢琴键：停止弹奏
      this.midiEditor.keyUp(code);
    },
    play() {
      if (!this.midiEditor.is_play) {
        if (this.can_play) {
          this.context.dispatchMagixEvent(
            "midi-play",
            this.midiEditor.synth.playTick
          );
          this.storage.setState({
            ticks_progress: this.midiEditor.synth.playTick,
          });
          return this.midiEditor.play();
        }
        alert("请先放置至少一个音符");
      }
      this.context.dispatchMagixEvent(
        "midi-pause",
        this.midiEditor.synth.playTick
      );
      this.storage.setState({
        ticks_progress: this.midiEditor.synth.playTick,
      });
      this.midiEditor.pause();
    },
    pause() {
      this.context.dispatchMagixEvent(
        "midi-pause",
        this.midiEditor.synth.playTick
      );
      this.storage.setState({ ticks_progress: this.midiEditor.synth.playTick });
      this.midiEditor.pause();
    },
    reset() {
      this.midiEditor.reset();
      this.context.dispatchMagixEvent("midi-reset", null);
    },
    keyClass(paino_key: any, note_index: number) {
      let class_arr = [];
      if (paino_key.key_type[note_index] == 2) {
        class_arr.push("white-high");
      }
      if (paino_key.key_type[note_index] >= 1) {
        class_arr.push("white");
      }
      if (paino_key.key_type[note_index] == 0) {
        class_arr.push("black");
      }
      class_arr.push(`key-${note_index}`);
      class_arr.push(`cut-${this.cut_num}`);
      // 用于动态格线样式
      if (this.beat_width < 12) {
        class_arr.push("hide-bar-line");
      } else if (this.beat_width < 16) {
        class_arr.push("hide-beat-line");
      } else if (this.beat_width < 30) {
        class_arr.push("hide-cut-line");
      }
      return class_arr.join(" ");
    },
    keyLabel(octave: number, paino_key: any, note_index: number) {
      // 仅显示各八度C的标签
      if (paino_key.code[note_index] !== 11) {
        return "";
      }
      return `${paino_key.notes[note_index]}${octave}`;
    },
    initScrollBar() {
      // 初始化钢琴卷帘滑条，beat_width标准化并显示为初始缩放比例
      this.tick_width_bar =
        this.ScrollBarDOM.clientWidth /
        (this.duration_ticks + this.more_beat * this.ppq);
      this.scroll_left_tick = 0;
      this.beat_width = 60;
      let piano_roll_width = this.ScrollBarDOM.clientWidth - this.paino_width;
      let tick_num = (piano_roll_width / this.beat_width) * this.ppq;
      this.scroll_view_ticks = tick_num;
      this.updateTickWidth();
      this.PainoWrapDOM.scrollLeft = 0;
    },
    updateScrollBar() {
      // 处理宽度拖动事件：以滑条宽度更新beat_width并固定卷帘中起始tick
      let beat_width_before = this.beat_width;
      let width = this.ThumbDOM.offsetWidth;
      let left = parseInt(this.ThumbDOM.style.left.split("px")[0]);
      if (width > this.ScrollBarDOM.clientWidth - left) {
        this.ThumbDOM.style.width = `${this.ScrollBarDOM.clientWidth - left}px`;
        this.scroll_view_ticks =
          this.duration_ticks +
          this.more_beat * this.ppq -
          this.scroll_left_tick;
        // return;
      } else {
        this.scroll_view_ticks = width / this.tick_width_bar;
      }
      this.beat_width =
        this.PainoWrapDOM.offsetWidth / (this.scroll_view_ticks / this.ppq);
      this.updateTickWidth();
      this.PainoWrapDOM.scrollLeft =
        this.PainoWrapDOM.scrollLeft * (this.beat_width / beat_width_before);
    },
    reinitScrollBar() {
      // 初始化钢琴卷帘滑条，beat_width标准化并显示为初始缩放比例
      this.tick_width_bar =
        this.ScrollBarDOM.clientWidth /
        (this.duration_ticks + this.more_beat * this.ppq);
      this.updateTickWidth();
      this.updatePainoWrapScroll();
    },
    updateTickWidth() {
      //更新钢琴卷帘中Tick宽度
      this.tick_width = this.beat_width / this.ppq;
    },
    newMidi() {
      // 新建MIDI文件
      this.pause();
      let midi = new Midi();
      let track = midi.addTrack();
      midi.header.name = "Untitled";
      midi.header.setTempo(140);
      midi.header.timeSignatures.push({
        ticks: 0,
        timeSignature: [4, 4],
        measures: 0,
      });
      midi.header.update();
      track.name = "Track 0";
      this.loadMidi(midi.toJSON());
      this.midi_json = this.midiEditor.midi_json;
      this.midi_name = "未命名.mid";
    },
    addTrack() {
      this.pause();
      let track = this.midiEditor.midi.addTrack();
      let track_index = this.midiEditor.midi.tracks.length - 1;
      track.name = `Track ${track_index}`;
      this.midi_json = this.midiEditor.midi.toJSON();
      this.$forceUpdate();
      this.track_index = track_index;
    },
    removeTrack(track_index: number) {
      this.pause();
      this.midiEditor.midi_json.tracks.splice(track_index, 1);
      this.midi_json = JSON.parse(JSON.stringify(this.midiEditor.midi_json));
      this.$forceUpdate();
      if (this.track_index > this.midi_json.tracks.length - 1) {
        this.track_index = 0;
      }
    },
    saveMidi() {
      let filename = `${this.midi_name}`;
      let blob = new Blob([this.midiEditor.midi.toArray()]);
      let file = new window.File([blob], filename, { type: "blob" });
      let eleDownload = document.createElement("a");
      eleDownload.download = filename;
      eleDownload.style.display = "none";
      eleDownload.href = URL.createObjectURL(blob);
      document.body.appendChild(eleDownload);
      eleDownload.click();
      document.body.removeChild(eleDownload);
    },
    getTimeLineBeatStyle(beat_index: number) {
      // 时间轴动态样式
      let style: any = {};
      if (this.beat_width < 5) {
        style["padding-left"] = "0";
        style["visibility"] = "hidden";
        return style;
      }
      if (
        this.beat_width < 14 &&
        beat_index % Math.floor((this.duration_ticks / this.ppq) * 0.2) !== 0
      ) {
        style["padding-left"] = "0";
        style["visibility"] = "hidden";
        return style;
      }
      return style;
    },
    getTracks() {
      if (this.tracks.length > 0) {
        if (this.track_index > this.tracks.length - 1) {
          this.track_index = 0;
        }
        return this.tracks;
      }
      for (let i = 0; i < this.track_index + 1; i++) {
        this.tracks.push({ name: "" });
      }
      console.log(this.tracks, this.track_index);
      return this.tracks;
    },
  },
  computed: {
    cssVars() {
      return {
        "--key_height": `${this.key_height}px`,
        "--beat_width": `${this.beat_width}px`,
        "--paino_width": `${this.paino_width}px`,
        "--cut_num": this.cut_num,
        "--beat_per_bar": this.midiEditor.time_signature[0],
      };
    },
    getBeatArr() {
      // 根据总拍子数生成从0开始的数组用于循环渲染
      return Array.from(
        new Array(
          Math.ceil(this.duration_ticks / this.ppq) + this.more_beat
        ).keys()
      );
    },
    getProgressLeft() {
      // 根据播放进度计算进度条位置
      return (
        ((this.beat_width * Math.ceil(this.duration_ticks / this.ppq)) /
          this.duration_ticks) *
        this.ticks_progress
      );
    },
    playStatus() {
      if (this.is_play) {
        return "pause";
      }
      return "play";
    },
  },
  mounted() {
    this.InputFileDOM = this.$refs["input-file"];
    this.ScrollBarDOM = this.$refs["scroll-bar"];
    this.ThumbDOM = this.$refs["thumb"];
    this.TimeLineWrapDOM = this.$refs["time-line-wrap"];
    this.PainoWrapDOM = this.$refs["paino-wrap"];
    this.ContentWrapDOM = this.$refs["content-wrap"];
    this.PainoRollWrapDOM = this.$refs["paino-roll-wrap"];
    this.paino_wraps_scroll_left = toRef(this.PainoWrapDOM, "scrollLeft");
    new ResizeObserver((e) => {
      this.updateScrollBar();
    }).observe(this.ThumbDOM);
    new ResizeObserver((e) => {
      this.initScrollBar();
    }).observe(this.ScrollBarDOM);
    this.storage.addStateChangedListener((e: any) => {
      //this.data.midi_name.value = this.storage.state.midi_name;
      if (e.ticks_progress) {
        this.data.ticks_progress.value = this.storage.state.ticks_progress;
        this.midiEditor.locateTick(this.storage.state.ticks_progress);
      }
      if (e.midi_json) {
        this.data.midi_json.value = this.storage.state.midi_json;
        if (e.midi_json.newValue.tracks[0].notes.length > 0) {
          this.can_play = true;
          this.updateMidi(this.midi_json);
        } else {
          this.loadMidi(this.midi_json);
          this.can_play = false;
          this.pause();
        }
      }
      this.data.midi_name.value = this.storage.state.midi_name;
      this.data.content_scroll_top.value =
        this.storage.state.content_scroll_top;
      this.data.track_index.value = this.storage.state.track_index;
    });
    // 开始播放
    this.context.addMagixEventListener("midi-play", (e: any) => {
      this.midiEditor.locateTick(e.payload);
      this.midiEditor.play();
    });
    // 暂停播放
    this.context.addMagixEventListener("midi-pause", (e: any) => {
      this.midiEditor.pauseWhen(e.payload);
    });
    // 重新播放
    this.context.addMagixEventListener("midi-reset", () => {
      this.midiEditor.reset();
    });
    // 定位
    this.context.addMagixEventListener("midi-locate", (e: any) => {
      let target_tick = e.payload;
      if (target_tick < 0) {
        target_tick = 0;
      }
      if (target_tick > this.duration_ticks) {
        target_tick = this.duration_ticks;
      }
      this.midiEditor.locateTick(target_tick);
      this.storage.setState({ ticks_progress: target_tick });
    });
    // 加入房间自动加载
    if (this.storage.state.midi_json) {
      if (this.storage.state.midi_json.tracks[0].notes.length > 0) {
        this.can_play = true;
      }
      this.loadMidi(this.midi_json);
      this.ContentWrapDOM.scrollTop = this.content_scroll_top;
      this.midiEditor.locateTick(this.storage.state.ticks_progress);
      this.ticks_progress = this.midiEditor.ticks_progress;
      this.toRollRange(this.ticks_progress);
    }
    // 滚动同步
    this.context.addMagixEventListener("content-scroll", () => {
      this.ContentWrapDOM.scrollTop = this.content_scroll_top;
    });
    this.ContentWrapDOM.addEventListener("scroll", () => {
      this.storage.setState({
        content_scroll_top: this.ContentWrapDOM.scrollTop,
      });
      this.context.dispatchMagixEvent("content-scroll", null);
    });
    // 快捷键绑定
    document.onkeydown = (e: any) => {
      if (e.target.nodeName == "TEXTAREA" || e.target.nodeName == "INPUT") {
        return;
      }
      console.log(e.keyCode);
      // 切换笔
      if (e.keyCode == 80) {
        this.switchTool(1);
        return false;
      }
      // 切换橡皮
      if (e.keyCode == 69) {
        this.switchTool(2);
        return false;
      }
      // 空格播放/暂停
      if (e.keyCode == 32) {
        this.play();
        return false;
      }
    };
    // this.context.hotkey
  },
  watch: {
    ticks_progress: function (newProgress) {
      if (newProgress > this.scroll_left_tick + this.scroll_view_ticks) {
        this.toRollRange(newProgress);
      }
      if (newProgress < this.scroll_left_tick) {
        this.toRollRange(newProgress);
      }
    },
    duration_ticks: function () {
      this.reinitScrollBar();
    },
  },
};
</script>

<style lang="scss" scoped>
$beat-width: var(--beat_width);
$cut-num: var(--cut_num);
$beat-per-bar: var(--beat_per_bar);
$key-height: var(--key_height);

$fixed-wrap-height: 70px;
$line-width: 1px;
$cut-line: repeating-linear-gradient(
  90deg,
  transparent calc($beat-width / $cut-num - $line-width / 4),
  #3b3b3b calc($beat-width / $cut-num - $line-width / 4),
  #3b3b3b calc($beat-width / $cut-num + $line-width / 4),
  transparent calc(($beat-width / $cut-num + $line-width / 4)),
  transparent calc((($beat-width / $cut-num) * 2) - $line-width / 4)
);
$beat-line: repeating-linear-gradient(
  90deg,
  transparent calc($beat-width - $line-width / 2),
  #222 calc($beat-width - $line-width / 2),
  #222 calc($beat-width + $line-width / 2),
  transparent calc($beat-width + $line-width / 2),
  transparent calc($beat-width * 2 - $line-width / 2)
);
$bar-line: repeating-linear-gradient(
  90deg,
  transparent calc($beat-width * $beat-per-bar - $line-width / 2),
  #222 calc($beat-width * $beat-per-bar - $line-width / 2),
  #222 calc($beat-width * $beat-per-bar + $line-width / 2),
  transparent calc($beat-width * $beat-per-bar + $line-width / 2),
  transparent calc($beat-width * $beat-per-bar * 2 - $line-width / 2)
);
$bar-bg: repeating-linear-gradient(
  90deg,
  #505966 0,
  #505966 calc($beat-width * $beat-per-bar),
  #454857 calc($beat-width * $beat-per-bar),
  #454857 calc($beat-width * $beat-per-bar * 2)
);
$pitch-line: linear-gradient(
  #3b3b3b 0,
  #3b3b3b calc($line-width / 2),
  transparent calc($line-width / 2),
  transparent calc($key-height - $line-width / 2),
  #3b3b3b calc($key-height - $line-width / 2)
);

button {
  border: none;
  background-color: transparent;
  padding: 0;
}

.paino-roll-wrap {
  display: flex;
  position: absolute;
  top: 0;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #505966;

  .fixed-wrap {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    height: $fixed-wrap-height;
    width: 100%;
    background-color: #2e2f3a;

    .paino-scroll-bar-wrap {
      display: inline-flex;
      width: 100%;
      height: 25px;
      background-color: #4e4f62;

      .btn-left,
      .btn-right {
        flex-shrink: 0;
        flex-grow: 0;
        width: 25px;
        height: 25px;
        background-color: #888;
      }

      .scroll-bar {
        flex-grow: 1;
        position: relative;

        .thumb {
          position: absolute;
          height: 100%;
          width: 20px;
          max-width: 100%;
          background-color: #666;
          resize: horizontal;
          overflow: hidden;
          top: 0;
          left: 20px;

          .drag-area {
            height: 100%;
            width: calc(100% - 15px);
            cursor: grab;

            &:active {
              cursor: grabbing;
            }
          }
        }
      }
    }

    .tool-bar {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      height: 25px;
      padding: 0 5px;
      color: #b6c3c9;
      font-size: 12px;

      .midi-name {
        flex-shrink: 1;
        margin: 0 5px;
        width: 200px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .combo-wrap {
        position: relative;
        line-height: 23px;

        .combo-option-wrap {
          position: absolute;
          top: 23px;
          z-index: 3;
          background-color: #2e2f3a;
          height: 0;
          width: 100%;
          overflow: hidden;

          .combo-option {
            cursor: pointer;
            border-radius: 3px;
            box-sizing: border-box;
            border: solid 1px transparent;

            &:hover {
              background-color: rgba(204, 204, 204, 0.2);
              border: solid 1px rgba(242, 242, 242, 0.5);
            }
          }
        }

        &:hover {
          & .combo-option-wrap {
            height: fit-content;
          }
        }
      }

      .combo-track {
        width: 120px;

        .track-wrap {
          display: flex;
          flex-direction: row;
          align-items: center;

          .track-index {
            flex-shrink: 0;
            flex-grow: 0;
            padding: 0 3px;
            color: #888;
          }
          .track-name {
            flex-shrink: 1;
            flex-grow: 1;
            margin-left: 2px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .btn-remove {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 18px;
            width: 18px;
            margin-right: 3px;
            opacity: 0;
            transition: all 0.1s;

            &:deep(svg) {
              fill: #b6c3c9;
            }

            &:hover {
              background-color: rgba(204, 204, 204, 0.2);
            }
          }

          &.combo-option:hover {
            .btn-remove {
              opacity: 1;
            }
          }
        }
      }

      & .btn-tool-wrap {
        flex-grow: 1;
        flex-shrink: 0;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        .combo-cut-wrap {
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          align-items: center;

          .combo-cut {
            width: 30px;

            .cut-wrap {
              text-align: center;
            }
          }
        }
      }

      button {
        flex-shrink: 0;
        display: flex;
        position: relative;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 23px;
        height: 23px;
        line-height: 23px;
        border-radius: 3px;
        color: #b6c3c9;
        cursor: pointer;
        margin: 0 1px;

        &:deep(path) {
          fill: #b6c3c9;
        }

        &:hover {
          background-color: rgba(204, 204, 204, 0.2);
          border: solid 1px rgba(242, 242, 242, 0.5);

          :deep(path) {
            fill: #e1ac56;
          }
        }

        &.active {
          background-color: rgba(204, 204, 204, 0.2);

          :deep(path) {
            fill: #df9f3f;
          }
        }

        &.unavailable {
          cursor: not-allowed;

          :deep(path) {
            fill: rgba(182, 195, 201, 0.3);
          }

          &:hover {
            background-color: transparent;
            border: none;

            :deep(path) {
              fill: rgba(182, 195, 201, 0.3);
            }
          }
        }

        & .input-file {
          position: absolute;
          top: -100px;
          left: -100px;
          height: 100%;
          width: 100%;
          opacity: 0;
          border-radius: 3px;
          cursor: pointer;
        }
      }
    }

    .time-line-wrap {
      position: absolute;
      bottom: 0;
      box-sizing: border-box;
      border-collapse: collapse;
      overflow: hidden;
      background-color: #2d2e3e;
      color: #ccc;

      tr {
        height: $key-height;
        font-size: 0;

        td {
          padding: 0;
        }
      }

      .time-line {
        .time-line-beat {
          width: $beat-width;
          height: $key-height;
          display: inline-flex;

          &.bar-start {
            font-size: 8px;
            align-items: center;
          }
        }
      }
    }
  }

  .content-wrap {
    width: 100%;
    height: calc(100% - $fixed-wrap-height);
    margin-top: $fixed-wrap-height;
    overflow-y: scroll;

    .content-scroll-wrap {
      display: flex;
      height: fit-content;

      .side-paino-key {
        flex-shrink: 0;
        width: 80px;
      }

      .paino-wrap {
        flex-grow: 1;
        overflow-x: hidden;
      }
    }
  }

  &.pen {
    .content-wrap {
      cursor: url("../assets/cursor/pen.svg") 8 8, auto;
    }
  }

  &.eraser {
    .content-wrap {
      cursor: url("../assets/cursor/eraser.svg") 8 8, auto;
      .notes-wrap.active .note {
        cursor: url("../assets/cursor/eraser.svg") 8 8, auto;
        .move-area {
          cursor: url("../assets/cursor/eraser.svg") 8 8, auto;
        }

        .drag-area {
          cursor: url("../assets/cursor/eraser.svg") 8 8, auto;
        }
      }
    }
  }
}

.paino-roll {
  position: relative;

  .notes-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
    color: transparent;

    .note {
      position: absolute;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      height: $key-height;
      box-sizing: border-box;
      line-height: 10px;
      background-color: #75c1e1;
      border-radius: 2px;
      border: solid 1px #333;
      overflow: hidden;

      &.focus {
        background-color: #b6c3c9;
      }

      .move-area {
        width: 95%;
        height: 100%;
        line-height: 10px;
      }

      .drag-area {
        flex-shrink: 0;
        display: inline-block;
        height: 100%;
        line-height: 10px;
        width: 3px;
      }
    }

    &.active {
      color: #fff;
      opacity: 1;
      z-index: 1;
      pointer-events: auto;

      & .note .move-area {
        cursor: move;
      }

      & .note .drag-area {
        cursor: w-resize;
      }
    }
  }

  .progress-line {
    position: absolute;
    z-index: 2;
    top: 0;
    width: 3px;
    height: 100%;
    background-color: green;
  }

  .roll-wrap {
    box-sizing: border-box;
    border-collapse: collapse;

    tr {
      height: $key-height;
      font-size: 0;

      td {
        padding: 0;
      }
    }

    .pitch {
      background-size: calc($beat-width * $beat-per-bar * 2) 100%;
      background-image: $pitch-line, $bar-line, $beat-line, $cut-line, $bar-bg;

      &.hide-cut-line {
        background-image: $pitch-line, $bar-line, $beat-line, $bar-bg;
      }

      &.hide-beat-line {
        background-image: $pitch-line, $bar-line, $bar-bg;
      }

      &.hide-bar-line {
        background-image: $pitch-line, $bar-bg;
      }
    }
  }
}

.octave-wrap {
  position: relative;

  .key {
    height: calc($key-height);
    /*border: 1px solid #222;*/
    font-size: calc($key-height * 0.5);
    text-align: right;
    box-sizing: border-box;
    cursor: pointer;

    &.white {
      height: calc($key-height * 1.5);
      background: linear-gradient(40deg, #f5f5f5, #fff);
      border: 1px solid #ccc;
      box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 #fff, inset 1px 0 0 #fff,
        inset -1px 0 0 #fff, 1px 1px 3px rgb(0 0 0 / 50%);
      border-radius: 0 5px 5px 0;
      transition: all 0.1s;

      &:hover,
      &.white.active {
        background: linear-gradient(40deg, #f2f2f2, #fff);
        border: none;
        box-shadow: inset 1px -1px 2px rgb(0 0 0 / 20%),
          inset 0px 1px 2px rgb(0 0 0 / 50%), 0px 1px 1px rgb(0 0 0 / 20%);
      }
    }

    &.white-high {
      height: calc($key-height * 2);
      line-height: calc($key-height * 2);
    }

    &.black {
      width: 70%;
      color: #fff;
      background: linear-gradient(160deg, #333, #000, #333);
      border-color: #666 #222 #111 #555;
      border-style: solid;
      border-width: 2px 7px 2px 1px;
      border-radius: 0 2px 2px 0;
      box-shadow: inset 0 1px 2px hsl(0deg 0% 100% / 40%),
        0 2px 3px rgb(0 0 0 / 40%);
      transition: all 0.1s;

      &:hover,
      &.black.active {
        background: linear-gradient(160deg, #373737, #434343, #5f5f5f);
        border-color: #3d3d3d #424242 #343434 #555;
        border-style: solid;
        border-width: 2px 3px 2px 1px;
        box-shadow: inset 0 1px 2px hsl(0deg 0% 100% / 70%),
          0 2px 3px rgb(0 0 0 / 40%);
      }
    }

    &.key-1,
    &.key-3,
    &.key-5,
    &.key-8,
    &.key-10 {
      position: relative;
      top: calc(($key-height + 2px) * 0.5);
      margin-top: calc(($key-height) * (1 - 2));
    }

    &.key-11 {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      padding-right: 1px;
      color: #bbb;

      &:hover {
        padding-right: 1.5px;
      }
    }
  }
}
</style>