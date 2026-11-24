# Acesso Pass · Orçamentos

Sistema online de propostas comerciais da Acesso Pass: login da equipe, lista de orçamentos com busca e status,
editor completo, histórico de versões (nada se perde ao refazer), duplicar orçamento e PDF no modelo da Acesso Pass.

## Como funciona na Vercel

1. O projeto está ligado a este repositório: todo `git push` na `main` publica sozinho.
2. Banco de dados: na Vercel, abra o projeto → **Storage** → **Create Database** → **Neon (Postgres)** → conecte ao projeto.
   Isso cria a variável `DATABASE_URL`. Depois faça **Redeploy**.
3. Abra o site: no primeiro acesso aparece a tela para criar o administrador.
   As tabelas do banco são criadas sozinhas.

## Variáveis de ambiente

| Variável | Obrigatória | Para que serve |
|---|---|---|
| `DATABASE_URL` | sim (o Neon cria) | conexão com o Postgres |
| `SESSION_SECRET` | não | chave das sessões; se não existir, o sistema gera uma e guarda no banco |

## Rodar no computador

```bash
npm install
DATABASE_URL=pglite:./.data npm run dev   # banco local em arquivo, sem instalar Postgres
```

## Onde mexer

- `lib/defaults.ts` — modelo padrão e catálogo inicial (depois tudo é editável em **Configurações**)
- `components/Documento.tsx` + `app/imprimir/doc.css` — layout do PDF
- `components/Editor.tsx` — tela de edição do orçamento
- `lib/db.ts` — tabelas do banco

## Versões e aviso de atualização

- O número da versão fica em `lib/versao.ts`. A cada atualização, adicione um item no topo de `NOVIDADES`
  com a versão nova e o que mudou. Ele aparece em **Novidades** (clicando no número da versão).
- Quem estiver com o sistema aberto recebe o aviso "Nova versão disponível" assim que a publicação terminar
  (o sistema confere a cada minuto e quando a pessoa volta para a aba/app).

## App no celular

O sistema pode ser instalado na tela inicial (Android: botão "Instalar"; iPhone: Compartilhar → Adicionar à Tela de Início).
Na tela do PDF, o botão "Enviar PDF" abre o compartilhamento do celular (WhatsApp, e-mail…).
