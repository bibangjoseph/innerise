export interface Scores {
  clarte: number;
  resil: number;
  motiv: number;
  ancr: number;
}

export interface FollowUp {
  q: string;
  qrs: string[];
}

export interface Profile {
  init: string;
  name: string;
  photoURL?: string;
  level: string;
  lvlBg: string;
  lvlCl: string;
  domain: string;
  situation: string;
  day: number;
  scores: Scores;
  memory: string[];
  q1: string;
  qrs1: string[];
  fu: {
    pos: FollowUp;
    neg: FollowUp;
    hard: FollowUp;
  };
}

export interface DiagnosticState {
  domain: string;
  situation: string;
  mood: string;
  intensity: number;
  ctx: string;
}

export interface DiagnosticResult {
  niveau: string;
  niveau_bg: string;
  niveau_cl: string;
  resume: string;
  scores: {
    clarte: number;
    resilience: number;
    motivation: number;
    ancrage: number;
  };
  deltas: {
    clarte: number;
    resilience: number;
    motivation: number;
    ancrage: number;
  };
  points_forts: string[];
  points_attention: string[];
  action: string;
  action_bg: string;
  action_cl: string;
  message: string;
  msg_bg: string;
  msg_cl: string;
  nouvelle_memoire: string;
  recommande_coach: boolean;
}

export type MainTab = 'f1' | 'f2';
export type F2Step = 'domain' | 'situation' | 'mood' | 'context' | 'loading' | 'result';
