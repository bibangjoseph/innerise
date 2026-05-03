import type { Scores } from '../types';

export interface ConvBranch {
  followUp: string;
  quickReplies: string[];
  closing: (firstName: string) => string;
  scoreDeltas: Partial<Scores>;
  memoryTag: string;
}

export interface ConvTree {
  pos: ConvBranch;
  neg: ConvBranch;
  hard: ConvBranch;
}

// Conversation tree par défaut (utilisé si le profil n'a pas de branche spécifique)
export const DEFAULT_CONV: ConvTree = {
  pos: {
    followUp: "C'est encourageant. Qu'est-ce qui contribue le plus à cet élan en ce moment ?",
    quickReplies: ['Ma discipline', 'Mon entourage', 'Une victoire récente'],
    closing: (n) => `${n}, cet élan est une ressource précieuse — protège-le. À demain.`,
    scoreDeltas: { clarte: 1, ancr: 1 },
    memoryTag: 'Élan positif',
  },
  neg: {
    followUp: "Je comprends. Sur 10, à quel point cette situation pèse sur ton énergie aujourd'hui ?",
    quickReplies: ['Lourd (7–10)', 'Moyen (4–6)', 'Léger (1–3)'],
    closing: (n) => `Merci pour ton honnêteté, ${n}. Un seul petit pas aujourd'hui suffit. À demain.`,
    scoreDeltas: { resil: -1 },
    memoryTag: 'Période difficile',
  },
  hard: {
    followUp: "C'est courageux de le reconnaître. Qu'est-ce qui te pèse le plus en ce moment ?",
    quickReplies: ['Le doute', 'La fatigue', 'La pression des autres'],
    closing: (n) => `${n}, traverser ça demande du courage. Je suis là. À demain.`,
    scoreDeltas: { resil: -1, motiv: -1 },
    memoryTag: 'Moment difficile reconnu',
  },
};

// ─── Diagnostics préconfigurés ───────────────────────────────────────────────

import type { DiagnosticResult } from '../types';

type DiagKey = string; // `${domain}:${mood_category}`

type MoodCategory = 'difficile' | 'neutre' | 'positif';

export function getMoodCategory(mood: string): MoodCategory {
  const positif = ['Motivé·e', 'Espoir', 'Soulagé·e'];
  const difficile = ['Bloqué·e', 'Anxieux·se', 'Épuisé·e', 'En deuil', 'En colère', 'Perdu·e'];
  if (positif.includes(mood)) return 'positif';
  if (difficile.includes(mood)) return 'difficile';
  return 'neutre';
}

type DiagTemplate = Omit<DiagnosticResult, 'resume' | 'nouvelle_memoire'> & {
  resume: (firstName: string, situation: string) => string;
  nouvelle_memoire: (firstName: string, situation: string, day: number) => string;
};

