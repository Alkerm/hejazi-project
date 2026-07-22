'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Wishlist } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/product-card';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await api.wishlist();
      setWishlist(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load wishlist. Please log in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await api.addCartItem({ productId, quantity: 1 });
      toast.success(`Added "${productName}" to your cart!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-rose-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading Wishlist...</p>
      </div>
    );
  }

  const items = wishlist?.items || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <h1 className="serif-font text-3xl md:text-4xl font-bold text-slate-800">My Saved Wishlist</h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Your bookmarked cosmetic products and favorites
          </p>
        </div>
        <Link href="/products" className="inline-block">
          <Button type="button" variant="secondary" className="border-slate-200 hover:border-slate-300">
            Explore More Products
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-sm">Your wishlist is currently empty.</p>
          <p className="text-xs text-slate-400">Click the heart icon on any product to save it here for later.</p>
          <Link href="/products" className="inline-block pt-2">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">Browse Cosmetics Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Showing {items.length} saved item{items.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div key={item.id} layout className="flex flex-col justify-between h-full">
                <ProductCard product={item.product} initialWishlisted={true} />
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product.id, item.product.name)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
