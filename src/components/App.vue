<template>
  <!--<div>
    <input type="file" @change="fileChange" />
    <div>{{ midi_name }}</div>
    <div>{{ progress }}</div>
    <button @click="play">play</button>
    <button @click="reset">reset</button>
    <button @click="update">update</button>
    <button @mousedown="keyDown" @mouseup="keyUp">key</button>
    -->
    <paino-roll />
  <!--</div>-->
</template>

<script lang="ts">
import type { AppContext } from "@netless/window-manager";
import * as Tone from "tone";
import { Midi, MidiJSON } from "@tonejs/midi";
import { computed, inject, onMounted, ref, Component } from "vue";
import MidiEditor from "../MidiEditor";
import paino_roll from "./paino_roll.vue";

export default {
  components: {
    "paino-roll": paino_roll,
  },
  setup() {
    const context = inject<AppContext>("context");
    if (!context)
      throw new Error("must call provide('context') before mount App");

    const midiEditor = inject<any>("midiEditor");
    if (!midiEditor) throw new Error("must call provide('midiEditor')");

    // init storage
    interface midi_board {
      midi_name: string;
      midi_json: object;
      progress: number;
    }
    const midi_board: midi_board = {
      midi_name: "",
      midi_json: {
        tracks: null,
      },
      progress: 0,
    };
    const storage = context.createStorage("midi-board-test", midi_board);

    const data = {
      midi_name: ref(storage.state.midi_name),
      midi_json: ref(storage.state.midi_json),
      progress: ref(storage.state.progress),
    };
    const midi_name = computed<string>({
      get: () => data.midi_name.value,
      set: (midi_name) => storage.setState({ midi_name }),
    });

    const progress = computed<number>({
      get: () => data.progress.value,
      set: (progress) => storage.setState({ progress }),
    });
    
    function readMidi(file: any) {
      return new Promise((resolve: (value: MidiJSON) => void, reject) => {
        const reader = new FileReader();
        reader.onload = function (e: any) {
          const midi = new Midi(e.target.result);
          return resolve(midi);
        };
        reader.readAsArrayBuffer(file);
      });
    }

    return {
      context,
      midiEditor,
      storage,
      data,
      midi_name,
      progress,
      readMidi,
    };
  },
  methods: {
    fileChange: async function (e: any) {
      let file = e.target.files[0];
      let midi = await this.readMidi(file);
      this.midi_name = file.name;
      this.storage.setState({
        midi_json: JSON.parse(JSON.stringify(midi)),
      });
      this.midiEditor.loadMidiJSON(midi);
    },
    keyDown() {
      this.midiEditor.keyDown(60);
      this.midiEditor.keyDown(66);
    },
    keyUp() {
      this.midiEditor.keyUp(60);
      this.midiEditor.keyUp(66);
    },
    play() {
      if (!this.midiEditor.is_play) {
        return this.midiEditor.play();
      }
      this.midiEditor.pause();
    },
    reset() {
      this.midiEditor.reset();
    },
    update() {
      this.midiEditor.addNote(0, {
        duration: 0.3375,
        durationTicks: 216,
        midi: 75,
        name: "D#2",
        ticks: 120,
        time: 0,
        velocity: 0.6299212598425197,
      });
    },
  },
  mounted() {
  },
};
</script>
