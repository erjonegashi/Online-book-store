import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userAxios';
import BookCard from '../../components/BookCard';

const BACKEND = 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

const CAT_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
  'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100',
  'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100',
  'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100',
  'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100',
  'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
];
const CAT_ICONS = ['📚','🔬','🎭','🌍','💼','🎨','✏️','🏆'];

export default function Home() {
  const [books,      setBooks]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors,    setAuthors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      userApi.get('/librat'),
      userApi.get('/kategorite'),
      userApi.get('/autoret'),
    ]).then(([b, k, a]) => {
      setBooks(b.data);
      setCategories(k.data.slice(0, 8));
      setAuthors(a.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/books?search=${encodeURIComponent(search.trim())}`);
    else navigate('/books');
  };

  const featured = books.slice(0, 8);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Your Online Bookstore
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-5">
            Discover Your Next<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Favourite Book
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto">
            Browse {books.length}+ books across every genre. From bestsellers to hidden gems — your perfect read is here.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-2 mb-10">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, author or genre..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg" />
            </div>
            <button type="submit"
              className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors shadow-lg whitespace-nowrap">
              Search
            </button>
          </form>

          <div className="flex items-center justify-center gap-8 text-sm text-blue-200/70">
            <span>📚 {books.length} Books</span>
            <span className="w-1 h-1 rounded-full bg-blue-400/40" />
            <span>🏷️ {categories.length} Categories</span>
            <span className="w-1 h-1 rounded-full bg-blue-400/40" />
            <span>✍️ {authors.length} Authors</span>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
                <p className="text-gray-500 text-sm mt-1">Find books in your favourite genre</p>
              </div>
              <Link to="/books" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat, i) => (
                <Link key={cat.kategori_id}
                  to={`/books?category=${cat.kategori_id}`}
                  className={`${CAT_COLORS[i % CAT_COLORS.length]} border rounded-xl p-4 text-center transition-all hover:-translate-y-0.5`}>
                  <div className="text-2xl mb-2">{CAT_ICONS[i % CAT_ICONS.length]}</div>
                  <div className="font-semibold text-xs leading-tight">{cat.emri}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Books ───────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
              <p className="text-gray-500 text-sm mt-1">Our latest additions to the collection</p>
            </div>
            <Link to="/books" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map(book => <BookCard key={book.liber_id} book={book} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Popular Authors ──────────────────────────── */}
      {authors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Popular Authors</h2>
              <p className="text-gray-500 text-sm mt-1">Explore books from our featured writers</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
              {authors.map(a => (
                <Link key={a.autori_id}
                  to={`/books?author=${a.autori_id}`}
                  className="text-center group">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl font-bold text-purple-600 mb-3 shadow-sm group-hover:ring-2 group-hover:ring-blue-400 group-hover:ring-offset-2 transition-all">
                    {imgSrc(a.foto_url)
                      ? <img src={imgSrc(a.foto_url)} alt={a.emri} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }} />
                      : a.emri?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                    {a.emri} {a.mbiemri}
                  </p>
                  {a.shtati && <p className="text-xs text-gray-400 mt-0.5">{a.shtati}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to start reading?</h2>
          <p className="text-blue-200 mb-8">Create your account today and place your first order in minutes.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register"
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Create Account
            </Link>
            <Link to="/books"
              className="px-8 py-3 bg-blue-500/30 hover:bg-blue-500/50 text-white font-bold rounded-xl border border-white/20 transition-colors">
              Browse Books
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
