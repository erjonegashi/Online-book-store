import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import userApi from '../../api/userAxios';
import BookCard from '../../components/BookCard';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'alpha',   label: 'A → Z' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

const PAGE_SIZE = 12;

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books,      setBooks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors,    setAuthors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search   = searchParams.get('search')   || '';
  const catId    = searchParams.get('category') || '';
  const authorId = searchParams.get('author')   || '';
  const sort     = searchParams.get('sort')     || 'newest';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      userApi.get('/librat'),
      userApi.get('/kategorite'),
      userApi.get('/autoret'),
    ]).then(([b, k, a]) => {
      setBooks(b.data);
      setCategories(k.data);
      setAuthors(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...books];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        `${b.titulli} ${b.autori_emri || ''} ${b.kategoria_emri || ''}`.toLowerCase().includes(q)
      );
    }
    if (catId)    result = result.filter(b => String(b.kategoria_id) === catId);
    if (authorId) result = result.filter(b => String(b.autori_id)   === authorId);

    switch (sort) {
      case 'alpha':      result.sort((a, b) => a.titulli.localeCompare(b.titulli)); break;
      case 'price_asc':  result.sort((a, b) => Number(a.cmimi) - Number(b.cmimi)); break;
      case 'price_desc': result.sort((a, b) => Number(b.cmimi) - Number(a.cmimi)); break;
      default:           result.sort((a, b) => b.liber_id - a.liber_id);
    }
    return result;
  }, [books, search, catId, authorId, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const set = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  const clearAll = () => { setSearchParams({}); setPage(1); };

  const hasFilters = search || catId || authorId;

  const selectedCat    = categories.find(c => String(c.kategori_id) === catId);
  const selectedAuthor = authors.find(a => String(a.autori_id) === authorId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {selectedCat ? selectedCat.emri
            : selectedAuthor ? `${selectedAuthor.emri} ${selectedAuthor.mbiemri}`
            : search ? `Results for "${search}"`
            : 'All Books'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} book{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="flex gap-8">

        {/* ── Sidebar filters ─────────────────── */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 space-y-6">

            {/* Search */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Search</label>
              <input type="text" value={search}
                onChange={e => set('search', e.target.value)}
                placeholder="Title, author…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button onClick={() => set('category', '')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${!catId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Categories
                </button>
                {categories.map(c => (
                  <button key={c.kategori_id} onClick={() => set('category', String(c.kategori_id))}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${String(c.kategori_id) === catId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {c.emri}
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Author</label>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button onClick={() => set('author', '')}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${!authorId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Authors
                </button>
                {authors.map(a => (
                  <button key={a.autori_id} onClick={() => set('author', String(a.autori_id))}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${String(a.autori_id) === authorId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {a.emri} {a.mbiemri}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearAll}
                className="w-full text-xs text-red-500 hover:text-red-700 font-semibold py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Top bar: mobile filter toggle + sort */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
            </button>
            <div className="flex-1" />
            <select value={sort} onChange={e => set('sort', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Mobile filter drawer */}
          {sidebarOpen && (
            <div className="lg:hidden mb-5 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label>
                  <select value={catId} onChange={e => set('category', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All</option>
                    {categories.map(c => <option key={c.kategori_id} value={c.kategori_id}>{c.emri}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Author</label>
                  <select value={authorId} onChange={e => set('author', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All</option>
                    {authors.map(a => <option key={a.autori_id} value={a.autori_id}>{a.emri} {a.mbiemri}</option>)}
                  </select>
                </div>
              </div>
              <input type="text" value={search} onChange={e => set('search', e.target.value)}
                placeholder="Search…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-5">
              {search && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => set('search', '')} className="ml-1 hover:text-blue-900">×</button>
                </span>
              )}
              {selectedCat && (
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {selectedCat.emri}
                  <button onClick={() => set('category', '')} className="ml-1 hover:text-purple-900">×</button>
                </span>
              )}
              {selectedAuthor && (
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {selectedAuthor.emri} {selectedAuthor.mbiemri}
                  <button onClick={() => set('author', '')} className="ml-1 hover:text-green-900">×</button>
                </span>
              )}
            </div>
          )}

          {/* Book grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No books found</h3>
              <p className="text-gray-500 text-sm mb-5">Try adjusting your search or filters.</p>
              <button onClick={clearAll}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(book => <BookCard key={book.liber_id} book={book} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
