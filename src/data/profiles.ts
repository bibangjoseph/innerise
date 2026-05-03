import type { Profile } from '../types';

export const PROFILES: Profile[] = [
  {
    init: 'KA', name: 'Kofi Atta', level: 'En transition',
    lvlBg: 'var(--purple-lt)', lvlCl: 'var(--purple-dk)',
    domain: 'Professionnel', situation: 'Lancer une activité', day: 7,
    scores: { clarte: 6, resil: 5, motiv: 7, ancr: 4 },
    memory: [
      'Veut lancer une activité de coaching digital — bloqué sur le pricing',
      'Tension familiale : entourage sceptique',
      'Énergie variable — meilleur le matin',
      'Action J6 : écrire sa page de vente cette semaine',
    ],
    q1: "Bonjour Kofi. Hier tu avais décidé d'avancer sur ta page de vente. Tu as pu commencer ?",
    qrs1: ["Oui, j'ai commencé", 'Pas encore', 'Ça a été difficile'],
    fu: {
      pos: { q: "Bien. Sur 10, à quel point tu te sens aligné avec ce que tu écris ?", qrs: ['Très aligné (8+)', 'Moyennement (5–7)', 'Pas vraiment (<5)'] },
      neg: { q: "Qu'est-ce qui t'en a empêché — le temps, l'énergie ou le doute ?", qrs: ["Manque de temps", "Manque d'énergie", 'Le doute m\'a bloqué'] },
      hard: { q: "C'est courageux d'être honnête. Qu'est-ce qui a rendu ça difficile ?", qrs: ['La peur du regard des autres', 'Je ne sais pas par où commencer', 'Je manque de confiance'] },
    },
  },
  {
    init: 'AM', name: 'Ama Mensah', level: 'Fragile',
    lvlBg: 'var(--coral-lt)', lvlCl: '#712B13',
    domain: 'Relationnel', situation: 'Rupture amoureuse', day: 12,
    scores: { clarte: 3, resil: 4, motiv: 3, ancr: 5 },
    memory: [
      'Rupture il y a 3 semaines — relation de 4 ans',
      'Difficultés à dormir (J8 et J10)',
      'A recommencé le sport J11 — signal positif',
      'Hésite à recontacter son ex',
    ],
    q1: "Bonjour Ama. Tu as repris le sport hier — c'est courageux. Comment tu t'es réveillée ce matin ?",
    qrs1: ["Mieux que d'habitude", 'Pareil, difficile', 'Très difficile ce matin'],
    fu: {
      pos: { q: "C'est bon signe. L'idée de recontacter ton ex est encore présente aujourd'hui ?", qrs: ['Oui, fortement', 'Un peu moins', "Non, j'avance"] },
      neg: { q: "Je comprends. Tu as pu dormir cette nuit ?", qrs: ['Oui, mieux', 'Non, encore difficile', "J'ai beaucoup pensé"] },
      hard: { q: "Je suis là. Qu'est-ce qui pèse le plus — les souvenirs, la solitude ou l'avenir ?", qrs: ['Les souvenirs', 'La solitude', "L'avenir m'angoisse"] },
    },
  },
  {
    init: 'SB', name: 'Serge Bello', level: 'En croissance',
    lvlBg: 'var(--green-lt)', lvlCl: 'var(--green-dk)',
    domain: 'Spirituel', situation: 'Trouver du sens', day: 21,
    scores: { clarte: 8, resil: 7, motiv: 8, ancr: 9 },
    memory: [
      'Méditation quotidienne depuis J5',
      'Journaling du soir — 3 pages par jour',
      'A pardonné à son père J18 — moment clé',
      'Cherche à intégrer sa foi dans son travail',
    ],
    q1: "Bonjour Serge. 21 jours ensemble. Tu as parcouru un beau chemin. Comment tu commences cette journée ?",
    qrs1: ['Avec paix et clarté', "Avec beaucoup d'énergie", 'Avec quelques doutes'],
    fu: {
      pos: { q: "Beau. Est-ce que ta foi et ton travail commencent à s'aligner ?", qrs: ['Oui, clairement', 'Encore en chemin', 'Pas encore'] },
      neg: { q: "Qu'est-ce qui t'apporte le plus d'énergie dans ta pratique ?", qrs: ['La méditation', 'Le journaling', 'La prière'] },
      hard: { q: "Même en croissance, le doute est normal. Sur quoi porte-t-il ?", qrs: ['Mon chemin professionnel', 'Mes relations', 'Ma pratique spirituelle'] },
    },
  },
];

export const SITUATIONS: Record<string, string[]> = {
  professionnel: ['Lancer une activité', 'Chercher un emploi', 'Changer de carrière', 'Développer une compétence', 'Gérer un burn-out', 'Faire face à un échec', 'Gérer une promotion', 'Conflit au travail'],
  personnel: ['Manque de confiance', 'Solitude', 'Dépression / tristesse', "Peur de l'avenir", 'Fixer un objectif', 'Gestion des émotions', "Retrouver l'énergie", 'Accepter un changement'],
  relationnel: ['Rupture amoureuse', 'Début de relation', 'Se faire des amis', 'Mariage / engagement', 'Conflit familial', 'Deuil / perte', 'Solitude affective', 'Quitter une relation'],
  spirituel: ['Trouver du sens', 'Commencer une foi', 'Traverser un doute', 'Pardonner', 'Guérison intérieure', 'Méditation / prière', 'Crise de valeurs', 'Reconnexion à soi'],
};
