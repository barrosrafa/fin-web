"use client";
import { useEffect, useSyncExternalStore } from "react";
const eventName = "fin-display-preference";
function snapshot() {
  try { return `${localStorage.getItem("fin-density") || "detailed"}|${localStorage.getItem("fin-palette") || "default"}`; }
  catch { return "detailed|default"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(eventName, callback); };
}
export function DisplayPreferences() {
  const preference = useSyncExternalStore(subscribe, snapshot, () => "detailed|default");
  const [density, palette] = preference.split("|");
  const compact = density === "compact";
  const accessible = palette === "accessible";
  useEffect(() => {
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.palette = palette;
  }, [density, palette]);
  const persist = (key: string, value: string) => {
    try { localStorage.setItem(key, value); window.dispatchEvent(new Event(eventName)); }
    catch { /* Storage is optional: apply the choice for the current document. */
      document.documentElement.dataset[key === "fin-density" ? "density" : "palette"] = value;
    }
  };
  return <div className="flex flex-wrap gap-3 text-xs text-[#94a3b8] mb-4" aria-label="Preferências de exibição">
    <button type="button" aria-pressed={compact} onClick={() => persist("fin-density", compact ? "detailed" : "compact")} className="underline">Densidade: {compact ? "compacta" : "detalhada"}</button>
    <button type="button" aria-pressed={accessible} onClick={() => persist("fin-palette", accessible ? "default" : "accessible")} className="underline">Cores: {accessible ? "azul e laranja" : "padrão"}</button>
  </div>;
}
