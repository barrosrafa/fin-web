# Conteúdo e controles da interface

No Directus, use **ui_texts** para editar textos e **feature_flags** para ligar ou desligar elementos. Publique o registro, com locale `pt-BR`, e selecione o ambiente correto nas flags. Mudanças aparecem após a atualização dos caches (normalmente até dois minutos; uma aba já aberta precisa ser recarregada).

- `text_key` é a chave estável do texto original; edite apenas `value`. Textos iguais compartilham uma tradução. `source` indica uma tela/componente em que o texto aparece.
- `route./acoes`, por exemplo, oculta os links correspondentes e apresenta uma mensagem de indisponibilidade na rota e nas subrotas.
- `ui.*` identifica o componente e sua origem: menus, botões, cards, seções, formulários, inputs, tabelas e gráficos. Há controles globais nos componentes compartilhados e controles específicos nas telas. Um controle pai desligado oculta os filhos.
- `enabled: false` desliga; flags ausentes mantêm o comportamento atual. Textos ausentes preservam o texto original. Um valor de texto vazio é respeitado.
- São controles de interface: autenticação, autorização, assinaturas e operações financeiras continuam sendo verificadas pela API.

## Manutenção

`node scripts/catalog-cms.mjs` atualiza o catálogo de textos sem modificar as telas. Ao criar uma nova funcionalidade, envolva o elemento em `CmsElement feature="ui.chave-estavel"` e cadastre a mesma chave em `feature-flags.json`. Use `CmsText` nos textos e `useCmsText` em mensagens imperativas. Não altere chaves existentes durante refatorações.

O CMS requer a migração `20261031B-interface-controls` de `fin-cms`. A importação inicial em lote usa `fin-cms/scripts/import-interface.mjs --secrets <arquivo privado> --catalog <fin-web/cms>` com o papel de migração. É aditiva e preserva textos e estados já editados; o papel de execução do CMS não ganha permissão de DDL. Há também `scripts/import-cms.py` para importações HTTP autenticadas em menor volume.

Os arquivos JSON contêm apenas textos e os padrões de exibição. Não incluem credenciais, dados financeiros ou dados pessoais.
