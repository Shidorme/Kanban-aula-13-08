# 🚀 NovoKanban - Kanban Board de Alta Performance

Um aplicativo web moderno de **Kanban Board** (estilo Trello / Notion) construído com **React (Vite + TypeScript)**, **Tailwind CSS**, **@dnd-kit** e **Firebase (Authentication + Cloud Firestore)**.

![NovoKanban Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação Flexível**:
  - **Google Sign-In**: Login direto via popup do Firebase Auth.
  - **Modo Demonstrativo (Offline)**: Acesso instantâneo com salvamento em `localStorage` para testes offline ou ambientes sem chaves no `.env`.
- ⚡ **Drag and Drop Suave**:
  - Arraste e reordene colunas horizontalmente.
  - Arraste cartões entre colunas diferentes ou reordene dentro da mesma coluna utilizando `@dnd-kit`.
- ☁️ **Persistência Inteligente & Autosave**:
  - Dados sincronizados em tempo real no **Cloud Firestore** sob o caminho `boards/{uid}`.
  - **Debounce de 400ms** no salvamento automático para economizar requisições.
  - Listener de emergência no evento `beforeunload` da janela para garantir a gravação caso a aba seja fechada.
  - Redundância automática em `localStorage`.
- 🏷️ **Etiquetas & Prazos**:
  - Adicione e gerencie etiquetas coloridas com paletas de cores customizáveis.
  - Badges visuais com indicador de prazo de vencimento (*Atrasado*, *Hoje*, *Amanhã*, etc).
- 🔍 **Busca & Filtros**:
  - Pesquisa dinâmica por título, descrição ou nome da etiqueta.
  - Filtro exclusivo por etiqueta.
- 🛡️ **Segurança Estrita**:
  - Regras de segurança no Firestore garantindo isolamento total por `uid` do usuário logado.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: React 19, TypeScript, Vite
- **Estilização**: Tailwind CSS (CDN) + Google Fonts (*Inter* & *Outfit*)
- **Ícones**: Lucide Icons (`lucide-react`)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Backend & Auth**: Firebase Authentication & Cloud Firestore

---

## 📁 Estrutura do Projeto

```text
NovoKanban/
├── public/
├── src/
│   ├── config/
│   │   └── firebase.ts         # Inicialização do Firebase Client SDK
│   ├── context/
│   │   └── AuthContext.tsx     # Autenticação Google + Modo Demonstrativo
│   ├── hooks/
│   │   └── useBoardData.ts     # Hook de persistência Firestore + LocalStorage + Debounce
│   ├── types/
│   │   └── kanban.ts           # Interfaces TypeScript do Kanban
│   ├── components/
│   │   ├── Header.tsx          # Header com status de autosave, avatar e logout
│   │   ├── Login.tsx           # Tela de login
│   │   ├── KanbanBoard.tsx     # DndContext container, busca e filtros
│   │   ├── ColumnComponent.tsx # Coluna sortable e edição de título inline
│   │   ├── CardItem.tsx        # Card sortable com etiquetas e prazos
│   │   ├── CardModal.tsx       # Modal de criação/edição de cartão
│   │   ├── ConfirmModal.tsx    # Modal de confirmação de exclusão
│   │   └── Toast.tsx           # Notificações flutuantes (toasts)
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── firebase.json
├── firestore.rules
└── index.html
```

---

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório e instalar dependências

```bash
git clone https://github.com/SEU_USUARIO/NovoKanban.git
cd NovoKanban
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Preencha com as credenciais do seu projeto no Firebase Console:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> **Nota**: Se o arquivo `.env` não for preenchido, a aplicação utilizará automaticamente o **Modo Demonstrativo**, salvando tudo localmente no navegador!

### 3. Rodar em Modo de Desenvolvimento

```bash
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## 📦 Build & Deploy no Firebase Hosting

Para gerar o bundle de produção e fazer deploy no Firebase Hosting:

1. Gere os arquivos estáticos compilados:
   ```bash
   npm run build
   ```

2. Faça o deploy via Firebase CLI:
   ```bash
   firebase deploy
   ```

---

## 🛡️ Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar e modificar!
