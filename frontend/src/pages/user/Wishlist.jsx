import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../context/CartContext';
import userAxios from '../../api/userAxios';
import { Heart, HeartOff, BookOpen, ShoppingCart, Trash2, Loader2 } from 'lucide-react';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgSrc = url => !url ? null : url.startsWith('http') ? url : BACKEND + url;

export default function Wishlist() {
  const { user }       = useUserAuth();
  const { addToCart }  = useCart();
  const navigate       = useNavigate();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState(null);
  const [toast,    setToast]    = useState('');

  useEffect(() => { if (user) fetchWishlist(); }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await userAxios.get('/lista-deshirave');
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (deshire_id) => {
    setRemoving(deshire_id);
    try {
      await userAxios.delete(`/lista-deshirave/${deshire_id}`);
      setItems(prev => prev.filter(i => i.deshire_id !== deshire_id));
      showToast('U hoq nga lista e dëshirave');
    } catch {
      showToast('Gabim gjatë heqjes');
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      liber_id:  item.liber_id,
      titulli:   item.titulli,
      cmimi:     item.cmimi,
      foto_url:  item.foto_url,
      sasia_stok: item.sasia_stok ?? 99,
    });
    showToast(`"${item.titulli}" u shtua në shportë`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Heart size={28} className="text-red-400 fill-red-200" strokeWidth={1.5} /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lista e Dëshirave</h2>
        <p className="text-gray-500 mb-6">Hyrni për të parë listën tuaj të dëshirave.</p>
        <Link to="/login" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Hyrni</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista e Dëshirave</h1>
          <p className="text-gray-500 mt-1">{items.length} {items.length === 1 ? 'libër' : 'libra'} të ruajtur</p>
        </div>
        <Link to="/books" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          ← Shfleto Librat
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"><HeartOff size={32} className="text-gray-300" strokeWidth={1.25} /></div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Lista juaj e dëshirave është bosh</h3>
          <p className="text-gray-400 mb-8 max-w-sm">Klikoni ikonën e zemrës në çdo libër për ta shtuar në listën e dëshirave.</p>
          <Link to="/books"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
            Shfleto Librat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.deshire_id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              {/* Cover */}
              <Link to={`/book/${item.liber_id}`} className="block relative">
                <div className="h-52 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                  {imgSrc(item.foto_url) ? (
                    <>
                      <img src={imgSrc(item.foto_url)} alt={item.titulli}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      <div className="w-full h-full items-center justify-center" style={{ display: 'none' }}>
                        <BookOpen size={32} className="text-blue-200" strokeWidth={1.25} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><BookOpen size={32} className="text-blue-200" strokeWidth={1.25} /></div>
                  )}
                </div>
                {/* Remove heart button */}
                <button
                  onClick={e => { e.preventDefault(); removeFromWishlist(item.deshire_id); }}
                  disabled={removing === item.deshire_id}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                  title="Hiq nga lista"
                >
                  {removing === item.deshire_id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Heart size={14} className="fill-red-500 text-red-500" strokeWidth={1.75} />
                  }
                </button>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/book/${item.liber_id}`}>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                    {item.titulli}
                  </h3>
                </Link>
                {item.cmimi && (
                  <p className="text-blue-600 font-bold text-base mb-3">€{Number(item.cmimi).toFixed(2)}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <ShoppingCart size={13} className="inline-block mr-1 -mt-px" />Shto
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.deshire_id)}
                    disabled={removing === item.deshire_id}
                    className="px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                    title="Hiq nga lista"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary bar if items exist */}
      {items.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
          <p className="text-sm text-blue-700 font-medium">
            {items.length} libra në listën e dëshirave
          </p>
          <button
            onClick={() => items.forEach(i => handleAddToCart(i))}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <ShoppingCart size={15} className="inline-block mr-1.5 -mt-px" />Shto të Gjitha në Shportë
          </button>
        </div>
      )}
    </div>
  );
}
