import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userAxios';
import BookCard from '../../components/BookCard';
import { useUserAuth } from '../../context/UserAuthContext';
import { Search, BookOpen, ArrowRight } from 'lucide-react';

const BACKEND = 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

export default function Home() {
  const [books,       setBooks]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [authors,     setAuthors]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [serverError, setServerError] = useState(false);
  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop,    setShowDrop]    = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [searching,   setSearching]   = useState(false);

  const navigate = useNavigate();
  const { user } = useUserAuth();
  const dropRef  = useRef(null);

  useEffect(() => {
    Promise.all([
      userApi.get('/librat'),
      userApi.get('/kategorite'),
      userApi.get('/autoret'),
    ]).then(([b, k, a]) => {
      setBooks(Array.isArray(b.data) ? b.data : []);
      setCategories(Array.isArray(k.data) ? k.data.slice(0, 8) : []);
      setAuthors(Array.isArray(a.data) ? a.data.slice(0, 6) : []);
    }).catch(() => {
      setServerError(true);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const matches = books.filter(b =>
        b.titulli?.toLowerCase().includes(q) ||
        b.autori_emri?.toLowerCase().includes(q) ||
        b.kategoria_emri?.toLowerCase().includes(q)
      ).slice(0, 8);
      setSuggestions(matches);
      setShowDrop(true);
      setSearching(false);
      setActiveIdx(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, books]);

  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeDrop = () => { setShowDrop(false); setActiveIdx(-1); };

  const handleSearch = e => {
    if (e && e.preventDefault) e.preventDefault();
    closeDrop();
    if (query.trim()) navigate(`/books?search=${encodeURIComponent(query.trim())}`);
    else navigate('/books');
  };

  const handleKeyDown = e => {
    if (!showDrop && e.key !== 'Escape') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      navigate(`/book/${suggestions[activeIdx].liber_id}`);
      closeDrop();
      setQuery('');
    } else if (e.key === 'Escape') {
      closeDrop();
    }
  };

  const handleSuggestionClick = book => {
    navigate(`/book/${book.liber_id}`);
    closeDrop();
    setQuery('');
  };

  const PAGE_SIZE = 6;
  const [featuredPage, setFeaturedPage] = useState(1);
  const totalFeaturedPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const featured = books.slice((featuredPage - 1) * PAGE_SIZE, featuredPage * PAGE_SIZE);

  return (
    <div className="bg-white">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">

          <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-5">
            UBTNexus — University Bookstore
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white leading-tight tracking-tight mb-4">
            Find Your Next Great Read
          </h1>
          <p className="text-base text-blue-200 mb-8 max-w-md mx-auto leading-relaxed">
            Browse {books.length > 0 ? `${books.length}+` : 'hundreds of'} books across every genre. From bestsellers to hidden gems.
          </p>

          {/* ── Search ───────────────────────────────── */}
          <div ref={dropRef} className="relative max-w-lg mx-auto text-left">
            <form onSubmit={handleSearch}
              className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden transition-all">
              <Search size={15} className="ml-3.5 text-gray-400 shrink-0 pointer-events-none" />
              {searching && (
                <svg className="absolute right-20 w-3.5 h-3.5 text-gray-400 animate-spin"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <input
                type="text"
                value={query}
                autoComplete="off"
                spellCheck="false"
                placeholder="Search by title, author or genre…"
                onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && suggestions.length > 0 && setShowDrop(true)}
                className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <button type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shrink-0 border-l border-blue-600">
                Search
              </button>
            </form>

            {/* ── Autocomplete Dropdown ─────────────── */}
            {showDrop && (
              <div className="animate-dropdown absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                {suggestions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">
                    <Search size={20} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
                    No books found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <ul role="listbox">
                    {suggestions.map((book, i) => (
                      <li key={book.liber_id} role="option" aria-selected={i === activeIdx}>
                        <button
                          type="button"
                          onMouseDown={() => handleSuggestionClick(book)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors focus:outline-none
                            ${i === activeIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}
                            ${i < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          <div className="w-9 h-[3.2rem] rounded overflow-hidden bg-gray-100 shrink-0">
                            {imgSrc(book.foto_url)
                              ? <img src={imgSrc(book.foto_url)} alt={book.titulli}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display = 'none'; }} />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen size={14} className="text-gray-300" strokeWidth={1.25} />
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate leading-snug">{book.titulli}</p>
                            {book.autori_emri && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">{book.autori_emri}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-sm font-semibold text-gray-700 pl-2">
                            €{Number(book.cmimi).toFixed(2)}
                          </div>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onMouseDown={handleSearch}
                        className="w-full px-4 py-2 text-center text-xs font-medium text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
                      >
                        See all results for &ldquo;{query}&rdquo;
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-5 mt-6 text-xs text-blue-300">
            <span>{books.length} books</span>
            <span className="w-px h-3 bg-blue-600" />
            <span>{categories.length} categories</span>
            <span className="w-px h-3 bg-blue-600" />
            <span>{authors.length} authors</span>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-900">Browse by Category</h2>
              <Link to="/books" className="text-xs text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {categories.map(cat => (
                <Link key={cat.kategori_id}
                  to={`/books?category=${cat.kategori_id}`}
                  className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-3 text-center transition-colors">
                  <div className="font-medium text-gray-700 text-xs leading-tight">{cat.emri}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Books ───────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Featured Books</h2>
            <Link to="/books" className="text-xs text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : serverError ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Could not connect to the server</p>
              <p className="text-xs text-gray-400">Make sure the backend is running: <code className="bg-gray-100 px-1 rounded">cd backend &amp;&amp; npm run dev</code></p>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(book => <BookCard key={book.liber_id} book={book} />)}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-400">
              No books available at the moment.
            </div>
          )}

          {/* Pagination */}
          {!loading && totalFeaturedPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <button
                onClick={() => setFeaturedPage(p => Math.max(1, p - 1))}
                disabled={featuredPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                ←
              </button>

              {[...Array(totalFeaturedPages)].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setFeaturedPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      p === featuredPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setFeaturedPage(p => Math.min(totalFeaturedPages, p + 1))}
                disabled={featuredPage === totalFeaturedPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Authors ──────────────────────────── */}
      {authors.length > 0 && (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Popular Authors</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {authors.map(a => (
                <Link key={a.autori_id}
                  to={`/books?author=${a.autori_id}`}
                  className="text-center group">
                  <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-base font-semibold text-gray-500 mb-2.5 transition-opacity group-hover:opacity-80">
                    {imgSrc(a.foto_url)
                      ? <img src={imgSrc(a.foto_url)} alt={a.emri} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }} />
                      : a.emri?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors leading-tight truncate">
                    {a.emri} {a.mbiemri}
                  </p>
                  {a.shtati && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{a.shtati}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="border-t border-gray-100 py-14 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          {user ? (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Welcome back</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.emri} {user.mbiemri}</h2>
              <p className="text-gray-500 text-sm mb-6">Your next great read is waiting.</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link to="/books"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Browse Books
                </Link>
                <Link to="/wishlist"
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  My Wishlist
                </Link>
                <Link to="/profile"
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  My Orders
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to start reading?</h2>
              <p className="text-gray-500 text-sm mb-6">Create your account and place your first order in minutes.</p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/register"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Create Account
                </Link>
                <Link to="/books"
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  Browse Books
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
