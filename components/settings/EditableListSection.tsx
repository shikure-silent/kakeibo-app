"use client";

import { useEffect, useRef, useState } from "react";

type EditableListSectionProps = {
  title: string;
  description: string;
  items: string[];
  onEdit: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  showReorderButtons?: boolean;
  isDark?: boolean;
};

export function EditableListSection({
  title,
  description,
  items,
  onEdit,
  onAdd,
  onRemove,
  onReorder,
  showReorderButtons = false,
  isDark = false,
}: EditableListSectionProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(items.length);
  const initializedRef = useRef(false);

  const handleDragStart = (index: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (toIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData("text/plain");
    const fromIndex = Number(fromIndexStr);
    if (Number.isNaN(fromIndex)) return;
    onReorder(fromIndex, toIndex);
    setDraggingIndex(null);
  };

  useEffect(() => {
    const prev = prevLengthRef.current;
    const current = items.length;

    // 初回レンダーは何もしない
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevLengthRef.current = current;
      return;
    }

    // 初期ロードでの増加（prev=0→current>0）はスキップ
    if (current > prev && prev === 0) {
      prevLengthRef.current = current;
      return;
    }

    // 追加されたときだけ、末尾の入力までスクロール＆フォーカス
    if (current > prev) {
      const listEl = listRef.current;
      const inputs = listEl?.querySelectorAll("input");
      const lastInput =
        inputs && inputs.length > 0 ? inputs[inputs.length - 1] : null;
      if (listEl && lastInput) {
        const listRect = listEl.getBoundingClientRect();
        const inputRect = lastInput.getBoundingClientRect();
        const currentTop = listEl.scrollTop;
        const offsetTop =
          inputRect.top -
          listRect.top +
          currentTop -
          Math.max(12, listRect.height * 0.25);
        listEl.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
        lastInput.focus({ preventScroll: true });
      }
    }
    prevLengthRef.current = current;
  }, [items]);

  const handlePointerDown = (index: number) => {
    setDraggingIndex(index);
  };

  const handlePointerEnter = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    onReorder(draggingIndex, index);
    setDraggingIndex(index);
  };

  const handlePointerUp = () => {
    setDraggingIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pr-6">
        <div>
          <p
            className={`text-[11px] font-medium ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-[10px] leading-snug ${
              isDark ? "text-slate-400" : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="text-[11px] rounded-full border px-3 py-1 w-full sm:w-auto text-center whitespace-nowrap flex-shrink-0 min-w-[88px]"
          style={{
            borderColor: isDark ? "#34d399" : "#34d399",
            color: isDark ? "#bbf7d0" : "#047857",
            backgroundColor: isDark ? "rgba(6,95,70,0.25)" : "#ecfdf3",
          }}
        >
          ＋ 追加
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-auto pr-1" ref={listRef}>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border px-3 py-2"
            style={{
              borderColor:
                draggingIndex === index
                  ? "#34d399"
                  : isDark
                  ? "#475569"
                  : "#e2e8f0",
              backgroundColor:
                draggingIndex === index
                  ? isDark
                    ? "rgba(6,95,70,0.25)"
                    : "#ecfdf3"
                  : isDark
                  ? "#0f172a"
                  : "#f8fafc",
            }}
            draggable
            onDragStart={(e) => handleDragStart(index, e)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(index, e)}
            onPointerDown={() => handlePointerDown(index)}
            onPointerEnter={() => handlePointerEnter(index)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className={`text-[14px] select-none cursor-grab ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                ≡
              </span>
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => onEdit(index, e.target.value)}
                  className="w-full rounded-lg border px-2 py-1 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  style={{
                    backgroundColor: isDark ? "#0f172a" : "white",
                    color: isDark ? "#e2e8f0" : "#1f2937",
                    borderColor: isDark ? "#475569" : "#cbd5e1",
                  }}
                  placeholder="名前を入力"
                />
              </div>
            </div>
            {showReorderButtons && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onReorder(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="rounded-full border px-2 py-1 text-[11px]"
                  style={{
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                    backgroundColor: isDark ? "#0f172a" : "white",
                    color: isDark ? "#cbd5f5" : "#475569",
                    opacity: index === 0 ? 0.4 : 1,
                  }}
                  aria-label="上に移動"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onReorder(index, Math.min(items.length - 1, index + 1))
                  }
                  disabled={index === items.length - 1}
                  className="rounded-full border px-2 py-1 text-[11px]"
                  style={{
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                    backgroundColor: isDark ? "#0f172a" : "white",
                    color: isDark ? "#cbd5f5" : "#475569",
                    opacity: index === items.length - 1 ? 0.4 : 1,
                  }}
                  aria-label="下に移動"
                >
                  ↓
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="self-end sm:ml-auto rounded-full border px-3 py-1 text-[11px] font-medium whitespace-nowrap"
              style={{
                borderColor: isDark ? "#7f1d1d" : "#fecdd3",
                backgroundColor: isDark ? "#450a0a" : "white",
                color: isDark ? "#fecdd3" : "#b91c1c",
              }}
            >
              削除
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
            まだ項目がありません。「＋ 追加」から登録できます。
          </p>
        )}
      </div>
    </div>
  );
}
