# Portfolio EMI — Tech Lead Data & IA

Portfolio professionnel d'Eddy Missoni Idembi (EMI), Chef de projet et Tech Lead Data & IA.

## 🚀 Technologies

- **Next.js 15** (App Router)
- **React 19**
- **CSS** (globals + utility classes)
- **Hugging Face Inference API** (RAG complet)

## ✨ Fonctionnalités

### Portfolio
- Présentation professionnelle avec design Blueprint UI
- Expériences clés et projets clients
- Labs interactifs pour démonstrations techniques

### RAG Studio — Démonstration interactive
Système RAG complet et fonctionnel utilisant Hugging Face :

- **Upload de documents** : PDF, TXT, MD (max 10 Mo)
- **Chunking automatique** : Découpage avec overlap (500-800 caractères)
- **Embeddings** : `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Recherche sémantique** : Similarité cosinus
- **Génération** : `mistralai/Mistral-7B-Instruct-v0.2`
- **Citations** : Références [chunkId@start]

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Créez un fichier `.env.local` :

```env
HF_API_TOKEN=hf_votre_token_ici
```

Obtenez votre token sur [Hugging Face](https://huggingface.co/settings/tokens).

## 🏃 Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📁 Structure

```
portfolio-emi/
├── app/
│   ├── api/
│   │   └── rag/          # API RAG (upload, embed, ask)
│   ├── labs/
│   │   └── rag-studio/   # Interface RAG interactive
│   └── ...
│
└── lib/
    ├── rag-utils.js      # Utilitaires RAG (embeddings, génération)
    └── doc-storage.js    # Stockage en mémoire des documents
```

## 🎯 Endpoints RAG

- `POST /api/rag/upload` : Upload et chunking d'un fichier
- `POST /api/rag/embed` : Génération des embeddings (Hugging Face)
- `POST /api/rag/ask` : Question → Retrieval → Génération

## 📝 License

Propriétaire — Tous droits réservés
