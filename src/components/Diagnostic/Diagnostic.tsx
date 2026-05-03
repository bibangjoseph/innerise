import { useState } from 'react';
import type { DiagnosticResult, DiagnosticState, F2Step, Profile } from '../../types';
import { SITUATIONS } from '../../data/profiles';
import { getPresetDiagnostic } from '../../data/conversations';
import styles from './Diagnostic.module.css';

interface Props {
  profile: Profile;
  onSaveDiagnostic: (data: DiagnosticResult) => void;
  onGoToCheckIn: () => void;
}

const MOODS = ['Bloqué·e', 'Anxieux·se', 'Confus·e', 'Épuisé·e', 'Motivé·e',
  'En deuil', 'En colère', 'Espoir', 'Perdu·e', 'Soulagé·e'];

const DOMAINS = [
  { key: 'professionnel', icon: '💼', name: 'Professionnel', sub: 'Carrière, activité' },
  { key: 'personnel', icon: '🌿', name: 'Personnel', sub: 'Confiance, émotions' },
  { key: 'relationnel', icon: '🤝', name: 'Relationnel', sub: 'Famille, amour' },
  { key: 'spirituel', icon: '✨', name: 'Spirituel', sub: 'Foi, sens, intérieur' },
];

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className={styles.stepDots}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${styles.dot} ${i === current ? styles.dotActive : ''} ${i < current ? styles.dotDone : ''}`}
        />
      ))}
    </div>
  );
}


export default function Diagnostic({ profile, onSaveDiagnostic, onGoToCheckIn }: Props) {
  const [step, setStep] = useState<F2Step>('domain');
  const [state, setState] = useState<DiagnosticState>({
    domain: '', situation: '', mood: '', intensity: 5, ctx: '',
  });
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loadingChecks, setLoadingChecks] = useState([false, false, false, false, false]);

  const launchDiag = async () => {
    setStep('loading');
    setLoadingChecks([false, false, false, false, false]);

    // Animation de chargement
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 400 + i * 300));
      setLoadingChecks((prev) => prev.map((v, idx) => idx <= i ? true : v));
    }

    const firstName = profile.name.split(' ')[0];
    const result = getPresetDiagnostic(state.domain, state.situation, state.mood, firstName, profile.day);
    setResult(result);
    onSaveDiagnostic(result);
    setStep('result');
  };

  const reset = () => {
    setState({ domain: '', situation: '', mood: '', intensity: 5, ctx: '' });
    setResult(null);
    setStep('domain');
  };

  if (step === 'domain') return (
    <div className={styles.wrap}>
      <div className={styles.memBanner}>
        <div className={styles.memBannerDot} />
        <div className={styles.memBannerTxt}>
          Mémoire F1 chargée · <strong>{profile.name.split(' ')[0]} · J{profile.day} · {profile.memory.length} faits</strong> — Le diagnostic intègre ton historique.
        </div>
      </div>
      <StepDots current={0} total={5} />
      <div className={styles.qTitle}>Dans quel domaine ?</div>
      <div className={styles.qSub}>L'IA adaptera le diagnostic à ton contexte mémorisé.</div>
      <div className={styles.domainGrid}>
        {DOMAINS.map((d) => (
          <div
            key={d.key}
            className={`${styles.dCard} ${state.domain === d.key ? styles.dSel : ''}`}
            onClick={() => setState((s) => ({ ...s, domain: d.key }))}
          >
            <span className={styles.dIcon}>{d.icon}</span>
            <div className={styles.dName}>{d.name}</div>
            <div className={styles.dSub}>{d.sub}</div>
          </div>
        ))}
      </div>
      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.btnP}`} disabled={!state.domain} onClick={() => setStep('situation')}>
          Continuer
        </button>
      </div>
    </div>
  );

  if (step === 'situation') return (
    <div className={styles.wrap}>
      <StepDots current={1} total={5} />
      <div className={styles.qTitle}>Quelle situation ?</div>
      <div className={styles.qSub}>Sélectionne ce qui correspond le mieux à ce que tu traverses.</div>
      <div className={styles.sitGrid}>
        {(SITUATIONS[state.domain] || []).map((s) => (
          <div
            key={s}
            className={`${styles.sitBtn} ${state.situation === s ? styles.sitSel : ''}`}
            onClick={() => setState((prev) => ({ ...prev, situation: s }))}
          >
            {s}
          </div>
        ))}
      </div>
      <div className={styles.btnRow}>
        <button className={styles.btn} onClick={() => setStep('domain')}>Retour</button>
        <button className={`${styles.btn} ${styles.btnP}`} disabled={!state.situation} onClick={() => setStep('mood')}>
          Continuer
        </button>
      </div>
    </div>
  );

  if (step === 'mood') return (
    <div className={styles.wrap}>
      <StepDots current={2} total={5} />
      <div className={styles.qTitle}>Comment tu te sens ?</div>
      <div className={styles.qSub}>Choisis l'état le plus proche de ce que tu vis en ce moment.</div>
      <div className={styles.moodWrap}>
        {MOODS.map((m) => (
          <div
            key={m}
            className={`${styles.moodPill} ${state.mood === m ? styles.moodSel : ''}`}
            onClick={() => setState((s) => ({ ...s, mood: m }))}
          >
            {m}
          </div>
        ))}
      </div>
      <div className={styles.intWrap}>
        <div className={styles.intLbl}>Intensité : <strong>{state.intensity}</strong>/10</div>
        <input
          type="range" min="1" max="10" value={state.intensity}
          onChange={(e) => setState((s) => ({ ...s, intensity: parseInt(e.target.value) }))}
        />
        <div className={styles.intScale}><span>Légère</span><span>Forte</span></div>
      </div>
      <div className={styles.btnRow}>
        <button className={styles.btn} onClick={() => setStep('situation')}>Retour</button>
        <button className={`${styles.btn} ${styles.btnP}`} disabled={!state.mood} onClick={() => setStep('context')}>
          Continuer
        </button>
      </div>
    </div>
  );

  if (step === 'context') return (
    <div className={styles.wrap}>
      <StepDots current={3} total={5} />
      <div className={styles.qTitle}>Décris en quelques mots</div>
      <div className={styles.qSub}>Optionnel — mais enrichit le diagnostic avec ta mémoire F1.</div>
      <textarea
        className={styles.ctxArea}
        placeholder="Ex : Je bloque sur ma page de vente, mon entourage doute de moi..."
        value={state.ctx}
        onChange={(e) => setState((s) => ({ ...s, ctx: e.target.value }))}
      />
      <div className={styles.btnRow}>
        <button className={styles.btn} onClick={() => setStep('mood')}>Retour</button>
        <button className={`${styles.btn} ${styles.btnP}`} onClick={launchDiag}>
          Lancer le diagnostic IA
        </button>
      </div>
    </div>
  );

  if (step === 'loading') return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingRing} />
      <div className={styles.loadingTitle}>Analyse en cours</div>
      <div className={styles.loadingSub}>L'IA croise ta mémoire avec ta situation</div>
      <div className={styles.lsList}>
        {['Lecture mémoire F1 (7 jours)', 'Analyse psychologique contextuelle', 'Calcul des 4 scores', 'Génération du rapport', 'Mise à jour de la mémoire'].map((label, i) => (
          <div key={i} className={styles.lsItem}>
            <div className={`${styles.lsCheck} ${loadingChecks[i] ? styles.lsDone : ''}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 'result' && result) {
    const SC: Record<string, string> = { clarte: 'var(--purple)', resilience: 'var(--green)', motivation: 'var(--coral)', ancrage: 'var(--amber)' };
    const SL: Record<string, string> = { clarte: 'Clarté', resilience: 'Résilience', motivation: 'Motivation', ancrage: 'Ancrage' };

    return (
      <div className={styles.wrap}>
        <StepDots current={4} total={5} />

        <div className={styles.resHeader}>
          <div style={{ marginBottom: 9 }}>
            <span className={styles.niveauBadge} style={{ background: result.niveau_bg, color: result.niveau_cl }}>
              {result.niveau}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>
              {state.domain} · {state.situation}
            </span>
          </div>
          <div className={styles.resTitle}>{result.resume}</div>
          {result.recommande_coach && (
            <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 5 }}>
              Un accompagnement coach est recommandé
            </div>
          )}
        </div>

        <div className={styles.resScores}>
          {(Object.keys(result.scores) as Array<keyof typeof result.scores>).map((k) => {
            const v = result.scores[k];
            const delta = result.deltas?.[k] ?? 0;
            return (
              <div key={k} className={styles.resScore}>
                <div className={styles.rsTop}>
                  <span className={styles.rsLabel}>{SL[k]}</span>
                  <span className={styles.rsVal}>
                    {v}
                    {delta !== 0 && (
                      <span
                        className={styles.rsDelta}
                        style={delta > 0
                          ? { background: 'var(--green-lt)', color: 'var(--green-dk)' }
                          : { background: 'var(--coral-lt)', color: '#712B13' }}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.rsBar}>
                  <div className={styles.rsFill} style={{ width: `${v * 10}%`, background: SC[k] }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.tagsRow}>
          {result.points_forts.map((t) => (
            <span key={t} className={styles.tag} style={{ background: 'var(--green-lt)', color: 'var(--green-dk)' }}>+ {t}</span>
          ))}
          {result.points_attention.map((t) => (
            <span key={t} className={styles.tag} style={{ background: 'var(--coral-lt)', color: '#712B13' }}>⚑ {t}</span>
          ))}
        </div>

        <div className={styles.actionCard} style={{ background: result.action_bg }}>
          <div className={styles.actionLbl} style={{ color: result.action_cl }}>Action du jour</div>
          <div className={styles.actionTxt} style={{ color: result.action_cl }}>→ {result.action}</div>
        </div>

        <div className={styles.msgCard} style={{ background: result.msg_bg }}>
          <div className={styles.msgTxt} style={{ color: result.msg_cl }}>"{result.message}"</div>
        </div>

        <div className={styles.memUpdate}>
          <div className={styles.memUpdateLbl}>Mémoire mise à jour</div>
          <div className={styles.memNewItem}>
            <div className={styles.memNewDot} />
            {result.nouvelle_memoire}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
            Disponible pour ton prochain check-in F1
          </div>
        </div>

        <div className={styles.actionGrid}>
          <button className={styles.agBtn} onClick={reset}><span>↺</span>Nouveau diagnostic</button>
          <button className={styles.agBtn} onClick={onGoToCheckIn}><span>←</span>Retour check-in</button>
          <button className={`${styles.agBtn} ${styles.agP}`}><span>👤</span>Voir un coach</button>
          <button className={`${styles.agBtn} ${styles.agSec}`} onClick={reset}><span>+</span>Partager rapport</button>
        </div>
      </div>
    );
  }

  return null;
}
