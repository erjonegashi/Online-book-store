import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BACKEND = 'http://localhost:5000';
const imgSrc = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

export default function BookCard({ book }) {
  const { addToCart, items } = useCart();
  const inCart = items.some(i => i.liber_id === book.liber_id);
  const outOfStock = Number(book.sasia_stok) === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      <Link to={`/book/${book.liber_id}`} className="block">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
          {imgSrc(book.foto_url)
            ? <img src={imgSrc(book.foto_url)} alt={book.titulli}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { e.target.style.display = 'none'; }} />
            : <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
          }
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {!outOfStock && inCart && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              In Cart
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {book.kategoria_emri && (
          <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">{book.kategoria_emri}</span>
        )}
        <Link to={`/book/${book.liber_id}`}>
          <h3 className="font-semibold text-gray-900 text-sm mt-0.5 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
            {book.titulli}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{book.autori_emri || '—'}</p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-bold text-blue-700 text-sm">{Number(book.cmimi).toFixed(2)} €</span>
          {!outOfStock && (
            <button
              onClick={() => addToCart(book, 1)}
              className="text-[11px] px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shrink-0">
              {inCart ? '+ More' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
