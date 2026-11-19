# RISICCO V8 — Cinematic Interactive Universe

Website multipágina de fotografia, vídeo e som, construído sobre o código PHP/MySQL da RISICCO V7. Esta versão não substitui as páginas, o backend ou a introdução cinematográfica; acrescenta uma camada visual V8 por *progressive enhancement*.

## Ver a experiência agora

**Sem instalar nada:** extrai `RISICCO_V8_PREVIEW_OFFLINE.zip` inteiro, entra na pasta `RISICCO_V8_PREVIEW` e abre `index.html`. As 23 páginas públicas, imagens, CSS e JavaScript estão incluídas. O fundo GPU requer um navegador com WebGL; se não estiver disponível, mantém-se um fundo editorial estático. O modo de movimento reduzido também remove os movimentos decorativos.

**Website PHP real:** usa PHP 8.1+ (recomendado PHP 8.2 a 8.4) e executa a partir da pasta `RISICCO_SITE_V8`:

```bash
php -S localhost:8000 -t public public/router.php
```

Abre `http://localhost:8000/`. As páginas públicas funcionam sem MySQL. Para registo, autenticação, gestão e dashboard, instala MySQL 8+, importa `sql/schema.mysql.sql` e configura `.env` a partir de `.env.example` (nunca publiques as credenciais). Para utilização pública é necessário um servidor configurado para HTTPS e as práticas de segurança descritas no README histórico.

## Principais novidades V8

- **Cosmic Wave:** gerador original `cosmicSheet` retirado das especificações fornecidas, com seed `1690455487`, estrutura determinística, *normalization* e partículas ambientais; o desenho e a animação usam um novo renderer WebGL leve, offline e sem dependências externas. O preset **ULTRA** usa 250 000 partículas de estrutura + 2 600 pontos ambientais.
- **Swirl Cursor:** 40 amostras e splines quadráticas num canvas overlay `pointer-events:none`, com cursor nativo sempre presente e desativação para rato não preciso, toque e preferência de movimento reduzido.
- **Galeria 3D:** navegação por setas, teclado e arrastamento em cartões fotográficos com perspetiva CSS 3D e fallback acessível em grelha.
- **Editorial VISUAL JOURNAL:** fotografias fornecidas, convertidas para WebP; composição em planos profundos sem atribuir trabalhos a clientes inexistentes.
- **Entrada da RISICCO preservada:** bobina + auscultadores, movimento da direita para esquerda, letras por ordem, portal, saltar/rever e preferência de movimento reduzido.
- **Estilo Liquid Metal:** CTA tridimensional com acabamento cromado que abre a galeria 3D, sem simular a existência de um vídeo institucional.
- **Personalização:** novo seletor de qualidade GPU (Auto, Ultra, Alta, Equilibrada, Baixa, Estático) na página de personalização. As preferências continuam persistentes e, quando aplicável, sincronizadas com MySQL.

## Ficheiros novos relevantes

```text
public/assets/js/cosmic-generator-reference.js     algoritmo de geração de referência
public/assets/js/cosmic-wave-v8.js               renderer WebGL adaptado
public/assets/js/swirl-cursor-v8.js              rasto de cursor acessível
public/assets/js/helix-gallery-v8.js             galeria CSS 3D
public/assets/js/cinematic-interactions-v8.js    profundidade e entrada de secções
public/assets/css/cinematic-v8.css               sistema visual complementar
public/assets/img/editorial/                     7 fotografias e 7 thumbnails WebP
```

## Desempenho

O perfil automático escolhe **LOW** em ecrãs estreitos ou máquinas com quatro ou menos núcleos lógicos e **BALANCED** nos restantes. Os níveis HIGH e ULTRA são selecionáveis manualmente. A cena pára quando está fora do ecrã ou o separador não está visível, e o renderer limpa os recursos ao sair. O WebGL não é um requisito para ler o site. A performance final depende da GPU, do navegador e do equipamento.

## Limitações e próximos passos

Os geradores e valores iniciais provêm do ficheiro técnico, **mas não foi portado integralmente o motor Three.js r158 com `EffectComposer`, `UnrealBloomPass` e Worker**. O renderer WebGL1 V8 é uma adaptação progressiva; o acabamento cromado usa CSS 3D e a galeria utiliza CSS 3D em vez do motor Helix por canvas da referência. Assim, não se deve anunciar equivalência visual 1:1 com as pré-visualizações de terceiros. A documentação em `docs/ANALISE_V8.md` especifica a diferença.

Os perfis da equipa e os projetos conceptuais originais continuam identificados como provisórios ou de demonstração. As imagens adicionais foram disponibilizadas para a edição do projeto e usadas apenas como estudos visuais, não como atribuição de autoria ou clientes comerciais.

O teste funcional das páginas públicas e dos recursos foi feito com PHP e verificadores estáticos. O ambiente de navegador automatizado bloqueou a navegação direta por URL (erro `ERR_BLOCKED_BY_ADMINISTRATOR`). Foi possível criar **capturas de renderização real no Chromium em isolamento**, incorporando os HTML, CSS, JavaScript e imagens locais na página; este método não testa rotas ou carregamentos HTTP no próprio navegador, e o WebGL não está disponível nesse ambiente. As capturas estão em `docs/screenshots_v8/`. Antes de produção, abrir em Chrome/Firefox/Safari para testes de layout, WebGL, mobile e acessibilidade; configurar a base de dados de teste para verificar login e dashboard. Ver `docs/QA_V8.md`.
