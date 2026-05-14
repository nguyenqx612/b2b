import Link from 'next/link';
import type { ProductBuyerView } from '@b2b/shared';
import { formatCentsRange } from '@/lib/utils';

interface Props {
  product: ProductBuyerView;
  onAddToOrder?: (product: ProductBuyerView) => void;
}

export function ProductCard({ product, onAddToOrder }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.images[0] ? (
          <img
            src={`/api/image-proxy?key=${encodeURIComponent(product.images[0])}`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category badge */}
        <span className="inline-block mb-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {product.category}
        </span>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>

        <div className="mt-auto space-y-2">
          {/* Seller */}
          <p className="text-xs text-gray-500">
            By <span className="font-medium">{product.sellerCompany}</span>
          </p>

          {/* Price range — never shows exact price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Indicative price</div>
              <div className="font-semibold text-blue-700">
                {formatCentsRange(product.priceRangeMin, product.priceRangeMax)} / {product.unit}
              </div>
            </div>
            <div className="text-xs text-gray-400 text-right">
              {product.cbmPerUnit} CBM/{product.unit}
            </div>
          </div>

          {onAddToOrder ? (
            <button
              onClick={() => onAddToOrder(product)}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Add to Order
            </button>
          ) : (
            <Link
              href={`/buyer/orders/new?productId=${product.id}&sellerId=${product.sellerId}`}
              className="block w-full text-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Add to Order
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
