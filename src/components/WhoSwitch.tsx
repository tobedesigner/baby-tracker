import type { Baby, View } from "../types";

interface Props {
  babies: Baby[];
  view: View;
  onChange: (view: View) => void;
}

/** 全部／予安／予樂 切換 */
export function WhoSwitch({ babies, view, onChange }: Props) {
  const options: { key: View; label: string; color?: string }[] = [
    { key: "all", label: "全部" },
    ...babies.map((b) => ({ key: b.id, label: b.name, color: b.accent })),
  ];

  return (
    <div className="who-switch">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={view === o.key}
          onClick={() => {
            if (view !== o.key) onChange(o.key);
          }}
        >
          {o.color && <i style={{ background: o.color }} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
