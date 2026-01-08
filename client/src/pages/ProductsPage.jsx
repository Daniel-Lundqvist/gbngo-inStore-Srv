import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchWithTimeout } from '../hooks/useFetch';
import ErrorWithRetry from '../components/ErrorWithRetry';

// Highlight matching text in a string
function HighlightText({ text, highlight }) {
  if (!highlight || !highlight.trim() || !text) {
    return <>{text}</>;
  }

  const searchTerm = highlight.trim().toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(searchTerm);

  if (index === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + searchTerm.length);
  const after = text.slice(index + searchTerm.length);

  return (
    <>
      {before}
      <mark style={{ background: 'var(--color-primary-light, #ffe066)', padding: '0 2px', borderRadius: '2px' }}>
        {match}
      </mark>
      {after}
    </>
  );
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  // Read filters from URL params
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsTimeout(false);

    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchWithTimeout('/api/products', { timeout: 10000 }),
        fetchWithTimeout('/api/products/categories', { timeout: 10000 })
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err);
      setIsTimeout(err.isTimeout || false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Update URL when filters change
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params, { replace: true });
  };

  // Find category by name for URL-based filtering (supports both id and name)
  const getCategoryIdFromParam = (param) => {
    if (!param) return '';
    // Check if it's a number (category id)
    const asNumber = parseInt(param);
    if (!isNaN(asNumber) && categories.some(c => c.id === asNumber)) {
      return asNumber;
    }
    // Check if it's a category name (case-insensitive)
    const category = categories.find(c =>
      c.name.toLowerCase() === param.toLowerCase()
    );
    return category ? category.id : '';
  };

  const categoryId = getCategoryIdFromParam(selectedCategory);

  const filteredProducts = products.filter(product => {
    const searchTerm = search.trim();
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tags && product.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryId ||
      product.category_id === categoryId;
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // Check if there are actual filters applied (trimmed search or category)
  const hasActiveFilters = search.trim() || selectedCategory;
  const searchHighlight = search.trim();

  if (loading) {
    return <div className="page center loading">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="page">
        <header style={{ marginBottom: '2rem' }}>
          <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
            &larr; {t('common.back')}
          </Link>
          <h1 style={{ marginTop: '1rem' }}>{t('products.title')}</h1>
        </header>
        <ErrorWithRetry
          error={error}
          isTimeout={isTimeout}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <h1 style={{ marginTop: '1rem' }}>{t('products.title')}</h1>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t('products.search')}
          value={search}
          onChange={(e) => updateFilter('search', e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={categoryId || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">{t('products.allCategories')}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              background: 'var(--color-bg-light)',
              border: '1px solid var(--color-border)',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {t('products.clearFilters')}
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ color: 'var(--color-text-light)', textAlign: 'center' }}>
          {t('products.noResults')}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {filteredProducts.map(product => (
            <div key={product.id} className="card" style={{ overflow: 'hidden' }}>
              <h4 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <HighlightText text={product.name} highlight={searchHighlight} />
              </h4>
              {product.category_name && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                  {product.category_name}
                </p>
              )}
              {product.tags && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                  <HighlightText text={product.tags} highlight={searchHighlight} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
