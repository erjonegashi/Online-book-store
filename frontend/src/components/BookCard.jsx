import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { BookOpen } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

export default function BookCard({ book }) {
  const { addToCart, items } = useCart();
  const inCart = items.some(i => i.liber_id === book.liber_id);
  const outOfStock = Number(book.sasia_stok) === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col group">
      <Link to={`/book/${book.liber_id}`} className="block">
        <div className="aspect-[3/4] img-skeleton overflow-hidden relative bg-gray-100">
          {imgSrc(book.foto_url) && (
            <img src={imgSrc(book.foto_url)} alt={book.titulli}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onLoad={e => {
                if (e.target.naturalWidth <= 1 || e.target.naturalHeight <= 1) {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          )}
          <div className={`w-full h-full items-center justify-center bg-gray-100 ${imgSrc(book.foto_url) ? 'hidden' : 'flex'}`}>
            {book.titulli?.[0]
              ? <span className="text-3xl font-bold text-gray-300 select-none">{book.titulli[0].toUpperCase()}</span>
              : <BookOpen size={32} className="text-gray-300" strokeWidth={1.25} />
            }
          </div>
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-white text-gray-600 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">Out of Stock</span>
            </div>
          )}
          {!outOfStock && inCart && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
              In Cart
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        {book.kategoria_emri && (
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{book.kategoria_emri}</span>
        )}
        <Link to={`/book/${book.liber_id}`}>
          <h3 className="font-medium text-gray-900 text-sm mt-0.5 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
            {book.titulli}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{book.autori_emri || '—'}</p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900 text-sm">{Number(book.cmimi).toFixed(2)} €</span>
          {!outOfStock && (
            <button
              onClick={() => addToCart(book, 1)}
              className="text-[11px] px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors shrink-0">
              {inCart ? '+ More' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
