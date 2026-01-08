import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', category_id: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  // Use ref for synchronous check to prevent rapid clicks
  const deletingIdsRef = useRef(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/categories', { credentials: 'include' })
      ]);
      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', category_id: categories[0]?.id || '', tags: '' });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category_id: product.category_id || '',
      tags: product.tags || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // Use ref for synchronous check - prevents rapid clicks from passing through
    if (deletingIdsRef.current.has(id)) return;

    // Mark as deleting IMMEDIATELY in ref (synchronous)
    deletingIdsRef.current.add(id);
    // Also update state for UI
    setDeletingIds(prev => new Set([...prev, id]));

    if (!confirm('Vill du verkligen ta bort denna produkt?')) {
      // User cancelled - remove from deleting
      deletingIdsRef.current.delete(id);
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      // Remove from list on success OR if already deleted (404)
      if (response.ok || response.status === 404) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      // Remove from deleting set
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
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (response.ok) {
        fetchData();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '-';
  };

  if (loading) {
    return <div className={styles.loading}>Laddar produkter...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.listHeader}>
        <h2>{t('admin.products')}</h2>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Lagg till produkt
        </button>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>Inga produkter annu</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            Lagg till forsta produkten
          </button>
        </div>
      ) : (
        <div className={styles.itemList}>
          {products.map(product => (
            <div key={product.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{product.name}</div>
                <div className={styles.itemMeta}>
                  Kategori: {getCategoryName(product.category_id)}
                  {product.tags && ` | Tags: ${product.tags}`}
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(product)}
                  disabled={deletingIds.has(product.id)}
                >
                  Redigera
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingIds.has(product.id)}
                >
                  {deletingIds.has(product.id) ? 'Tar bort...' : 'Ta bort'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingProduct ? 'Redigera produkt' : 'Lagg till produkt'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Produktnamn</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Kategori *</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="">Valj kategori...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Tags (separera med komma)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="snacks, godis, chips"
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
