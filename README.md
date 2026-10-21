# Academic Knowledge Hub

> **"Your Academic Knowledge, One Intelligent Hub."**

Academic Knowledge Hub is a peer-to-peer academic resource sharing platform for college students combined with a grounded, Retrieval-Augmented Generation (RAG) AI document assistant powered by Google Gemini and MongoDB Atlas Vector Search.

Students can share and discover lecture notes, previous year exam papers (PYQs), lab manuals, and assignments — and instantly interrogate any PDF using an intelligent document assistant that provides verified, page-cited answers without hallucinations.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Tech Stack](#3-tech-stack)
4. [Application Architecture](#4-application-architecture)
5. [Complete Folder Structure](#5-complete-folder-structure)
6. [Local Setup Guide](#6-local-setup-guide)
7. [Environment Variables](#7-environment-variables)
8. [MongoDB Atlas Setup](#8-mongodb-atlas-setup)
9. [MongoDB Atlas Vector Search Index Setup](#9-mongodb-atlas-vector-search-index-setup)
10. [Cloudinary Setup](#10-cloudinary-setup)
11. [Google Gemini API Setup](#11-google-gemini-api-setup)
12. [Google OAuth 2.0 Setup](#12-google-oauth-20-setup)
13. [Running Backend](#13-running-backend)
14. [Running Frontend](#14-running-frontend)
15. [Deployment Guide](#15-deployment-guide)
16. [How the RAG Engine Works](#16-how-the-rag-engine-works)
17. [REST API Documentation](#17-rest-api-documentation)
18. [Future Improvements](#18-future-improvements)

---

## 1. Project Overview

College students often struggle with scattered Google Drive links, lost Telegram PDFs, and bloated slide decks. Academic Knowledge Hub solves this problem through two core differentiators:
1. **Curated Peer-to-Peer Hub:** Categorized by semester, subject, and resource type (Notes, PYQs, Lab Manuals, Assignments).
2. **Document-Grounded RAG Assistant:** An AI side-companion that retrieves specific chunks from the chosen document and generates educational answers with clickable source page citations.

---

## 2. Key Features

- **Peer-to-Peer Resource Sharing:** Upload academic PDFs with detailed metadata (title, course, semester, type).
- **Interactive PDF Viewer:** Embedded PDF workspace supporting page navigation, zoom, download, and fullscreen.
- **RAG-Powered AI Document Assistant:** Ask conceptual or exam questions directly against any PDF.
- **Clickable Page Citations:** Sources such as `[Page 12]` jump the PDF viewer to that exact page.
- **Strict Anti-Hallucination Guardrails:** AI answers are grounded in retrieved context; if insufficient, the model explicitly acknowledges it.
- **Semantic Vector Search:** Powered by Gemini `text-embedding-004` (768 dimensions) and MongoDB Atlas `$vectorSearch`.
- **Full Authentication Suite:** Secure JWT in HttpOnly cookies, bcrypt hashing, and Google OAuth / OIDC.
- **Personal Repository Management:** Edit resource metadata or delete documents with automatic chunk and cloud asset cleanup.
- **Live Statistics:** Real database metrics on landing and dashboard screens (no fake numbers).
- **Graceful Offline/Local Fallback:** App starts and operates smoothly even before cloud API credentials are fully populated.

---

## 3. Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios (configured with `withCredentials: true`)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (REST API)
- **Database ODM:** Mongoose (v8+)
- **Vector Database:** MongoDB Atlas Vector Search
- **AI Models:** Google Gemini (`text-embedding-004` & `gemini-1.5-flash`)
- **PDF Extraction:** `pdf-parse` with page boundary preservation
- **File Storage:** Cloudinary (with local disk fallback in `uploads/`)
- **Auth & Security:** JWT (HttpOnly cookies), bcryptjs, Google Auth Library, Helmet, CORS, express-rate-limit

---

## 4. Application Architecture

```
                               ┌─────────────────────────┐
                               │       React Client      │
                               │  (Vite + Tailwind CSS)  │
                               └────────────┬────────────┘
                                            │ HTTP + HttpOnly Cookie
                                            ▼
                               ┌─────────────────────────┐
                               │    Express REST API     │
                               │(Controllers & Middleware│
                               └────────────┬────────────┘
                                            │
        ┌───────────────────┬───────────────┴───────────────┬────────────────────┐
        ▼                   ▼                               ▼                    ▼
┌───────────────┐   ┌───────────────┐               ┌───────────────┐    ┌───────────────┐
│ Cloudinary /  │   │  pdf-parse    │               │ Google Gemini │    │ MongoDB Atlas │
│ Local Storage │   │ Page-by-Page  │               │  Embeddings & │    │  + Vector     │
│  (PDF Files)  │   │ Text Chunking │               │   Generation  │    │  Search Index │
└───────────────┘   └───────────────┘               └───────────────┘    └───────────────┘
```

---

## 5. Complete Folder Structure

```
academic-knowledge-hub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js          # Cloudinary v2 client & fallback
│   │   │   ├── db.js                  # Mongoose connection & events
│   │   │   ├── gemini.js              # GoogleGenerativeAI client
│   │   │   ├── googleAuth.js          # Google OAuth2Client verification
│   │   │   └── index.js               # Centralized environment config
│   │   ├── controllers/
│   │   │   ├── aiController.js        # RAG Q&A query handler
│   │   │   ├── authController.js      # Register, login, logout, Google auth
│   │   │   ├── documentController.js  # PDF uploads, queries, CRUD, stats
│   │   │   ├── healthController.js    # Health & service status check
│   │   │   └── userController.js      # Profile, my-documents, account deletion
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT cookie / Bearer verification
│   │   │   ├── errorHandler.js        # Central error sanitizer
│   │   │   ├── rateLimiter.js         # Endpoint-specific rate limiting
│   │   │   └── uploadMiddleware.js    # Multer memory storage (25MB limit)
│   │   ├── models/
│   │   │   ├── Document.js            # Resource metadata schema & indexes
│   │   │   ├── DocumentChunk.js       # Vector embedding & page chunk schema
│   │   │   └── User.js                # Student user schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js          # /api/auth/*
│   │   │   ├── documentRoutes.js      # /api/documents/* & :id/ask
│   │   │   ├── healthRoutes.js        # /api/health
│   │   │   ├── index.js               # Master API router
│   │   │   └── userRoutes.js          # /api/users/*
│   │   ├── services/
│   │   │   ├── authService.js         # JWT generation, bcrypt, user syncing
│   │   │   ├── cloudinaryService.js   # Cloud upload & disk storage fallback
│   │   │   ├── documentService.js     # Background pipeline, queries, deletion
│   │   │   ├── embeddingService.js    # Gemini batch and query embeddings
│   │   │   ├── pdfService.js          # Page-aware text extraction & chunking
│   │   │   ├── ragService.js          # Academic context builder & Gemini RAG
│   │   │   └── vectorSearchService.js # MongoDB Atlas $vectorSearch + fallback
│   │   ├── utils/
│   │   │   ├── apiResponse.js         # Standard JSON response helpers
│   │   │   ├── constants.js           # Enums & model constants
│   │   │   └── logger.js              # Structured console logger
│   │   ├── app.js                     # Express app setup (Helmet, CORS, etc.)
│   │   └── server.js                  # Database connection and HTTP server
│   ├── uploads/                       # Local disk storage fallback for PDFs
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   ├── AIChat.jsx         # Chat container with suggestions & state
│   │   │   │   ├── ChatMessage.jsx    # Formatted responses & citations
│   │   │   │   └── SourceReference.jsx# Clickable [Page X] citation button
│   │   │   ├── auth/
│   │   │   │   ├── GoogleAuthButton.jsx
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── ProtectedRoute.jsx # Route guard
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── documents/
│   │   │   │   ├── DocumentHeader.jsx # Metadata and contributor badge
│   │   │   │   └── PDFViewer.jsx      # Interactive PDF controls & canvas
│   │   │   ├── layout/
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Navbar.jsx         # Responsive navbar with user menu
│   │   │   └── resources/
│   │   │       ├── FilterBar.jsx      # Subject, semester, category filters
│   │   │       ├── ResourceCard.jsx   # Resource card with status badge
│   │   │       ├── ResourceGrid.jsx   # Responsive grid with skeletons
│   │   │       └── SearchBar.jsx      # Real-time search input
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Auth state & user session
│   │   │   └── ToastContext.jsx       # Global notification toasts
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useToast.js
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx      # Welcome, quick actions, feeds
│   │   │   ├── DocumentViewPage.jsx   # Two-column PDF viewer + AI Assistant
│   │   │   ├── LandingPage.jsx        # 9-section SaaS landing page
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyResourcesPage.jsx    # Edit/delete user uploads
│   │   │   ├── NotFoundPage.jsx       # 404 handler
│   │   │   ├── ProfilePage.jsx        # Profile and contributions
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ResourcesPage.jsx      # Search, filter, pagination
│   │   │   ├── SettingsPage.jsx       # Session info, logout, delete account
│   │   │   └── UploadPage.jsx         # Drag-and-drop PDF upload
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── api.js                 # Axios instance with credentials
│   │   │   ├── authService.js
│   │   │   ├── documentService.js
│   │   │   └── userService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 6. Local Setup Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- A **MongoDB Atlas** cluster connection string (or a local MongoDB instance)

### Installation Steps
1. Clone or open the repository:
   ```bash
   cd "academic-knowledge-hub"
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure your `.env` file inside `backend/` (see section 7).

---

## 7. Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/academic_knowledge_hub?retryWrites=true&w=majority

# JWT Secret for Session Authentication
JWT_SECRET=your_super_secret_jwt_random_key_here
JWT_EXPIRES_IN=7d

# Google Gemini API Key (Required for PDF Embeddings & RAG Q&A Assistant)
GEMINI_API_KEY=AIzaSy...

# Cloudinary Storage (Required for cloud PDF hosting; local disk used if empty)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth 2.0 (Optional; email/password authentication is active by default)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## 8. MongoDB Atlas Setup

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with read/write permissions.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or your specific IP.
4. Go to **Database > Connect > Connect your application** and copy the URI.
5. Paste it as `MONGODB_URI` in `backend/.env`.

---

## 9. MongoDB Atlas Vector Search Index Setup

To enable native `$vectorSearch` acceleration on your Atlas cluster:

1. In MongoDB Atlas, select your cluster and navigate to **Atlas Search** (or **Search & Vector Search**).
2. Click **Create Search Index**.
3. Select **JSON Editor** under **Atlas Vector Search**.
4. Choose the database `academic_knowledge_hub` and collection `documentchunks`.
5. Enter the Index Name: `vector_index`.
6. Paste the following JSON definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

7. Click **Next** and **Create Vector Search Index**.

> **Note on Resiliency:** The backend includes an automated fallback mechanism: if the Atlas vector index is still building or if running in a local MongoDB environment, the system automatically retrieves document chunks and computes exact cosine similarity in memory. This ensures the RAG pipeline is functional at all times.

---

## 10. Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2. On your Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Paste them into `backend/.env`.

> If Cloudinary credentials are not provided, the application will automatically fall back to local disk storage in `backend/uploads/` and serve files statically.

---

## 11. Google Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API Key** and create a new key.
3. Set `GEMINI_API_KEY` in `backend/.env`.

The application leverages:
- `text-embedding-004` (768 dimensions) for text chunking and query embeddings.
- `gemini-1.5-flash` for high-speed, grounded contextual generation.

---

## 12. Google OAuth 2.0 Setup

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `Academic Knowledge Hub`).
3. Configure the **OAuth Consent Screen** (User Type: External, scopes: `email`, `profile`).
4. Under **Credentials**, click **Create Credentials > OAuth Client ID**.
5. Application type: **Web application**.
6. Set Authorized JavaScript Origins:
   - `http://localhost:5173`
   - `http://localhost:5000`
7. Set Authorized Redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
8. Copy the **Client ID** and **Client Secret** into `backend/.env`.

---

## 13. Running Backend

From the `backend/` directory:

```bash
# Development mode with hot-reloading
npm run dev

# Or production start
npm start
```

The backend server starts on `http://localhost:5000`.
Health status check: `http://localhost:5000/api/health`.

---

## 14. Running Frontend

From the `frontend/` directory:

```bash
# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

To verify production builds:
```bash
npm run build
npm run preview
```

---

## 15. Deployment Guide

### Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. In Vercel, import the repository and set Root Directory to `frontend`.
3. Set environment variables:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://academic-backend.onrender.com/api`).
4. Build command: `npm run build` | Output directory: `dist`.

### Backend Deployment (Render)
1. In Render, create a new **Web Service**.
2. Set Root Directory to `backend`.
3. Build Command: `npm install` | Start Command: `node src/server.js`.
4. Add all environment variables from `backend/.env.example` in the Render Environment tab.
5. Set `NODE_ENV=production` and `FRONTEND_URL` to your Vercel URL.

---

## 16. How the RAG Engine Works

```
Student Asks: "What is 3NF?"
      │
      ▼
1. Query Vectorization:
   Gemini text-embedding-004 generates a 768-dimensional vector from the student's question.
      │
      ▼
2. Isolated Vector Search:
   MongoDB Atlas Vector Search queries the `DocumentChunk` collection filtered strictly by `documentId`.
   Only chunks belonging to the selected document are retrieved (Top-5 candidates).
      │
      ▼
3. Context Construction:
   Retrieved chunks are formatted with page boundaries:
   [Page 12 Reference]: "...Third Normal Form definition..."
      │
      ▼
4. Grounded Generation:
   The constructed context and system prompt are sent to Gemini:
   "You are an academic document assistant... Do not invent facts... associate with page numbers."
      │
      ▼
5. Interactive Citation Response:
   Returns `{ answer: "...", sources: [{ documentId, pageNumber: 12 }] }`.
   Frontend renders clickable `[Page 12]` badges that scroll the PDF viewer directly to Page 12.
```

---

## 17. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student account | No |
| `POST` | `/api/auth/login` | Login with email & password | No |
| `POST` | `/api/auth/logout` | Clear authentication cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user | Yes |
| `GET` | `/api/auth/google` | Get Google OAuth consent URL | No |
| `GET` | `/api/auth/google/callback` | Google OAuth redirect handler | No |
| `POST` | `/api/auth/google/verify` | Direct Google token verification | No |

### Documents (`/api/documents`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/documents` | List documents (search, filter, pagination) | Optional |
| `GET` | `/api/documents/stats` | System document & chunk statistics | No |
| `GET` | `/api/documents/subjects` | Distinct subject list | No |
| `GET` | `/api/documents/:id` | Get document by ID | Optional |
| `POST` | `/api/documents` | Upload PDF & start async vectorization | Yes |
| `PATCH` | `/api/documents/:id` | Update document metadata (owner only) | Yes |
| `DELETE` | `/api/documents/:id` | Delete document, chunks & files | Yes |

### AI RAG Assistant (`/api/documents/:id/ask`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/documents/:id/ask` | Ask grounded AI question on document | Yes |

### User Management (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/me/documents` | List all resources uploaded by user | Yes |
| `GET` | `/api/users/me/profile` | Get user profile and upload counts | Yes |
| `PATCH` | `/api/users/me/profile` | Update profile information | Yes |
| `DELETE` | `/api/users/me/account` | Permanently delete account & uploads | Yes |

### System Health (`/api/health`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check & service connectivity | No |

---

## 18. Future Improvements

- [ ] Multi-document cross-comparison within the same semester or subject.
- [ ] OCR extraction support for scanned handwritten student notes.
- [ ] Collaborative document annotation and shared AI highlights.
- [ ] Exportable AI study guides and auto-generated flashcards.

---

## License

This project is licensed under the MIT License.
