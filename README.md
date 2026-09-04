# Kriolo Gesso — Website

Site institucional de página única (one-page) para a Kriolo Gesso, empresa de
gesso cartonado sediada em Almada. HTML, CSS e JavaScript puros — sem build,
sem dependências, sem backend.

## Estrutura de pastas

```
kriolo-gesso/
├── index.html              # Página única com todas as secções
├── assets/
│   ├── css/styles.css      # Todo o estilo (tokens de cor, layout, componentes)
│   ├── js/main.js          # Menu, scrollspy, galeria, lightbox, formulário → WhatsApp
│   └── img/
│       ├── src/            # Fotografias originais (não usadas diretamente pelo site)
│       ├── favicon.svg     # Ícone do separador (marca abstrata, fundo branco/traço preto)
│       └── *-<largura>.jpg # Versões otimizadas geradas a partir de src/
├── scripts/
│   └── resize-images.ps1   # Gera as versões otimizadas a partir de assets/img/src/
└── README.md
```

## Como ver o site

Não precisa de instalar nada. Como os browsers bloqueiam alguns pedidos a
partir de ficheiros abertos diretamente (`file://`), sirva a pasta com um
servidor estático simples:

```bash
# Com Python instalado
python -m http.server 8080 --directory kriolo-gesso
```

```powershell
# Alternativa em PowerShell, sem precisar de Python
powershell -ExecutionPolicy Bypass -File kriolo-gesso/scripts/resize-images.ps1  # (só para imagens)
```

Depois abra `http://localhost:8080` no browser.

Para publicar, basta copiar a pasta `kriolo-gesso/` (todo o seu conteúdo) para
qualquer alojamento de ficheiros estáticos (Netlify, Vercel, GitHub Pages, ou
o alojamento atual da empresa via FTP).

## Onde colocar novas fotografias

1. Coloque a foto original (tamanho grande, sem cortes) em `assets/img/src/`,
   por exemplo `assets/img/src/novo-trabalho.jpg`.
2. Abra `scripts/resize-images.ps1` e acrescente uma linha ao dicionário
   `$jobs`, por exemplo:
   ```powershell
   "novo-trabalho" = @(1200, 700)
   ```
3. Execute o script (`powershell -ExecutionPolicy Bypass -File scripts/resize-images.ps1`).
   Isto cria `assets/img/novo-trabalho-1200.jpg` e `assets/img/novo-trabalho-700.jpg`,
   já redimensionados e comprimidos.
4. Adicione um novo bloco `<button class="gallery-item">…</button>` dentro de
   `#gallery` em `index.html`, seguindo o padrão dos existentes (copie um
   bloco, troque o `src`/`srcset`, o `alt` e a legenda em
   `.gallery-item__caption`).

Nunca invente localizações, nomes de clientes ou características técnicas —
escreva apenas o que é visível na fotografia.

## Editar textos, telefone ou redes sociais

Os dados de contacto (WhatsApp e Instagram) aparecem em vários pontos do
`index.html` (cabeçalho, hero, secção de contacto, botão flutuante, rodapé).
O número de telefone está sempre no formato `351936323900` dentro do link
`https://wa.me/351936323900?text=...`. Se o número mudar, substitua-o em
todas as ocorrências (uma pesquisa por `936323900` no ficheiro encontra-as
todas).

## Antes de publicar

- [ ] Atualizar o `<link rel="canonical">` e as tags Open Graph/Twitter em
      `index.html` com o domínio definitivo do site.
- [ ] Confirmar morada/telefone/Instagram no JSON-LD (`LocalBusiness`) no
      `<head>` do `index.html`.
- [ ] Substituir `assets/img/favicon.svg` se quiser um logótipo diferente
      (mantenha fundo claro e traço simples para continuar legível pequeno).

## Notas técnicas

- **Sem framework nem build**: o site é HTML/CSS/JS estático para poder ser
  aberto, editado e publicado por qualquer pessoa sem `npm install`.
- **Imagens**: todas as fotografias usadas são reais, fornecidas pela Kriolo
  Gesso, redimensionadas e comprimidas (JPEG progressivo) em várias larguras
  com `srcset`/`sizes`. A imagem do hero carrega com prioridade alta; as
  restantes usam `loading="lazy"`.
- **Formulário de contacto**: não tem backend. Ao submeter, valida os campos
  no browser e abre o WhatsApp com uma mensagem pré-formatada — nenhum dado
  é armazenado ou enviado para qualquer servidor.
- **Acessibilidade**: navegação completa por teclado, `aria-label`s em botões
  de ícone, formulário com `label`s associadas, lightbox com foco preso e
  fecho por `Esc`, e respeito por `prefers-reduced-motion`.
