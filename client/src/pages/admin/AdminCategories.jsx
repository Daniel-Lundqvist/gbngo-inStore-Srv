import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', { credentials: 'include' });
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setForm({ name: '', sort_order: categories.length });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name, sort_order: category.sort_order || 0 });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Vill du verkligen ta bort denna kategori? Produkter i kategorin kommer bli okategoriserade.')) return;
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (response.ok) {
        fetchCategories();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Laddar kategorier...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.listHeader}>
        <h2>{t('admin.categories')}</h2>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Lägg till kategori
        </button>
      </div>

      {categories.length === 0 ? (
        <div className={styles.empty}>
          <p>Inga kategorier ännu</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            Lägg till första kategorin
          </button>
        </div>
      ) : (
        <div className={styles.itemList}>
          {categories.map(category => (
            <div key={category.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{category.name}</div>
                <div className={styles.itemMeta}>
                  Sorteringsordning: {category.sort_order || 0}
                </div>
              </div>
              <div className={styles.itemActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(category)}>
                  Redigera
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(category.id)}>
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
            <h3>{editingCategory ? 'Redigera kategori' : 'Lägg till kategori'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Kategorinamn</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Sorteringsordning</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })}
                  min="0"
                />
                <span className={styles.hint}>Lägre nummer visas först</span>
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
