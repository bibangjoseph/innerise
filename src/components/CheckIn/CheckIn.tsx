import { useCallback, useEffect, useRef, useState } from 'react';
import type { Profile, Scores } from '../../types';
import { DEFAULT_CONV } from '../../data/conversations';
import styles from './CheckIn.module.css';

interface Message {
  role: 'ai' | 'user';
  text: string;
  time: string;
}

interface Props {
  profile: Profile;
  streak: number;
  onAddMemory: (entry: string) => void;
  onUpdateScores: (scores: Scores) => void;
  onIncrementStreak: () => void;
  onSaveCheckIn: (answers: string[]) => void;
  onReset: () => void;
  onGoToDiagnostic: () => void;
}

function now() {
  return new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
}


export default function CheckIn({
  profile, streak,
  onAddMemory, onUpdateScores, onIncrementStreak, onSaveCheckIn,
  onReset, onGoToDiagnostic,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [convStep, setConvStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);
  const [localScores, setLocalScores] = useState<Scores>(profile.scores);
  const [localMemory, setLocalMemory] = useState<string[]>(profile.memory);
  const [localStreak, setLocalStreak] = useState(streak);

  const scrollDown = () => {
    setTimeout(() => {
      msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const addAI = useCallback((text: string, qrs?: string[]) => {
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'ai', text: '…typing…', time: '' }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'ai', text, time: now() },
      ]);
      setBusy(false);
      if (qrs?.length) setQuickReplies(qrs);
      scrollDown();
    }, 900);
  }, []);

  // Init on profile change
  useEffect(() => {
    setMessages([]);
    setQuickReplies([]);
    setInputVal('');
    setConvStep(0);
    setAnswers([]);
    setShowAlert(false);
    setLocalScores(profile.scores);
    setLocalMemory(profile.memory);
    setLocalStreak(streak);
    setTimeout(() => addAI(profile.q1, profile.qrs1), 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name]);

  // Branche sélectionnée au step 1 (pos / neg / hard), déterminée par l'index du quick reply
  const [activeBranch, setActiveBranch] = useState<'pos' | 'neg' | 'hard'>('neg');

  const handleReply = useCallback((text: string) => {
    if (busy) return;

    setMessages((prev) => [...prev, { role: 'user', text, time: now() }]);
    setQuickReplies([]);
    scrollDown();

    const step = convStep + 1;
    setConvStep(step);
    const newAnswers = [...answers, text];
    setAnswers(newAnswers);

    const conv = DEFAULT_CONV;
    const firstName = profile.name.split(' ')[0];

    if (step === 1) {
      // Sauvegarder la première réponse en mémoire
      const entry = `"${text}" — J${profile.day}`;
      setLocalMemory((prev) => [entry, ...prev]);
      onAddMemory(entry);

      // Déterminer la branche selon l'index du quick reply cliqué
      const idx = profile.qrs1.indexOf(text);
      const branch: 'pos' | 'neg' | 'hard' = idx === 0 ? 'pos' : idx === 2 ? 'hard' : 'neg';
      setActiveBranch(branch);

      addAI(conv[branch].followUp, conv[branch].quickReplies);

    } else if (step === 2) {
      const branch = activeBranch;

      // Message de clôture
      addAI(conv[branch].closing(firstName));

      // Appliquer les deltas de scores
      const deltas = conv[branch].scoreDeltas;
      const sc: Scores = {
        clarte: Math.min(10, Math.max(1, localScores.clarte + (deltas.clarte ?? 0))),
        resil:  Math.min(10, Math.max(1, localScores.resil  + (deltas.resil  ?? 0))),
        motiv:  Math.min(10, Math.max(1, localScores.motiv  + (deltas.motiv  ?? 0))),
        ancr:   Math.min(10, Math.max(1, localScores.ancr   + (deltas.ancr   ?? 0))),
      };
      setLocalScores(sc);
      onUpdateScores(sc);

      if (sc.clarte <= 3 || sc.resil <= 3) {
        setAlertMsg('Scores bas détectés. Un diagnostic complet est recommandé.');
        setShowAlert(true);
      }

      // Sauvegarder la mémoire
      const memEntry = `${conv[branch].memoryTag} — J${profile.day}`;
      setLocalMemory((prev) => [memEntry, ...prev]);
      onAddMemory(memEntry);

      const newStreak = localStreak + 1;
      setLocalStreak(newStreak);
      onIncrementStreak();
      onSaveCheckIn(newAnswers);
    }
  }, [busy, convStep, answers, profile, localScores, localStreak, activeBranch,
      addAI, onAddMemory, onUpdateScores, onIncrementStreak, onSaveCheckIn]);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text || busy) return;
    setInputVal('');
    handleReply(text);
  };

  const SCORE_COLORS: Record<string, string> = {
    clarte: 'var(--purple)', resil: 'var(--green)', motiv: 'var(--coral)', ancr: 'var(--amber)',
  };
  const SCORE_LABELS: Record<string, string> = {
    clarte: 'Clarté', resil: 'Résilience', motiv: 'Motivation', ancr: 'Ancrage',
  };

  return (
    <div className={styles.wrap}>
      {/* Profile header */}
      <div className={styles.profileCard}>
        {profile.photoURL
          ? <img src={profile.photoURL} alt={profile.name} className={styles.avatar} />
          : <div className={styles.avatar}>{profile.init}</div>
        }
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>
            {profile.name}
            <span
              className={styles.levelPill}
              style={{ background: profile.lvlBg, color: profile.lvlCl }}
            >
              {profile.level}
            </span>
          </div>
          <div className={styles.profileMeta}>{profile.domain} · {profile.situation}</div>
        </div>
        <div className={styles.dayCol}>
          <strong style={{ color: 'var(--green)', fontSize: 18, display: 'block', fontWeight: 600 }}>
            {localStreak}
          </strong>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>jours</span>
        </div>
      </div>

      {/* Scores */}
      <div className={styles.sectionLbl}>État du moment</div>
      <div className={styles.scoresGrid}>
        {(Object.keys(localScores) as Array<keyof Scores>).map((k) => (
          <div key={k} className={styles.scoreCard}>
            <div className={styles.scoreVal} style={{ color: SCORE_COLORS[k] }}>{localScores[k]}</div>
            <div className={styles.scoreLbl}>{SCORE_LABELS[k]}</div>
            <div className={styles.scoreBar}>
              <div
                className={styles.scoreFill}
                style={{ width: `${localScores[k] * 10}%`, background: SCORE_COLORS[k] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {showAlert && (
        <div className={styles.alert}>
          <div className={styles.alertTitle}>Signal détecté par l'IA Miroir</div>
          <div className={styles.alertBody}>{alertMsg}</div>
        </div>
      )}

      {/* Chat */}
      <div className={styles.sectionLbl}>Check-in · J{profile.day}</div>
      <div className={styles.chatBox}>
        <div className={styles.chatHead}>
          <div className={styles.chatDot} />
          <span className={styles.chatName}>IA Miroir</span>
          <span className={styles.chatStatus}>En ligne</span>
        </div>
        <div className={styles.chatMsgs} ref={msgsRef}>
          {messages.map((m, i) => (
            <div key={i}>
              <div className={m.role === 'ai' ? styles.timeLeft : styles.timeRight}>
                {m.time}
              </div>
              {m.text === '…typing…' ? (
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              ) : (
                <div className={m.role === 'ai' ? styles.bubbleAi : styles.bubbleUser}>
                  {m.text}
                </div>
              )}
            </div>
          ))}
        </div>
        {quickReplies.length > 0 && (
          <div className={styles.quickReplies}>
            {quickReplies.map((q) => (
              <button key={q} className={styles.qr} onClick={() => handleReply(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        <div className={styles.inputRow}>
          <textarea
            className={styles.input}
            rows={1}
            placeholder="Réponds librement..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button className={styles.sendBtn} onClick={handleSend}>
            <svg viewBox="0 0 14 14"><path d="M12 7L2 2l2.5 5L2 12z" fill="white" /></svg>
          </button>
        </div>
      </div>

      {/* Memory */}
      <div className={styles.sectionLbl}>Mémoire active</div>
      <div className={styles.memoryBox}>
        {localMemory.map((m, i) => (
          <div key={i} className={`${styles.memItem} ${i === 0 && convStep >= 1 ? styles.memNew : ''}`}>
            <div className={styles.memDot} />
            {m}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className={styles.actionGrid}>
        <button className={styles.agBtn} onClick={onReset}><span>↺</span> Nouveau check-in</button>
        <button className={`${styles.agBtn} ${styles.sec}`} onClick={onGoToDiagnostic}><span>→</span> Lancer un diagnostic</button>
      </div>
    </div>
  );
}
