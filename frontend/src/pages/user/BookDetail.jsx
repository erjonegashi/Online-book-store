import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userAxios';
import { useCart } from '../../context/CartContext';
import { useUserAuth } from '../../context/UserAuthContext';
import BookCard from '../../components/BookCard';
import { BookOpen, AlertTriangle, Zap, CheckCircle, Star, Heart, Loader2, Check, ShoppingCart } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

function Stars({ nota, interactive, onSelect }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => onSelect?.(n)}
          className={`leading-none transition-colors ${interactive ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}>
          <Star size={18} className={n <= nota ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { user } = useUserAuth();

  const [book,       setBook]       = useState(null);
  const [related,    setRelated]    = useState([]);
  const [author,     setAuthor]     = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [qty,        setQty]        = useState(1);
  const [added,      setAdded]      = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishId,     setWishId]     = useState(null);
  const [wishLoading,setWishLoading]= useState(false);

  // Review form
  const [reviewNota,    setReviewNota]    = useState(5);
  const [reviewKoment,  setReviewKoment]  = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError,   setReviewError]   = useState('');

  useEffect(() => {
    setLoading(true); setBook(null); setAdded(false); setQty(1); setReviews([]);
    setInWishlist(false); setWishId(null);

    userApi.get(`/librat/${id}`)
      .then(({ data }) => {
        setBook(data);
        const promises = [];
        if (data.autori_id)
          promises.push(userApi.get(`/autoret/${data.autori_id}`).then(r => setAuthor(r.data)).catch(() => {}));
        if (data.kategoria_id)
          promises.push(
            userApi.get('/librat').then(r => {
              setRelated(r.data.filter(b => b.kategoria_id === data.kategoria_id && b.liber_id !== data.liber_id).slice(0, 4));
            }).catch(() => {})
          );
        promises.push(
          userApi.get(`/vleresimet?liber_id=${id}`).then(r => {
            setReviews(r.data.filter(v => v.statusi === 'Approved'));
          }).catch(() => {})
        );
        return Promise.all(promises);
      })
      .catch(() => navigate('/books'))
      .finally(() => setLoading(false));
  }, [id]);

  // Check wishlist on mount if logged in
  useEffect(() => {
    if (!user || !id) return;
    userApi.get('/lista-deshirave')
      .then(({ data }) => {
        const entry = data.find(d => String(d.liber_id) === String(id) && String(d.klient_id) === String(user.id));
        if (entry) { setInWishlist(true); setWishId(entry.deshire_id); }
      })
      .catch(() => {});
  }, [id, user]);

  const inCart    = items.some(i => i.liber_id === book?.liber_id);
  const outOfStock = Number(book?.sasia_stok) === 0;

  const handleAddToCart = () => {
    if (!book || outOfStock) return;
    addToCart(book, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    setWishLoading(true);
    try {
      if (inWishlist && wishId) {
        await userApi.delete(`/lista-deshirave/${wishId}`);
        setInWishlist(false); setWishId(null);
      } else {
        const { data } = await userApi.post('/lista-deshirave', { klient_id: user.id, liber_id: id });
        setInWishlist(true); setWishId(data.deshire_id);
      }
    } catch { /* ignore */ }
    finally { setWishLoading(false); }
  };

  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true); setReviewError(''); setReviewSuccess('');
    try {
      await userApi.post('/vleresimet', {
        liber_id: id, klient_id: user.id, nota: reviewNota, komenti: reviewKoment,
      });
      setReviewSuccess('Vlerësimi juaj u dërgua dhe pret miratimin!');
      setReviewKoment(''); setReviewNota(5);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Gabim gjatë dërgimit');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.nota), 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-72 shrink-0 aspect-[3/4] bg-gray-200 rounded-2xl" />
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  if (!book) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-gray-600">Books</Link>
        {book.kategoria_emri && (
          <>
            <span>/</span>
            <Link to={`/books?category=${book.kategoria_id}`} className="hover:text-gray-600">{book.kategoria_emri}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{book.titulli}</span>
      </nav>

      {/* Main section */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16">

        {/* Cover */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-violet-100 rounded-2xl overflow-hidden shadow-lg">
            {imgSrc(book.foto_url) && (
              <img src={imgSrc(book.foto_url)} alt={book.titulli}
                loading="lazy"
                className="w-full h-full object-cover"
                onLoad={e => {
                  if (e.target.naturalWidth <= 1 || e.target.naturalHeight <= 1) {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            )}
            <div className={`w-full h-full items-center justify-center flex-col gap-2 ${imgSrc(book.foto_url) ? 'hidden' : 'flex'}`}>
              {book.titulli?.[0]
                ? <span className="text-7xl font-extrabold text-blue-200 select-none">{book.titulli[0].toUpperCase()}</span>
                : <BookOpen size={64} className="text-blue-200" strokeWidth={1} />}
            </div>
          </div>

          {/* Stock badge */}
          <div className={`mt-4 text-center py-2 rounded-xl text-sm font-semibold ${
            outOfStock ? 'bg-red-50 text-red-600' :
            book.sasia_stok <= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
            {outOfStock
              ? <span className="flex items-center justify-center gap-1.5"><AlertTriangle size={14} />Out of Stock</span>
              : book.sasia_stok <= 5
                ? <span className="flex items-center justify-center gap-1.5"><Zap size={14} />Only {book.sasia_stok} left!</span>
                : <span className="flex items-center justify-center gap-1.5"><CheckCircle size={14} />In Stock ({book.sasia_stok})</span>
            }
          </div>

          {/* Rating summary */}
          {avgRating && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <Star size={15} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-gray-800">{avgRating}</span>
              <span className="text-gray-400">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          {book.kategoria_emri && (
            <Link to={`/books?category=${book.kategoria_id}`}
              className="inline-block text-xs text-blue-600 font-semibold uppercase tracking-wide bg-blue-50 px-2.5 py-1 rounded-full mb-3 hover:bg-blue-100 transition-colors">
              {book.kategoria_emri}
            </Link>
          )}

          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-2">{book.titulli}</h1>

          {book.autori_emri && (
            <Link to={`/books?author=${book.autori_id}`}
              className="text-lg text-blue-600 hover:underline font-medium">
              by {book.autori_emri}
            </Link>
          )}

          <div className="mt-6 mb-6">
            <span className="text-4xl font-extrabold text-gray-900">{Number(book.cmimi).toFixed(2)}</span>
            <span className="text-2xl text-gray-500 font-semibold ml-1">€</span>
          </div>

          {/* Qty + Add to cart + Wishlist */}
          {!outOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100 font-bold transition-colors">−</button>
                <span className="px-5 py-3 font-semibold text-gray-800 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(q + 1, Number(book.sasia_stok)))}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100 font-bold transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  added ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {added
                ? <span className="flex items-center justify-center gap-1.5"><Check size={15} />Added to Cart!</span>
                : <span className="flex items-center justify-center gap-1.5"><ShoppingCart size={15} />{inCart ? 'Add More' : 'Add to Cart'}</span>
              }
              </button>
              <button
                onClick={toggleWishlist}
                disabled={wishLoading}
                title={inWishlist ? 'Hiq nga lista e dëshirave' : 'Shto në listën e dëshirave'}
                className={`p-3 rounded-xl border-2 transition-all text-xl ${
                  inWishlist
                    ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}
              >
                {wishLoading
                  ? <Loader2 size={20} className="animate-spin" />
                  : <Heart size={20} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} strokeWidth={1.75} />
                }
              </button>
            </div>
          )}

          {outOfStock && (
            <div className="flex items-center gap-3 mb-4">
              <button disabled className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                Out of Stock
              </button>
              <button
                onClick={toggleWishlist}
                disabled={wishLoading}
                className={`p-3 rounded-xl border-2 transition-all text-xl ${
                  inWishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}
              >
                {wishLoading
                  ? <Loader2 size={20} className="animate-spin" />
                  : <Heart size={20} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} strokeWidth={1.75} />
                }
              </button>
            </div>
          )}

          <Link to="/cart"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.qty, 0)} items)`}
          </Link>

          {/* Book details table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Format', book.formati],
                  ['Publisher', book.botuesi],
                  ['Year', book.viti_botimit],
                  ['ISBN', book.isbn],
                  ['Category', book.kategoria_emri],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-500 font-medium w-32 bg-gray-50">{label}</td>
                    <td className="px-4 py-3 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Description */}
      {book.pershkrimi && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Book</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{book.pershkrimi}</p>
        </div>
      )}

      {/* Author bio */}
      {author && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-8 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About the Author</h2>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 overflow-hidden flex items-center justify-center text-xl font-bold text-purple-600 shrink-0">
              {imgSrc(author.foto_url)
                ? <img src={imgSrc(author.foto_url)} alt={author.emri} className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                : author.emri?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{author.emri} {author.mbiemri}</h3>
              {author.shtati && <p className="text-sm text-gray-500">{author.shtati}</p>}
              {author.biografia && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{author.biografia}</p>}
              <Link to={`/books?author=${author.autori_id}`}
                className="inline-block mt-3 text-xs text-blue-600 font-semibold hover:underline">
                View all books by {author.emri} {author.mbiemri} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews ──────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">({reviews.length})</span>
            )}
          </h2>
          {avgRating && (
            <div className="flex items-center gap-2">
              <Stars nota={Math.round(Number(avgRating))} />
              <span className="text-lg font-bold text-gray-800">{avgRating}</span>
            </div>
          )}
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mb-6">
            No reviews yet. Be the first to review this book!
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map(r => (
              <div key={r.vleresim_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {(r.klient_emri || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{r.klient_emri || 'Anonymous'}</div>
                      <div className="text-xs text-gray-400">{r.data ? new Date(r.data).toLocaleDateString('en-GB') : ''}</div>
                    </div>
                  </div>
                  <Stars nota={Number(r.nota)} />
                </div>
                {r.komenti && <p className="text-sm text-gray-600 leading-relaxed mt-2 ml-12">{r.komenti}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Write a review */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>

          {!user ? (
            <p className="text-gray-500 text-sm">
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link> to leave a review.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Your Rating *</label>
                <Stars nota={reviewNota} interactive onSelect={setReviewNota} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Your Review (optional)</label>
                <textarea
                  rows={3}
                  value={reviewKoment}
                  onChange={e => setReviewKoment(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {reviewSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2"><CheckCircle size={14} />{reviewSuccess}</div>
              )}
              {reviewError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"><AlertTriangle size={14} />{reviewError}</div>
              )}

              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors">
                {submitting ? 'Sending...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Related books */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(b => <BookCard key={b.liber_id} book={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
