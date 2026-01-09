import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminGames() {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', max_players: 1 });
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [message, setMessage] = useState({ text: '', type: '' });

  const deletingIdsRef = useRef(new Set());

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/admin/games', { credentials: 'include' });
      if (response.ok) {
        setGames(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGame(null);
    setForm({ name: '', slug: '', description: '', max_players: 1 });
    setShowModal(true);
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setForm({
      name: game.name,
      slug: game.slug,
      description: game.description || '',
      max_players: game.max_players || 1
    });
    setShowModal(true);
  };

  const handleToggleActive = async (game) => {
    try {
      const response = await fetch(`/api/admin/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !game.is_active })
      });

      if (response.ok) {
        setGames(prev => prev.map(g =>
          g.id === game.id ? { ...g, is_active: !game.is_active } : g
        ));
        showMessage(game.is_active ? 'Spelet inaktiverat' : 'Spelet aktiverat', 'success');
      } else {
        showMessage('Kunde inte uppdatera spelet', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle game:', error);
      showMessage('Nätverksfel - försök igen', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (deletingIdsRef.current.has(id)) return;

    deletingIdsRef.current.add(id);
    setDeletingIds(prev => new Set([...prev, id]));

    if (!confirm('Är du säker på att du vill ta bort detta spel? Eventuella highscores kommer också tas bort.')) {
      deletingIdsRef.current.delete(id);
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/games/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok || response.status === 404) {
        const data = await response.json();
        setGames(prev => prev.filter(g => g.id !== id));
        showMessage(data.warning || 'Spelet borttaget!', data.warning ? 'warning' : 'success');
      } else {
        showMessage('Kunde inte ta bort spelet', 'error');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      showMessage('Nätverksfel - försök igen', 'error');
    } finally {
      deletingIdsRef.current.delete(id);
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingGame
        ? `/api/admin/games/${editingGame.id}`
        : '/api/admin/games';
      const method = editingGame ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (response.ok) {
        fetchGames();
        setShowModal(false);
        showMessage(editingGame ? 'Spelet uppdaterat!' : 'Spelet skapat!', 'success');
      } else {
        const data = await response.json();
        showMessage(data.error || 'Kunde inte spara spelet', 'error');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showMessage('Nätverksfel - försök igen', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Laddar spel...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.listHeader}>
        <h2>{t('admin.games', 'Spel')}</h2>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Lägg till spel
        </button>
      </div>

      {message.text && (
        <div
          className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}
          role={message.type === 'success' ? 'status' : 'alert'}
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      {games.length === 0 ? (
        <div className={styles.empty}>
          <p>Inga spel ännu</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            Lägg till första spelet
          </button>
        </div>
      ) : (
        <div className={styles.itemList}>
          {games.map(game => (
            <div key={game.id} className={styles.item} style={{
              opacity: game.is_active ? 1 : 0.6,
              borderLeft: game.is_active ? '4px solid var(--color-success, #28a745)' : '4px solid var(--color-error, #dc3545)'
            }}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>
                  {game.name}
                  {!game.is_active && (
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: 'var(--color-error, #dc3545)',
                      color: 'white',
                      borderRadius: '4px'
                    }}>
                      Inaktiv
                    </span>
                  )}
                </div>
                <div className={styles.itemMeta}>
                  {game.description || 'Ingen beskrivning'}
                </div>
                <div className={styles.itemMeta} style={{ fontSize: '0.8rem' }}>
                  URL: /{game.slug} | Max {game.max_players} spelare
                </div>
              </div>
              <div className={styles.itemActions} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className={game.is_active ? styles.deleteBtn : styles.saveBtn}
                  onClick={() => handleToggleActive(game)}
                  style={{ minWidth: '80px' }}
                >
                  {game.is_active ? 'Inaktivera' : 'Aktivera'}
                </button>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(game)}
                  disabled={deletingIds.has(game.id)}
                >
                  Redigera
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(game.id)}
                  disabled={deletingIds.has(game.id)}
                >
                  {deletingIds.has(game.id) ? 'Tar bort...' : 'Ta bort'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingGame ? 'Redigera spel' : 'Lägg till spel'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Spelnamn *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Ex: Future Snake"
                />
              </div>
              {!editingGame && (
                <div className={styles.field}>
                  <label>URL-slug (valfritt, genereras automatiskt)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    placeholder="Ex: future-snake"
                  />
                  <small style={{ color: 'var(--color-text-light)' }}>
                    Lämna tomt för att generera från namnet
                  </small>
                </div>
              )}
              <div className={styles.field}>
                <label>Beskrivning</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Klassiskt ormspel med futuristisk twist"
                  rows={3}
                />
              </div>
              <div className={styles.field}>
                <label>Max antal spelare</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.max_players}
                  onChange={e => setForm({ ...form, max_players: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Avbryt
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Sparar...' : 'Spara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
