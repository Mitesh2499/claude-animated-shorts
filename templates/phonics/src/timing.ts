// One clock for picture and sound. audio/song.py computes the SAME numbers from song.json.
import song from "../song.json";

export type Item = { letter: string; say: string; word: string; toy: string; image?: string; color?: string };
export const SONG = song as { title: string; bpm: number; introBeats: number; tailBeats: number; voice: string; items: Item[] };
export const ITEMS = SONG.items;

export const FPS = 30, W = 1080, H = 1920;
export const BEAT = 60 / SONG.bpm;            // 0.789 s at 76 BPM
export const BAR = 4 * BEAT;                  // one line "X is for Y" = one bar
export const INTRO = SONG.introBeats * BEAT;  // hook card (grid) before the first line
export const PUSH_F = 11;                     // push transition length (measured 10-11 frames)
export const PUSH_LEAD = 0.18;                // push starts this many s before the downbeat, so it lands ON the letter name

export const barStart = (i: number) => INTRO + i * BAR;        // letter name sung here (beat 1)
export const popT = (i: number) => barStart(i) + 2 * BEAT;     // object word sung here (beat 3): hard cut + pop
export const pushT = (i: number) => barStart(i) - PUSH_LEAD;   // push from previous card into letter i
export const TOTAL_S = INTRO + ITEMS.length * BAR + SONG.tailBeats * BEAT;
export const TOTAL = Math.round(TOTAL_S * FPS);

// measured rainbow order of the reference letters (ROYGBIV across A-H), cycled for longer songs
export const RAINBOW = ["#e8262b", "#f3661c", "#f7c21e", "#8cc83f", "#38c1ef", "#1f63db", "#1d3a92", "#7b36c9"];
export const colorOf = (i: number) => ITEMS[i]?.color ?? RAINBOW[i % RAINBOW.length];
