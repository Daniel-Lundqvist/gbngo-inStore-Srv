import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminAdvertisements() {
  const { t } = useTranslation();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({ message: '', price: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch('/api/admin/advertisements', { credentials: 'include' });
      if (response.ok) {
        setAdvertisements(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAd(null);
    setForm({ message: '', price: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setForm({
      message: ad.message || '',
      price: ad.price || '',
      is_active: ad.is_active === 1 || ad.is_active === true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Vill du verkligen ta bort denna annons?')) return;
    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setAdvertisements(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingAd
        ? `/api/admin/advertisements/${editingAd.id}`
        : '/api/admin/advertisements';
      const method = editingAd ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (response.ok) {
        fetchAdvertisements();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad) => {
    try {
      await fetch(`/api/admin/advertisements/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...ad,
          is_active: !ad.is_active
        })
      });
      fetchAdvertisements();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Laddar annonser...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.listHeader}>
        <h2>{t('admin.advertisements')}</h2>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Lagg till annons
        </button>
      </div>

      {advertisements.length === 0 ? (
        <div className={styles.empty}>
          <p>Inga annonser annu</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            Lagg till forsta annonsen
          </button>
        </div>
      ) : (
        <div className={styles.itemList}>
          {advertisements.map(ad => (
            <div key={ad.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>
                  {ad.message || '(Ingen text)'}
                </div>
                <div className={styles.itemMeta}>
                  {ad.price ? `Pris: ${ad.price}` : 'Inget pris angivet'}
                </div>
              </div>
              <div className={styles.toggle}>
                <div
                  className={`${styles.toggleSwitch} ${ad.is_active ? styles.active : ''}`}
                  onClick={() => toggleActive(ad)}
                />
                <span>{ad.is_active ? 'Aktiv' : 'Inaktiv'}</span>
              </div>
              <div className={styles.itemActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(ad)}>
                  Redigera
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(ad.id)}>
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
            <h3>{editingAd ? 'Redigera annons' : 'Lagg till annons'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Budskap (valfritt)</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Ex: Kaffe + bulle 25 kr!"
                />
              </div>
              <div className={styles.field}>
                <label>Pris (valfritt)</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="Ex: 25 kr"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Aktiv (visas i vilolage)
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
