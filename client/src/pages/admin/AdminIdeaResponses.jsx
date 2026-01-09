import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminIdeaResponses() {
  const { t } = useTranslation();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await fetch('/api/admin/idea-responses', { credentials: 'include' });
      if (response.ok) {
        setResponses(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingResponse(null);
    setForm({ question: '', answer: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (response) => {
    setEditingResponse(response);
    setForm({
      question: response.question,
      answer: response.answer,
      is_active: response.is_active === 1 || response.is_active === true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Vill du verkligen ta bort detta svar?')) return;
    try {
      const response = await fetch(`/api/admin/idea-responses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setResponses(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingResponse
        ? `/api/admin/idea-responses/${editingResponse.id}`
        : '/api/admin/idea-responses';
      const method = editingResponse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (response.ok) {
        fetchResponses();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (response) => {
    try {
      await fetch(`/api/admin/idea-responses/${response.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...response,
          is_active: !response.is_active
        })
      });
      fetchResponses();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Laddar idélåda-svar...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.listHeader}>
        <h2>{t('admin.ideaResponses')}</h2>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Lägg till svar
        </button>
      </div>

      {responses.length === 0 ? (
        <div className={styles.empty}>
          <p>Inga idélåda-svar ännu</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            Lägg till första svaret
          </button>
        </div>
      ) : (
        <div className={styles.itemList}>
          {responses.map(response => (
            <div key={response.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>
                  Er fråga: {response.question}
                </div>
                <div className={styles.itemMeta}>
                  Vårt svar: {response.answer.substring(0, 100)}
                  {response.answer.length > 100 && '...'}
                </div>
              </div>
              <div className={styles.toggle}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={response.is_active}
                  aria-label={`Aktivera/inaktivera svar: ${response.question.substring(0, 30)}${response.question.length > 30 ? '...' : ''}`}
                  className={`${styles.toggleSwitch} ${response.is_active ? styles.active : ''}`}
                  onClick={() => toggleActive(response)}
                />
                <span>{response.is_active ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
              <div className={styles.itemActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(response)}>
                  Redigera
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(response.id)}>
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingResponse ? 'Redigera svar' : 'Lägg till svar'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Kundens fråga</label>
                <textarea
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  required
                  placeholder="Ex: Varför har ni inte ekologisk mjölk?"
                />
              </div>
              <div className={styles.field}>
                <label>Vårt svar</label>
                <textarea
                  value={form.answer}
                  onChange={e => setForm({ ...form, answer: e.target.value })}
                  required
                  placeholder="Ex: Vi har nu tagit in ekologisk mjölk i sortimentet!"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Aktiv (visas i viloläge)
                </label>
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
