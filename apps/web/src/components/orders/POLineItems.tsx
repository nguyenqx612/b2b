import type { POItem } from '@b2b/shared';

export function POLineItems({ items }: { items: POItem[] }) {
  const totalCBM = items.reduce((s, i) => s + i.cbmSubtotal, 0);

  return (
    <div>
      <h3 className="font-medium text-sm mb-3">Line Items</h3>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500 text-xs">
            <th className="pb-2">Product</th>
            <th className="pb-2 text-right">Qty</th>
            <th className="pb-2 text-right">CBM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="py-2">
                <div className="font-medium">{item.product.name}</div>
                <div className="text-xs text-gray-500">{item.product.sku}</div>
              </td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right text-gray-600">{item.cbmSubtotal.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <td className="pt-2">Total</td>
            <td></td>
            <td className="pt-2 text-right">{totalCBM.toFixed(3)} CBM</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
