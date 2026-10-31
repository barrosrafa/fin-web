import Link from 'next/link';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CmsElement, CmsProvider, CmsRoute, CmsText, textKey } from './Cms';
vi.mock('next/navigation', () => ({ usePathname: () => '/acoes/PETR4' }));
describe('editorial controls', () => {
  it('translates literal and data-driven text and preserves unknown financial values', () => {
    render(<CmsProvider snapshot={{texts: {[textKey('Ações')]: 'Mercado brasileiro'}, flags: {}}}><span><CmsText>Ações</CmsText></span><span><CmsText>123,45</CmsText></span></CmsProvider>);
    expect(screen.getByText('Mercado brasileiro')).toBeTruthy();
    expect(screen.getByText('123,45')).toBeTruthy();
  });
  it('preserves spaces around translated fragments and allows empty text', () => {
    const { container } = render(<CmsProvider snapshot={{texts: {[textKey('de')]: 'from', [textKey('remover')]: ''}, flags: {}}}><CmsText>{' de '}</CmsText><CmsText>remover</CmsText></CmsProvider>);
    expect(container.textContent).toBe(' from ');
  });
  it('honors explicit false while keeping absent flags enabled', () => {
    render(<CmsProvider snapshot={{texts: {}, flags: {hidden: false}}}><CmsElement feature="hidden"><button>Oculto</button></CmsElement><CmsElement feature="default"><button>Visível</button></CmsElement></CmsProvider>);
    expect(screen.queryByText('Oculto')).toBeNull();
    expect(screen.getByText('Visível')).toBeTruthy();
  });
  it('translates attributes without adding DOM wrappers', () => {
    const { container } = render(<CmsProvider snapshot={{texts: {[textKey('Buscar')]: 'Pesquisar'}, flags: {}}}><CmsElement><input placeholder="Buscar" /></CmsElement></CmsProvider>);
    expect(screen.getByPlaceholderText('Pesquisar')).toBeTruthy();
    expect(container.firstElementChild?.tagName).toBe('INPUT');
  });
  it('hides route links and blocks direct access to descendants', () => {
    render(<CmsProvider snapshot={{texts: {}, flags: {'route./acoes': false}}}><CmsElement><Link href="/acoes">Menu</Link></CmsElement><CmsRoute><p>Detalhes</p></CmsRoute></CmsProvider>);
    expect(screen.queryByText('Menu')).toBeNull();
    expect(screen.queryByText('Detalhes')).toBeNull();
    expect(screen.getByRole('status')).toBeTruthy();
  });
});
