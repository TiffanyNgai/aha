import { useState } from 'react';
import { switchProfile } from '../store/progress';
import { MAX_PROFILES, PROFILE_EMOJI, activeProfile, useProfiles } from '../store/profiles';

/** Pick, add, rename or remove a learner on this device. Each learner has separate progress. */
export function ProfileSwitcher() {
  const profiles = useProfiles();
  const who = activeProfile(profiles);
  const [editing, setEditing] = useState<'add' | 'rename' | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(PROFILE_EMOJI[0]);

  const open = (mode: 'add' | 'rename') => {
    setEditing(mode);
    setName(mode === 'rename' ? who.name : '');
    setEmoji(mode === 'rename' ? who.emoji : PROFILE_EMOJI[profiles.list.length % PROFILE_EMOJI.length]);
  };
  const save = async () => {
    if (editing === 'add') { const p = profiles.add(name, emoji); await switchProfile(p.id); }
    else profiles.rename(who.id, name, emoji);
    setEditing(null);
  };
  const remove = () => {
    if (!confirm(`Remove ${who.name} and delete their progress on this device? This cannot be undone.`)) return;
    const next = profiles.list.find((p) => p.id !== who.id)!;
    // Switch first so the store is never left pointing at a key that is about to be deleted.
    switchProfile(next.id).then(() => profiles.remove(who.id));
  };

  return (
    <div className="card profiles">
      <div className="row" style={{ marginBottom: 10 }}>
        <b className="grow">Who’s learning?</b>
        <span className="muted" style={{ fontSize: 12 }}>Each learner keeps their own progress</span>
      </div>
      <div className="profile-row" role="radiogroup" aria-label="Learner">
        {profiles.list.map((p) => (
          <button key={p.id} role="radio" aria-checked={p.id === who.id} className={'profile-chip' + (p.id === who.id ? ' active' : '')} onClick={() => switchProfile(p.id)}>
            <span className="avatar">{p.emoji}</span><span className="pname">{p.name}</span>
          </button>
        ))}
        {profiles.list.length < MAX_PROFILES && !editing && (
          <button className="profile-chip add" onClick={() => open('add')}><span className="avatar">+</span><span className="pname">Add</span></button>
        )}
      </div>
      {editing ? (
        <form className="profile-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <input className="numeric-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" maxLength={20} autoFocus />
          <div className="emoji-pick" role="radiogroup" aria-label="Avatar">
            {PROFILE_EMOJI.map((em) => (
              <button type="button" key={em} role="radio" aria-checked={em === emoji} className={'w-btn' + (em === emoji ? ' active' : '')} onClick={() => setEmoji(em)}>{em}</button>
            ))}
          </div>
          <div className="row">
            <button type="submit" className="btn small">{editing === 'add' ? 'Create' : 'Save'}</button>
            <button type="button" className="btn small secondary" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn small secondary" onClick={() => open('rename')}>✏️ Rename</button>
          {profiles.list.length > 1 && <button className="btn small danger" onClick={remove}>Remove {who.name}</button>}
        </div>
      )}
    </div>
  );
}
