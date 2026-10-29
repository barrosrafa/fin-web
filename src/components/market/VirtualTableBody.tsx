"use client";
import { cloneElement, useEffect, useRef, useState, type ReactElement, type Ref } from "react";
import { defaultRangeExtractor, useWindowVirtualizer } from "@tanstack/react-virtual";

export function VirtualTableBody<T>({ items, getKey, renderRow, columns, full = false }: {
  items: T[]; getKey: (item: T) => string; columns: number; full?: boolean;
  renderRow: (item: T) => ReactElement<{ ref?: Ref<HTMLTableRowElement>; "data-index"?: number; onFocusCapture?: () => void; onBlurCapture?: () => void }>;
}) {
  const root = useRef<HTMLTableSectionElement>(null);
  const [margin, setMargin] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setMargin(el.getBoundingClientRect().top + window.scrollY);
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    measure();
    return () => resize.disconnect();
  }, []);
  const virtualizer = useWindowVirtualizer({ count: items.length, estimateSize: () => 48, overscan: 12, scrollMargin: margin,
    getItemKey: index => getKey(items[index]),
    rangeExtractor: range => [...new Set([...defaultRangeExtractor(range), ...(focused == null || focused >= items.length ? [] : [focused])])].sort((a, b) => a - b),
  });
  const visible = virtualizer.getVirtualItems();
  // Insert individual gaps so a retained focused row cannot collapse the other offsets.
  const body = visible.map((item, index) => {
    const gap = Math.max(0, item.start - (visible[index - 1]?.end ?? margin));
    return <FragmentRow key={item.key} gap={gap} columns={columns} row={cloneElement(renderRow(items[item.index]), {
      ref: virtualizer.measureElement, "data-index": item.index,
      onFocusCapture: () => setFocused(item.index), onBlurCapture: () => setFocused(null),
    })} />;
  });
  return <tbody ref={root} className="divide-y divide-white/5 mono-nums">
    {full ? items.map(renderRow) : body}
    <tr aria-hidden="true"><td colSpan={columns} style={{ height: full ? 0 : Math.max(0, virtualizer.getTotalSize() - ((visible.at(-1)?.end ?? margin) - margin)), padding: 0 }} /></tr>
  </tbody>;
}
function FragmentRow({ gap, columns, row }: { gap: number; columns: number; row: ReactElement }) {
  return <>{gap > 0 && <tr aria-hidden="true"><td colSpan={columns} style={{ height: gap, padding: 0 }} /></tr>}{row}</>;
}
