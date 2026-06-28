import type { RegexMap } from "../types";

export const CLOSURE_MAP: RegexMap = [
  [/\bbutton[- ]?front\b/i, "button front"],
  [/\bbutton[- ]?up\b/i, "button-up"],
  [/\bbutton[- ]?down\b/i, "button-down"],
  [/\bhidden[- ]?zip(per)?\b/i, "hidden zipper"],
  [/\bzip(per)?\b/i, "zipper"],
  [/\bhook[- ]?(and|&)[- ]?eye\b/i, "hook & eye"],
  [/\bsnaps?\b/i, "snaps"],
  [/\bpull[- ]?on\b/i, "pull-on"],
  [/\blace[- ]?up\b/i, "lace-up"],
  [/\btoggle\b/i, "toggle"],
  [/\btie[- ]?waist\b/i, "tie waist"],
  [/\bbuckle\b/i, "buckle"],
  [/\bdrawstring\b/i, "drawstring"],
];
