import * as functions from 'firebase-functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Secure proxy for diagnostic AI calls.
 */
export const diagnose = functions
  .runWith({ secrets: ['ANTHROPIC_API_KEY'] })
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const { prompt } = req.body as { prompt?: string };
    if (!prompt) { res.status(400).json({ error: 'Missing prompt' }); return; }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');

    res.json({ text });
  });

/**
 * AI-powered check-in conversation endpoint.
 * Replaces hardcoded keyword matching with Claude.
 */
export const checkin = functions
  .runWith({ secrets: ['ANTHROPIC_API_KEY'] })
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const { firstName, memory, message, history, isFinal } = req.body as {
      firstName: string;
      memory: string[];
      message: string;
      history: { role: 'ai' | 'user'; text: string }[];
      isFinal: boolean;
    };

    if (!firstName || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const memoryBlock = memory?.length
      ? `Mémoire des check-ins précédents :\n${memory.map((m) => `- ${m}`).join('\n')}`
      : 'Aucune mémoire précédente (premier check-in).';

    const historyBlock = history?.length
      ? `Conversation en cours :\n${history.map((m) => `${m.role === 'ai' ? 'Coach' : firstName} : ${m.text}`).join('\n')}`
      : '';

    const systemPrompt = `Tu es un coach psychologique bienveillant et professionnel. Tu accompagnes ${firstName} dans un check-in quotidien de 2 échanges.

${memoryBlock}

Règles importantes :
- Sois chaleureux, direct et personnel. Utilise le prénom.
- Tes réponses sont courtes (2-3 phrases max).
- Les quickReplies sont des options de réponse courtes (3-5 mots max, 3 options).
- Ne répète pas ce que l'utilisateur vient de dire.
- Adapte ton ton à l'état émotionnel détecté.`;

    let userPrompt: string;

    if (!isFinal) {
      // Step 1 → pose une question de suivi
      userPrompt = `${historyBlock}

${firstName} vient de répondre : "${message}"

Génère une question de suivi bienveillante. Réponds uniquement avec ce JSON (aucun texte avant ou après) :
{
  "reply": "ta question de suivi",
  "quickReplies": ["option 1", "option 2", "option 3"]
}`;
    } else {
      // Step 2 → message de clôture + scores + mémoire
      userPrompt = `${historyBlock}

${firstName} vient de répondre : "${message}"

C'est la fin du check-in. Génère un message de clôture inspirant, puis évalue l'état de ${firstName}.
Réponds uniquement avec ce JSON (aucun texte avant ou après) :
{
  "reply": "message de clôture chaleureux et motivant (2 phrases)",
  "quickReplies": [],
  "scoreDeltas": {
    "clarte": 0,
    "resil": 0,
    "motiv": 0,
    "ancr": 0
  },
  "memoryEntry": "fait clé à retenir de ce check-in en 1 phrase"
}

Règles pour scoreDeltas : valeurs entre -2 et +2. Sois précis selon ce que ${firstName} a exprimé durant les deux échanges.`;
    }

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const raw = response.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('');

      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      res.json(parsed);
    } catch {
      // Fallback si Claude échoue
      if (!isFinal) {
        res.json({
          reply: `${firstName}, qu'est-ce qui t'a le plus marqué aujourd'hui ?`,
          quickReplies: ['Une victoire', 'Un obstacle', 'Une prise de conscience'],
        });
      } else {
        res.json({
          reply: `Merci ${firstName}. Je retiens tout ça. À demain.`,
          quickReplies: [],
          scoreDeltas: { clarte: 0, resil: 0, motiv: 0, ancr: 0 },
          memoryEntry: `Check-in complété — J`,
        });
      }
    }
  });