const DIAG_TEMPLATES: Record<DiagKey, DiagTemplate> = {
  'professionnel:difficile': {
    niveau: 'En transition',
    niveau_bg: '#EEEDFE', niveau_cl: '#3C3489',
    resume: (n, s) => `${n}, tu traverses une phase exigeante autour de "${s}". La pression est réelle, mais ta conscience de la situation est déjà une force.`,
    scores: { clarte: 5, resilience: 4, motivation: 6, ancrage: 4 },
    deltas: { clarte: 0, resilience: -1, motivation: 0, ancrage: -1 },
    points_forts: ['Conscience de la situation', 'Motivation malgré les obstacles'],
    points_attention: ['Énergie à préserver', 'Ancrage à consolider'],
    action: 'Identifie une seule chose concrète que tu peux faire aujourd\'hui — pas demain.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'La difficulté que tu traverses est temporaire. Ta capacité à avancer, elle, est durable.',
    msg_bg: '#EEEDFE', msg_cl: '#26215C',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Professionnel · "${s}" · En transition`,
    recommande_coach: false,
  },
  'professionnel:neutre': {
    niveau: 'Stable',
    niveau_bg: '#E1F5EE', niveau_cl: '#085041',
    resume: (n, s) => `${n}, tu navigues dans "${s}" avec une certaine stabilité. C'est le bon moment pour poser des fondations solides.`,
    scores: { clarte: 6, resilience: 6, motivation: 6, ancrage: 6 },
    deltas: { clarte: 1, resilience: 0, motivation: 0, ancrage: 0 },
    points_forts: ['Stabilité émotionnelle', 'Clarté croissante'],
    points_attention: ['Maintenir la dynamique', 'Éviter la routine'],
    action: 'Écris 3 priorités pour cette semaine — et choisis-en une seule à traiter aujourd\'hui.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'La stabilité n\'est pas l\'absence de mouvement — c\'est une base pour aller plus loin.',
    msg_bg: '#E8F4FD', msg_cl: '#1A5276',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Professionnel · "${s}" · Stable`,
    recommande_coach: false,
  },
  'professionnel:positif': {
    niveau: 'En croissance',
    niveau_bg: '#E8F8F5', niveau_cl: '#1E8449',
    resume: (n, s) => `${n}, l'élan que tu as autour de "${s}" est visible. Tu es dans une phase de croissance — capitalise dessus.`,
    scores: { clarte: 8, resilience: 7, motivation: 8, ancrage: 7 },
    deltas: { clarte: 1, resilience: 1, motivation: 1, ancrage: 0 },
    points_forts: ['Élan et momentum', 'Clarté de direction'],
    points_attention: ['Ne pas disperser l\'énergie', 'Ancrer les acquis'],
    action: 'Partage ton avancement avec quelqu\'un aujourd\'hui — le dire à voix haute le consolide.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'Tu es dans le bon couloir. Continue à avancer — la vitesse viendra naturellement.',
    msg_bg: '#E8F8F5', msg_cl: '#1E8449',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Professionnel · "${s}" · En croissance`,
    recommande_coach: false,
  },

  'personnel:difficile': {
    niveau: 'Fragile',
    niveau_bg: '#FDECEA', niveau_cl: '#712B13',
    resume: (n, s) => `${n}, ce que tu vis autour de "${s}" demande du courage. Reconnaître sa fragilité, c'est déjà une forme de force.`,
    scores: { clarte: 4, resilience: 3, motivation: 4, ancrage: 4 },
    deltas: { clarte: 0, resilience: -1, motivation: -1, ancrage: 0 },
    points_forts: ['Honnêteté avec soi-même', 'Volonté de comprendre'],
    points_attention: ['Résilience à reconstruire', 'Isolement à surveiller'],
    action: 'Fais une seule chose ce soir pour toi — une marche, un moment calme, un appel à quelqu\'un de confiance.',
    action_bg: '#FDECEA', action_cl: '#712B13',
    message: 'Tu n\'as pas à tout réparer aujourd\'hui. Un tout petit pas suffit.',
    msg_bg: '#EEEDFE', msg_cl: '#26215C',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Personnel · "${s}" · Fragile`,
    recommande_coach: true,
  },
  'personnel:neutre': {
    niveau: 'En transition',
    niveau_bg: '#EEEDFE', niveau_cl: '#3C3489',
    resume: (n, s) => `${n}, tu es dans une phase de questionnement autour de "${s}". C'est souvent le signe d'une transformation en cours.`,
    scores: { clarte: 5, resilience: 5, motivation: 5, ancrage: 5 },
    deltas: { clarte: 1, resilience: 0, motivation: 0, ancrage: 0 },
    points_forts: ['Ouverture au changement', 'Capacité d\'introspection'],
    points_attention: ['Trouver plus de clarté', 'Éviter l\'attentisme'],
    action: 'Écris pendant 5 minutes ce soir sans filtre — ce que tu ressens vraiment.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'La transition est inconfortable mais nécessaire. Tu es exactement où tu dois être.',
    msg_bg: '#EEEDFE', msg_cl: '#26215C',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Personnel · "${s}" · En transition`,
    recommande_coach: false,
  },
  'personnel:positif': {
    niveau: 'En croissance',
    niveau_bg: '#E8F8F5', niveau_cl: '#1E8449',
    resume: (n, s) => `${n}, ton rapport à "${s}" s'améliore clairement. Cette énergie positive est une ressource à entretenir.`,
    scores: { clarte: 7, resilience: 7, motivation: 8, ancrage: 7 },
    deltas: { clarte: 1, resilience: 1, motivation: 1, ancrage: 1 },
    points_forts: ['Confiance en soi croissante', 'Énergie positive'],
    points_attention: ['Maintenir les bonnes habitudes', 'Rester ancré·e'],
    action: 'Note une habitude positive que tu veux consolider cette semaine.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'Ce que tu construis en toi est solide. Continue.',
    msg_bg: '#E8F8F5', msg_cl: '#1E8449',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Personnel · "${s}" · En croissance`,
    recommande_coach: false,
  },

  'relationnel:difficile': {
    niveau: 'Fragile',
    niveau_bg: '#FDECEA', niveau_cl: '#712B13',
    resume: (n, s) => `${n}, la situation autour de "${s}" est émotionnellement lourde. Prendre soin de toi en premier est essentiel.`,
    scores: { clarte: 4, resilience: 4, motivation: 4, ancrage: 5 },
    deltas: { clarte: 0, resilience: -1, motivation: -1, ancrage: 0 },
    points_forts: ['Sensibilité émotionnelle', 'Conscience des relations'],
    points_attention: ['Énergie émotionnelle à préserver', 'Frontières à poser'],
    action: 'Identifie une limite que tu dois poser — et comment tu vas l\'exprimer simplement.',
    action_bg: '#FDECEA', action_cl: '#712B13',
    message: 'Prendre soin de toi n\'est pas de l\'égoïsme. C\'est une nécessité.',
    msg_bg: '#EEEDFE', msg_cl: '#26215C',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Relationnel · "${s}" · Fragile`,
    recommande_coach: true,
  },
  'relationnel:neutre': {
    niveau: 'Stable',
    niveau_bg: '#E1F5EE', niveau_cl: '#085041',
    resume: (n, s) => `${n}, tu gères "${s}" avec une certaine stabilité. Cette période est propice à la communication authentique.`,
    scores: { clarte: 6, resilience: 6, motivation: 5, ancrage: 6 },
    deltas: { clarte: 1, resilience: 0, motivation: 0, ancrage: 0 },
    points_forts: ['Stabilité relationnelle', 'Ouverture au dialogue'],
    points_attention: ['Approfondir la communication', 'Exprimer ses besoins'],
    action: 'Dis à quelqu\'un d\'important ce que tu apprécies chez lui/elle — aujourd\'hui.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'Les relations solides se construisent dans les moments ordinaires.',
    msg_bg: '#E8F4FD', msg_cl: '#1A5276',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Relationnel · "${s}" · Stable`,
    recommande_coach: false,
  },
  'relationnel:positif': {
    niveau: 'En croissance',
    niveau_bg: '#E8F8F5', niveau_cl: '#1E8449',
    resume: (n, s) => `${n}, ton rapport à "${s}" rayonne d'énergie positive. C'est le bon moment pour approfondir ces liens.`,
    scores: { clarte: 7, resilience: 7, motivation: 7, ancrage: 8 },
    deltas: { clarte: 1, resilience: 1, motivation: 1, ancrage: 1 },
    points_forts: ['Connexion authentique', 'Énergie relationnelle forte'],
    points_attention: ['Équilibrer donner et recevoir', 'Maintenir l\'authenticité'],
    action: 'Propose une conversation profonde à quelqu\'un qui compte pour toi cette semaine.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'Les relations épanouissantes sont le reflet de qui tu deviens.',
    msg_bg: '#E8F8F5', msg_cl: '#1E8449',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Relationnel · "${s}" · En croissance`,
    recommande_coach: false,
  },

  'spirituel:difficile': {
    niveau: 'En transition',
    niveau_bg: '#EEEDFE', niveau_cl: '#3C3489',
    resume: (n, s) => `${n}, le questionnement autour de "${s}" est profond. Le doute spirituel est souvent le début d'une compréhension plus grande.`,
    scores: { clarte: 4, resilience: 5, motivation: 4, ancrage: 6 },
    deltas: { clarte: 0, resilience: 0, motivation: -1, ancrage: 0 },
    points_forts: ['Profondeur de questionnement', 'Ancrage intérieur'],
    points_attention: ['Clarté à chercher', 'Ne pas s\'isoler dans le doute'],
    action: 'Prends 10 minutes de silence ou de méditation ce soir — sans objectif, juste être.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'Le doute n\'est pas l\'opposé de la foi — c\'est souvent son chemin.',
    msg_bg: '#EEEDFE', msg_cl: '#26215C',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Spirituel · "${s}" · En transition`,
    recommande_coach: false,
  },
  'spirituel:neutre': {
    niveau: 'Stable',
    niveau_bg: '#E1F5EE', niveau_cl: '#085041',
    resume: (n, s) => `${n}, ta démarche autour de "${s}" progresse calmement. Cette stabilité intérieure est une base solide.`,
    scores: { clarte: 7, resilience: 7, motivation: 6, ancrage: 8 },
    deltas: { clarte: 1, resilience: 0, motivation: 0, ancrage: 1 },
    points_forts: ['Ancrage intérieur solide', 'Pratique régulière'],
    points_attention: ['Approfondir la pratique', 'Intégrer dans le quotidien'],
    action: 'Choisis une valeur spirituelle importante et demande-toi comment tu l\'as incarnée aujourd\'hui.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'La croissance intérieure ne se voit pas toujours — mais elle est réelle.',
    msg_bg: '#EEEDFE', msg_cl: '#26215C',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Spirituel · "${s}" · Stable`,
    recommande_coach: false,
  },
  'spirituel:positif': {
    niveau: 'En croissance',
    niveau_bg: '#E8F8F5', niveau_cl: '#1E8449',
    resume: (n, s) => `${n}, tu rayonnes d'une clarté intérieure autour de "${s}". Cette paix que tu cultives est une lumière pour toi et les autres.`,
    scores: { clarte: 9, resilience: 8, motivation: 8, ancrage: 9 },
    deltas: { clarte: 1, resilience: 1, motivation: 1, ancrage: 1 },
    points_forts: ['Paix intérieure profonde', 'Clarté de sens'],
    points_attention: ['Partager cette lumière', 'Rester humble dans la croissance'],
    action: 'Écris une phrase qui résume ce que tu as appris sur toi-même ce mois-ci.',
    action_bg: '#E1F5EE', action_cl: '#085041',
    message: 'Qui tu es intérieurement se reflète dans tout ce que tu fais.',
    msg_bg: '#E8F8F5', msg_cl: '#1E8449',
    nouvelle_memoire: (n, s, d) => `Diagnostic J${d} — ${n} · Spirituel · "${s}" · En croissance`,
    recommande_coach: false,
  },
};

export function getPresetDiagnostic(
  domain: string,
  situation: string,
  mood: string,
  firstName: string,
  day: number,
): DiagnosticResult {
  const cat = getMoodCategory(mood);
  const key: DiagKey = `${domain}:${cat}`;
  const tpl = DIAG_TEMPLATES[key] ?? DIAG_TEMPLATES['personnel:neutre'];

  return {
    ...tpl,
    resume: tpl.resume(firstName, situation),
    nouvelle_memoire: tpl.nouvelle_memoire(firstName, situation, day),
  };
}
