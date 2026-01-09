import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

const ITEMS_PER_PAGE = 5;

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
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Use ref for synchronous check to prevent rapid clicks
  const deletingIdsRef = useRef(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
  };

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

  // Filter products based on category and search term
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filter by category
      if (filterCategory && product.category_id !== filterCategory) {
        return false;
      }
      // Filter by search term (search in name and tags)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(search);
        const tagsMatch = product.tags && product.tags.toLowerCase().includes(search);
        if (!nameMatch && !tagsMatch) {
          return false;
        }
      }
      return true;
    });
  }, [products, filterCategory, searchTerm]);

  // Calculate paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Handle filter change - RESETS PAGINATION TO PAGE 1
  const handleFilterChange = (type, value) => {
    // Reset to page 1 when any filter changes
    setCurrentPage(1);

    if (type === 'category') {
      setFilterCategory(value);
    } else if (type === 'search') {
      setSearchTerm(value);
    }
  };

  // Pagination navigation handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToPage = (page) => setCurrentPage(page);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of middle section
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = 4;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed before middle section
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed after middle section
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
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
        showMessage('Produkt borttagen!', 'success');
      } else {
        showMessage('Kunde inte ta bort produkten', 'error');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      showMessage('Natverksfel - forsok igen', 'error');
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
        if (editingProduct) {
          showMessage('Produkt uppdaterad!', 'success');
        } else {
          showMessage('Produkt skapad!', 'success');
        }
      } else {
        showMessage('Kunde inte spara produkten', 'error');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showMessage('Natverksfel - forsok igen', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '-';
  };

  const exportProducts = async (format = 'csv') => {
    setExporting(true);
    try {
      // Build URL with current filters to export only filtered data
      const params = new URLSearchParams({ format });
      if (filterCategory) {
        params.append('category_id', filterCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/export/products?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'products.json');
      } else {
        const blob = await response.blob();
        downloadBlob(blob, 'products.csv');
      }
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Export misslyckades');
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className={styles.loading}>Laddar produkter...</div>;
  }

  return (
    <div className={styles.section}>
      <div className={styles.listHeader}>
        <h2>{t('admin.products')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.addBtn} onClick={handleAdd}>
            + Lagg till produkt
          </button>
          <button
            className={styles.saveBtn}
            onClick={() => exportProducts('csv')}
            disabled={exporting}
          >
            {exporting ? '...' : 'CSV'}
          </button>
          <button
            className={styles.saveBtn}
            onClick={() => exportProducts('json')}
            disabled={exporting}
          >
            {exporting ? '...' : 'JSON'}
          </button>
        </div>
      </div>

      {/* Filter UI */}
      <div className={styles.filterContainer} style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Sok produkt..."
          value={searchTerm}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={styles.searchInput}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '200px'
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className={styles.filterSelect}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="">Alla kategorier</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          {filteredProducts.length} produkter
        </span>
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

      {filteredProducts.length === 0 ? (
        <div className={styles.empty}>
          <p>{products.length === 0 ? 'Inga produkter annu' : 'Inga produkter matchar filtret'}</p>
          {products.length === 0 && (
            <button className={styles.addBtn} onClick={handleAdd}>
              Lagg till forsta produkten
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.itemList}>
            {paginatedProducts.map(product => (
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

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className={styles.pagination} style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: currentPage === 1 ? '#f5f5f5' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Forsta
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: currentPage === 1 ? '#f5f5f5' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Foregaende
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} style={{ padding: '0.5rem' }}>...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={styles.paginationBtn}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: currentPage === page ? '#007bff' : '#fff',
                      color: currentPage === page ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontWeight: currentPage === page ? 'bold' : 'normal'
                    }}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Nasta
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sista
              </button>
            </div>
          )}

          {/* Page info */}
          <div style={{
            textAlign: 'center',
            marginTop: '0.5rem',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Sida {currentPage} av {totalPages} ({filteredProducts.length} produkter)
          </div>
        </>
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
