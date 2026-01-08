import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/products/categories').then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load products:', err);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.tags && product.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory ||
      product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="page center loading">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <h1 style={{ marginTop: '1rem' }}>{t('products.title')}</h1>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder={t('products.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">{t('products.allCategories')}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ color: 'var(--color-text-light)', textAlign: 'center' }}>
          {t('products.noResults')}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {filteredProducts.map(product => (
            <div key={product.id} className="card">
              <h4 style={{ margin: 0 }}>{product.name}</h4>
              {product.category_name && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                  {product.category_name}
                </p>
              )}
              {product.tags && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                  {product.tags}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
