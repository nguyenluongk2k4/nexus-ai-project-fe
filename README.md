# Frontend - AI Skill Tree Web UI

React + Vite application cho giao diện người dùng.

## Prerequisites

- Node.js >= 18
- npm >= 9

## Cài đặt

```bash
npm install
```

## Chạy Development Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

## Build Production

```bash
npm run build
```

Output sẽ được tạo trong thư mục `build/`.

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── data/          # Static data
│   ├── styles/        # CSS styles
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies
└── vite.config.ts     # Vite configuration
```

## Kết nối với Backend

Frontend kết nối với Backend qua WebSocket tại `ws://localhost:8000/ws`


