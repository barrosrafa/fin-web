"use client";

import { cloneElement, createContext, isValidElement, useContext, type ReactNode } from "react";
import { textKey } from "@/lib/content/keys";
import { usePathname } from "next/navigation";

export type CmsSnapshot = { texts: Record<string, string>; flags: Record<string, boolean> };
const Context = createContext<CmsSnapshot>({ texts: {}, flags: {} });
export { textKey } from "@/lib/content/keys";
function translate(value: unknown, texts: Record<string, string>) {
  if (typeof value !== "string") return value;
  const replacement = texts[textKey(value.trim())];
  if (replacement === undefined) return value;
  if (replacement === "") return "";
  return `${value.match(/^\s*/)?.[0] ?? ""}${replacement}${value.match(/\s*$/)?.[0] ?? ""}`;
}
export function CmsProvider({ snapshot, children }: { snapshot: CmsSnapshot; children: ReactNode }) {
  return <Context.Provider value={snapshot}>{children}</Context.Provider>;
}
export function useCmsText() {
  const { texts } = useContext(Context);
  return (value: string): string => translate(value, texts) as string;
}
export function CmsText({ children }: { children: ReactNode }) {
  const { texts } = useContext(Context);
  return <>{translate(children, texts) as ReactNode}</>;
}
/** A fragment gate preserves tables, flex/grid layout, and HTML semantics. */
export function CmsElement({ feature, children }: { feature?: string; children: ReactNode }) {
  const { texts, flags } = useContext(Context);
  if (feature && flags[feature] === false) return null;
  if (!isValidElement<Record<string, unknown>>(children)) return <>{children}</>;
  const props: Record<string, unknown> = {};
  for (const key of ["title", "subtitle", "label", "placeholder", "aria-label", "alt", "badgeText"]) {
    if (typeof children.props[key] === "string") props[key] = translate(children.props[key], texts);
  }
  if (typeof children.props.children === "string") props.children = translate(children.props.children, texts);
  // Links generated from data also respect route switches, including navigation menus.
  const href = children.props.href;
  if (typeof href === "string" && href.startsWith("/") && flags[`route.${href.split("?")[0]}`] === false) return null;
  return cloneElement(children, props);
}
export function CmsRoute({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { flags, texts } = useContext(Context);
  const disabled = Object.entries(flags).some(([key, enabled]) => key.startsWith("route.") && enabled === false &&
    (path === key.slice(6) || (key !== "route./" && path.startsWith(`${key.slice(6)}/`))));
  return disabled ? <p role="status">{texts["system.feature-unavailable"] ?? "Esta funcionalidade está temporariamente indisponível."}</p> : <>{children}</>;
}
