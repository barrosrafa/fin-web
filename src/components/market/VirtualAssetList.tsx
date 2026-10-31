"use client";

import { CmsText, CmsElement } from "@/components/content/Cms";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { defaultRangeExtractor, useWindowVirtualizer } from "@tanstack/react-virtual";

// Variable-height rows, measured at the owning row. Focused rows stay mounted.
export function VirtualAssetList<T>({ items, getKey, renderItem }: {
  items: T[]; getKey: (item: T) => string; renderItem: (item: T) => ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [margin, setMargin] = useState(0);
  const [full, setFull] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const resize = new ResizeObserver(() => {
      setColumns(el.clientWidth >= 1000 ? 3 : el.clientWidth >= 650 ? 2 : 1);
      setMargin(el.getBoundingClientRect().top + window.scrollY);
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);
  const rows = Math.ceil(items.length / columns);
  const virtualizer = useWindowVirtualizer({
    count: rows, estimateSize: () => 390, overscan: 2, scrollMargin: margin,
    getItemKey: index => getKey(items[index * columns]),
    rangeExtractor: range => [...new Set([...defaultRangeExtractor(range), ...(focused == null || focused >= rows ? [] : [focused])])].sort((a, b) => a - b),
  });
  const row = (index: number) => <div className="grid gap-6 pb-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
    <CmsText>{items.slice(index * columns, (index + 1) * columns).map(item => <div key={getKey(item)}><CmsText>{renderItem(item)}</CmsText></div>)}</CmsText>
  </div>;
  return <div ref={root} className="asset-list">
    <CmsElement feature="ui.components/market/VirtualAssetList.button.1"><button type="button" aria-pressed={full} onClick={() => setFull(value => !value)} className="text-xs underline mb-4">
      <CmsText>{full ? "Usar janela de rolagem" : "Exibir todo este bloco (acesso por teclado)"}</CmsText>
    </button></CmsElement>
    <CmsText>{full ? Array.from({ length: rows }, (_, index) => <div key={index}><CmsText>{row(index)}</CmsText></div>) :
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        <CmsText>{virtualizer.getVirtualItems().map(item => <div key={item.key} data-index={item.index} ref={virtualizer.measureElement}
          onFocusCapture={() => setFocused(item.index)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null); }}
          style={{ position: "absolute", width: "100%", top: 0, transform: `translateY(${item.start - margin}px)` }}>
          <CmsText>{row(item.index)}</CmsText>
        </div>)}</CmsText>
      </div>}</CmsText>
  </div>;
}
