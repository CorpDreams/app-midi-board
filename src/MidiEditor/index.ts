import * as Tone from "tone";
import { Midi, MidiJSON } from "@tonejs/midi";
import WebAudioTinySynth from 'webaudio-tinysynth';

interface NoteJSON {
    time: number;
    midi: number;
    name: string;
    velocity: number;
    duration: number;
    ticks: number;
    durationTicks: number;
}

class MidiEditor {
    midi: Midi
    midi_json: MidiJSON
    ticks_progress: number
    ticks_num: number
    is_play: boolean
    name: string
    duration_ticks: number
    ppq: number
    time_signatures: Array
    time_signature: Array

    constructor(midi_json?: MidiJSON) {
        this.ticks_progress = 0
        this.synth = new WebAudioTinySynth({ quality: 1, useReverb: 0 });
        this.synth.setLoop(1)
        this.duration_ticks = 0
        this.ppq = 1
        this.time_signature = [4, 4]
        this.is_play = false
        if (midi_json) {
            let midi_obj = new Midi();
            midi_obj.fromJSON(midi_json);
            this.midi = midi_obj
            this.init()
        }
    }

    init() {
        if (!this.midi) {
            return
        }
        this.ticks_progress = 0
        this.name = this.midi.name
        this.time_signatures = this.midi.header.timeSignatures
        this.time_signature = this.time_signatures[0].timeSignature
        this.ppq = this.midi_json.header.ppq
        this.duration_ticks = Math.ceil(this.midi.durationTicks / this.ppq) * this.ppq
        // TODO: 未知bug: Midi类赋值到this.midi，ppq会出现错误
        // this.synth.loadMIDI(this.midi.toArray());
        this.ticks_num = this.synth.getPlayStatus().maxTick
        Object.defineProperty(this.synth, 'playTick', {
            set: (value) => {
                this.synth._playTick = value
                this.ticks_progress = value
            },
            get: () => {
                return this.synth._playTick
            }
        })
        // TODO: 播放进度平滑增加
        // this.initTimer()
        this.synth.playTick = 0
    }

    initTimer() {
        this.timer = setInterval(() => {
            // console.log(this.ticks_progress)
            if(this.is_play){
                this.ticks_progress += 20
            }
        }, (60 / this.synth.song.tempo / this.ppq) * 1000 * 20)
    }

    update(progress: number) {
        this.name = this.midi.name
        this.time_signatures = this.midi.header.timeSignatures
        this.ppq = this.midi.header.ppq
        this.duration_ticks = Math.ceil(this.midi.durationTicks / this.ppq) * this.ppq
        this.synth.loadMIDI(this.midi.toArray());
        this.ticks_num = this.synth.getPlayStatus().maxTick
        if(this.ticks_num < progress){
            this.locateTick(this.ticks_num)
            return 
        }
        this.locateTick(progress)
        return
    }

    loadMidiJSON(midi_json: MidiJSON) {
        this.midi_json = midi_json
        let midi_obj = new Midi();
        midi_obj.fromJSON(midi_json);
        this.midi = midi_obj
        if(midi_obj.tracks[0].notes[0]){
            this.synth.loadMIDI(midi_obj.toArray());
        }
        this.init()
    }

    loadMidiFile(midi: File) {
        this.midi = new Midi(midi);
        this.midi_json = this.midi.toJSON()
        this.init()
    }

    updateMidiJSON(midi_json: MidiJSON) {
        let playing = false
        if(this.is_play){
            playing = true
        }
        this.pause()
        let progress = this.synth.getPlayStatus().curTick
        this.midi_json = midi_json
        let midi_obj = new Midi();
        midi_obj.fromJSON(midi_json);
        this.midi = midi_obj
        if(midi_obj.tracks[0].notes[0]){
            this.synth.loadMIDI(midi_obj.toArray());
        }
        this.update(progress)
        if(playing){
            this.play()
        }
    }

    updateMidiFile(midi: File) {
        this.pause()
        let progress = this.synth.getPlayStatus().curTick
        this.midi = new Midi(midi);
        this.midi_json = this.midi.toJSON()
        this.update(progress)
    }

    updateNote(track: number, index: number, note: NoteJSON){
        let progress = this.synth.getPlayStatus().curTick
        this.midi.tracks[track].notes[index] = note
        this.update(progress)
    }

    midiToName(midi: number){
        let key = midi - 12
        let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        return `${notes[key % 12]}${Math.floor(key/12)}`
    }

    ticksToSeconds(tick: number){
        return this.midi.header.ticksToSeconds(tick)
    }

    addNote(track: number, note: NoteJSON){
        let index = 0
        let progress = this.synth.getPlayStatus().curTick
        let notes = this.midi.tracks[track].notes
        for (let i = 0; i < notes.length; i++){
            if(notes[i].ticks <= note.ticks){
                index = i + 1
                continue
            }
            break
        }
        this.midi.tracks[track].notes.splice(index, 0, note)
        this.update(progress)
    }

    addTrack(name?: string){
        let progress = this.synth.getPlayStatus().curTick
        let track = this.midi.addTrack();
        if(name){
            track.name = name
        }else{
            track.name = `Track ${this.midi.tracks.length - 1}`;
        }
        this.midi_json = this.midi.toJSON()
        this.update(progress)
    }

    play() {
        if (!this.midi) return console.error('Please loadMidiJSON first!')
        this.is_play = true
        this.synth.playMIDI();
        this.ticks_progress = this.synth.playTick
    }

    pauseWhen(tick){
        if (!this.midi) return console.error('Please loadMidiJSON first!')
        if(this.is_play && !this.playTimer){
            this.playTimerCount = 0
            /*this.playTimer = setTimeout(()=>{
                while (this.synth.playTick < tick) {
                    this.playTimerCount++
                }
                this.pause()
                this.locateTick(tick)
                clearTimeout(this.playTimer)
            }, 0)
            */
            this.playTimer = setInterval(()=>{
                this.playTimerCount++
                if(this.playTimerCount > 20){
                    this.pause()
                    this.locateTick(tick)
                    clearInterval(this.playTimer)
                    this.playTimer = null
                    return
                }
                if(this.synth.playTick >= tick){
                    this.pause()
                    this.locateTick(tick)
                    clearInterval(this.playTimer)
                    this.playTimer = null
                    return
                }
            }, 100)
            
        }
    }

    pause() {
        this.is_play = false
        this.synth.stopMIDI();
    }

    locateTick(tick) {
        if (!this.midi) return console.error('Please loadMidiJSON first!')
        this.synth.locateMIDI(tick)
        this.ticks_progress = tick
    }

    reset() {
        this.locateTick(0)
        this.ticks_progress = 0
        clearInterval(this.playTimer)
    }

    keyDown(note: number) {
        this.synth.send([0x90, note, 100])
    }

    keyUp(note: number) {
        this.synth.send([0x80, note, 0])
    }

    destroy(){
        this.pause()
        this.synth = null
    }
}

export default MidiEditor;