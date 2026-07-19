import { RatingItem } from "@/lib/questions";

export interface CheckboxPair {
  a: boolean;
  b: boolean;
}

export default function CheckboxTable({
  items,
  values,
  onChange,
  labelA,
  labelB,
  ltr = false,
}: {
  items: RatingItem[];
  values: Record<string, CheckboxPair | undefined>;
  onChange: (itemId: string, key: "a" | "b", checked: boolean) => void;
  labelA: string;
  labelB: string;
  ltr?: boolean;
}) {
  const labelAlign = ltr ? "text-left" : "text-right";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className={`${labelAlign} p-2 border-b border-gray-200`}></th>
            <th className="p-2 border-b border-gray-200 font-normal text-xs text-gray-600 text-center min-w-[100px]">{labelA}</th>
            <th className="p-2 border-b border-gray-200 font-normal text-xs text-gray-600 text-center min-w-[100px]">{labelB}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const pair = values[item.id] ?? { a: false, b: false };
            return (
              <tr key={item.id} className="border-b border-gray-100">
                <td className={`p-2 ${labelAlign}`}>{item.label}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={pair.a}
                    onChange={(e) => onChange(item.id, "a", e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-brand-primary"
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={pair.b}
                    onChange={(e) => onChange(item.id, "b", e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-brand-primary"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
