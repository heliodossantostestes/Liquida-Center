
import React from 'react';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-brand-purple/40 transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
        {product.promotion && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse-fast">
                {product.promotion}
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md font-bold text-white truncate">{product.name}</h3>
        <p className="text-sm text-gray-400 mb-2 truncate">{product.seller}</p>
        <div className="mt-auto flex justify-between items-center">
          <p className="text-lg font-black text-brand-purple-light">{product.price}</p>
          <button className="bg-brand-purple p-2 rounded-full text-white hover:bg-brand-purple-dark transition-colors">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
