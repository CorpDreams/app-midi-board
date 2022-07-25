import type { NetlessApp } from "@netless/window-manager";
import icon from "./logo.svg";
import * as Tone from "tone";
import { createApp } from "vue";
import styles from "./style.css?inline";
import App from "./components/App.vue";
import MidiEditor from "./MidiEditor";

const MidiBoard: NetlessApp = {
  kind: "MidiBoard",
  label: "MIDI Board",
  icon: icon,
  setup(context) {
    const box = context.getBox();
    box.mountStyles(styles);

    const $content = document.createElement("div");
    $content.className = "app-midi-board";
    box.mountContent($content);

    const app = createApp(App)
    const midiEditor = new MidiEditor();
    app.provide("context", context)
    app.provide("midiEditor", midiEditor)

    app.mount($content);
    
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease("C4", "16n", 0);
    synth.triggerAttackRelease("A4", "16n", 0.2);

    context.emitter.on("destroy", () => {
      app.unmount();
    });
  },
};

export default MidiBoard;
