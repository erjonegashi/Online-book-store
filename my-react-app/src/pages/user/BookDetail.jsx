import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userAxios';
import { useCart } from '../../context/CartContext';
import BookCard from '../../components/BookCard';

const BACKEND = 'http://localhost:5000';
const imgSrc  = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();

  const [book,    setBook]    = useState(null);
  const [related, setRelated] = useState([]);
  const [author,  setAuthor]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty,     setQty]     = useState(1);
  const [added,   setAdded]   = useState(false);

  useEffect(() => {
    setLoading(true); setBook(null); setAdded(false); setQty(1);
    userApi.get(`/librat/${id}`)
      .then(({ data }) => {
        setBook(data);
        const promises = [];
        if (data.autori_id) promises.push(userApi.get(`/autoret/${data.autori_id}`).then(r => setAuthor(r.data)).catch(() => {}));
        if (data.kategoria_id) {
          promises.push(
            userApi.get('/librat').then(r => {
              setRelated(r.data.filter(b => b.kategoria_id === data.kategoria_id && b.liber_id !== data.liber_id).slice(0, 4));
            }).catch(() => {})
          );
        }
        return Promise.all(promises);
      })
      .catch(() => navigate('/books'))
      .finally(() => setLoading(false));
  }, [id]);

  const inCart = items.some(i => i.liber_id === book?.liber_id);
  const outOfStock = Number(book?.sasia_stok) === 0;

  const handleAddToCart = () => {
    if (!book || outOfStock) return;
    addToCart(book, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

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
          <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {imgSrc(book.foto_url)
              ? <img src={imgSrc(book.foto_url)} alt={book.titulli} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-7xl">📖</div>}
          </div>

          {/* Stock badge */}
          <div className={`mt-4 text-center py-2 rounded-xl text-sm font-semibold ${
            outOfStock ? 'bg-red-50 text-red-600' :
            book.sasia_stok <= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
            {outOfStock ? '⚠ Out of Stock' : book.sasia_stok <= 5 ? `⚡ Only ${book.sasia_stok} left!` : `✓ In Stock (${book.sasia_stok})`}
          </div>
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

          {/* Qty + Add to cart */}
          {!outOfStock && (
            <div className="flex items-center gap-3 mb-6">
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
                {added ? '✓ Added to Cart!' : inCart ? 'Add More to Cart' : 'Add to Cart'}
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
