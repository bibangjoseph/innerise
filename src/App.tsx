import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import Auth from './components/Auth/Auth';
import Nav from './components/Nav/Nav';
import BottomNav from './components/BottomNav/BottomNav';
import CheckIn from './components/CheckIn/CheckIn';
import Diagnostic from './components/Diagnostic/Diagnostic';
import type { MainTab } from './types';

export default function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const {
    profile, streak,
    addMemory, updateScores, incrementStreak,
    saveCheckIn, saveDiagnostic,
  } = useProfile(user);

  const [tab, setTab] = useState<MainTab>('f1');
  const [authError, setAuthError] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      setAuthError('');
    } catch {
      setAuthError('Connexion impossible. Réessaie.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--green-lt)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <Auth onSignIn={handleSignIn} error={authError} />;
  }

  return (
    <>
      <Nav
        tab={tab}
        streak={streak}
        user={user}
        onSwitch={setTab}
        onLogout={logout}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'f1' && (
          <CheckIn
            profile={profile}
            streak={streak}
            onAddMemory={addMemory}
            onUpdateScores={updateScores}
            onIncrementStreak={incrementStreak}
            onSaveCheckIn={saveCheckIn}
  
            onReset={() => setTab('f1')}
            onGoToDiagnostic={() => setTab('f2')}
          />
        )}
        {tab === 'f2' && (
          <Diagnostic
            profile={profile}
            onSaveDiagnostic={saveDiagnostic}
            onGoToCheckIn={() => setTab('f1')}
          />
        )}
      </div>

      <BottomNav tab={tab} onSwitch={setTab} />
    </>
  );
}
