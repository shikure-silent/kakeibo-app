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
};

export function EditableListSection({
  title,
  description,
  items,
  onEdit,
  onAdd,
  onRemove,
  onReorder,
}: EditableListSectionProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(items.length);

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
    // 追加されたときだけ、末尾の入力までスクロール＆フォーカス
    if (items.length > prevLengthRef.current) {
      const inputs = listRef.current?.querySelectorAll("input");
      const lastInput =
        inputs && inputs.length > 0 ? inputs[inputs.length - 1] : null;
      if (lastInput) {
        lastInput.scrollIntoView({ behavior: "smooth", block: "center" });
        lastInput.focus();
      }
    }
    prevLengthRef.current = items.length;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-slate-700">{title}</p>
          <p className="text-[10px] text-slate-400 leading-snug">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="text-[11px] rounded-full border border-emerald-400 px-3 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 w-full sm:w-auto text-center"
        >
          ＋ 追加
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-auto pr-1" ref={listRef}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex flex-row items-stretch gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 ${
              draggingIndex === index ? "border-emerald-300 bg-emerald-50" : ""
            }`}
            draggable
            onDragStart={(e) => handleDragStart(index, e)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(index, e)}
            onPointerDown={() => handlePointerDown(index)}
            onPointerEnter={() => handlePointerEnter(index)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <span className="text-[14px] text-slate-400 select-none cursor-grab">
                ≡
              </span>
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => onEdit(index, e.target.value)}
                  className="w-full bg-white rounded-lg border border-slate-300 px-2 py-1 text-[12px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="名前を入力"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="ml-auto self-end rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
            >
              削除
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[11px] text-slate-400">
            まだ項目がありません。「＋ 追加」から登録できます。
          </p>
        )}
      </div>
    </div>
  );
}
