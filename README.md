# Mata Kuliner - Monorepo

Sistem manajemen restoran dengan Next.js, NestJS, dan PostgreSQL.

## Struktur Project

- `frontend/`: Next.js application (Bun)
- `backend/`: NestJS application (Bun)
- `docker-compose.yml`: Orchestration untuk semua service.

## Cara Menjalankan

### Menggunakan Docker Compose (Direkomendasikan)

Pastikan Docker Desktop sudah berjalan, lalu jalankan:

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)
- Adminer (DB UI): [http://localhost:8088](http://localhost:8088)
- Database: `localhost:5432`

### Menjalankan Manual dengan Bun

**Frontend:**
```bash
cd frontend
bun install
bun run dev
```

**Backend:**
```bash
cd backend
bun install
bun run start:dev
```

### Tips Pengembangan Cepat

1. **Jangan Stop Container (`Ctrl+C`) untuk Refresh Code**:
   Cukup **Save File** di code editor, perubahan akan otomatis terupdate (Hot Reload).

2. **Jika Harus Restart**:
   Gunakan command ini agar tidak perlu build ulang image (lebih cepat):
   ```bash
   docker compose up
   ```
   Hilangkan flag `--build` kecuali jika anda mengubah `package.json` atau `Dockerfile`.

3. **Restart Frontend/Backend Saja**:
   ```bash
   docker compose restart frontend
   # atau
   docker compose restart backend
   ```
