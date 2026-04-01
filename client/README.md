# MyGarage – Cyfrowy dziennik pojazdu 🚗

Aplikacja PWA dla entuzjastów motoryzacji. Umożliwia śledzenie wydatków,
historii serwisowej i przeglądanie projektów innych użytkowników.

---

## Stack technologiczny

| Warstwa       | Technologia                                               |
|---------------|-----------------------------------------------------------|
| Frontend      | React 19 · Vite · Tailwind CSS v4 · React Router DOM     |
| Backend       | Node.js · Express 4 · better-sqlite3                     |
| Baza danych   | SQLite (plik `mygarage.db` – bez konfiguracji serwera)    |
| Autentykacja  | JWT (`jsonwebtoken`) + bcryptjs                           |
| Upload plików | Multer (in-memory) → AWS S3                               |
| PWA           | vite-plugin-pwa                                           |

> **Wybór bazy danych – uzasadnienie:**
> SQLite zamiast PostgreSQL/DynamoDB dlatego, że:
> - Zero konfiguracji serwera – plik .db tworzy się automatycznie
> - Idealne dla projektu demonstracyjnego (jedna instancja, lokalnie)
> - Migracja do PostgreSQL wymaga zmiany tylko połączenia (schema jest identyczne SQL)

---

## Struktura projektu

```
mygarage/
├── client/                         ← Frontend (React + Vite)
│   ├── .env.example                ← zmienne środowiskowe frontendu
│   └── src/
│       ├── App.jsx                 ← routing + layout
│       ├── contexts/
│       │   └── AuthContext.jsx     ← stan auth + authFetch helper
│       ├── pages/
│       │   ├── Auth.jsx            ← logowanie / rejestracja
│       │   ├── Dashboard.jsx       ← pojazdy + statystyki miesiąca
│       │   ├── ServiceHistory.jsx  ← pełna historia wpisów + filtry
│       │   └── Community.jsx       ← galeria + wyszukiwanie po ID
│       └── components/
│           ├── AddEntryModal.jsx   ← modal: dodaj wpis serwisowy
│           └── AddVehicleModal.jsx ← modal: dodaj pojazd (plik / URL)
│
└── server/
    ├── server.js       ← Express API (Auth · Vehicles · Entries · S3)
    ├── package.json
    ├── .env.example    ← zmienne środowiskowe backendu
    ├── .gitignore
    └── mygarage.db     ← tworzy się automatycznie przy pierwszym uruchomieniu
```

---

## API – Endpointy

### Autoryzacja
| Metoda | Ścieżka               | Opis                        | Auth? |
|--------|-----------------------|-----------------------------|-------|
| GET    | /api/health           | Status serwera + S3         | Nie   |
| GET    | /api/check-id/:id     | Sprawdź dostępność username | Nie   |
| POST   | /api/register         | Rejestracja                 | Nie   |
| POST   | /api/login            | Logowanie → token JWT       | Nie   |

### Upload
| Metoda | Ścieżka              | Opis                           | Auth? |
|--------|----------------------|--------------------------------|-------|
| POST   | /api/upload/image    | Prześlij zdjęcie → S3 / base64 | TAK   |

### Pojazdy
| Metoda | Ścieżka           | Opis                        | Auth? |
|--------|-------------------|-----------------------------|-------|
| GET    | /api/vehicles     | Lista pojazdów użytkownika  | TAK   |
| POST   | /api/vehicles     | Dodaj pojazd                | TAK   |
| DELETE | /api/vehicles/:id | Usuń pojazd (kaskadowo)     | TAK   |

### Wpisy (Historia)
| Metoda | Ścieżka                      | Opis               | Auth? |
|--------|------------------------------|--------------------|-------|
| GET    | /api/vehicles/:id/entries    | Wpisy pojazdu      | TAK   |
| POST   | /api/vehicles/:id/entries    | Dodaj wpis         | TAK   |
| DELETE | /api/entries/:id             | Usuń wpis          | TAK   |

### Statystyki i Społeczność
| Metoda | Ścieżka                         | Opis                         | Auth? |
|--------|---------------------------------|------------------------------|-------|
| GET    | /api/stats                      | Statystyki bieżącego miesiąca| TAK   |
| GET    | /api/community/search/:username | Wyszukaj użytkownika po ID   | Nie   |
| GET    | /api/community/entries          | Publiczne wpisy (feed)       | Nie   |

---

## Uruchomienie lokalne

### Wymagania
- Node.js 18+
- npm 9+
- Python 3 + node-gyp (wymagane przez `better-sqlite3`)
  - **Windows:** `npm install -g windows-build-tools` (PowerShell jako admin)
  - **macOS/Linux:** zwykle dostępne natywnie

### 1. Klon / kopiowanie plików

```bash
# Skopiuj pliki zgodnie ze strukturą powyżej
# (lub użyj dostarczonych plików)
```

### 2. Backend

```bash
cd server

# Skopiuj i uzupełnij zmienne środowiskowe
cp .env.example .env
# Edytuj .env – przynajmniej JWT_SECRET (AWS opcjonalne)

npm install
npm run dev
# ✅ Serwer: http://localhost:3000
```

> Przy pierwszym uruchomieniu plik `mygarage.db` tworzy się automatycznie.

### 3. Frontend

```bash
cd client

# (opcjonalnie) Skopiuj zmienne środowiskowe
cp .env.example .env

npm install
npm run dev
# ✅ Aplikacja: http://localhost:5173
```

Otwórz http://localhost:5173 w przeglądarce.

---

## Konfiguracja AWS S3 (opcjonalna)

Bez S3 aplikacja działa w pełni lokalnie.
Przesłane zdjęcia będą kodowane jako base64 URL i zapisywane w bazie.

### Krok 1 – Utwórz bucket S3

1. Zaloguj się do [AWS Console](https://console.aws.amazon.com/s3)
2. Utwórz nowy bucket (np. `my-mygarage-app`)
3. **Wyłącz** opcję „Block all public access"
4. Dodaj Bucket Policy (zastąp `BUCKET_NAME` nazwą bucketa):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::BUCKET_NAME/*"
  }]
}
```

### Krok 2 – Utwórz użytkownika IAM

1. IAM → Users → Create user
2. Dołącz politykę `AmazonS3FullAccess` (lub utwórz minimalną)
3. Utwórz Access Key → skopiuj `Key ID` i `Secret Key`

### Krok 3 – Uzupełnij `.env` w server/

```env
AWS_REGION=eu-central-1          # Region bucketa
AWS_BUCKET_NAME=my-mygarage-app
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

Po restarcie serwera: `GET /api/health` powinien zwrócić `"s3": "enabled"`.

---

## Testowanie API (curl)

```bash
# Rejestracja
curl -s -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"miki_tuning","email":"miki@test.com","password":"haslo123"}'

# Logowanie → skopiuj token
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"miki@test.com","password":"haslo123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# Dodaj pojazd
curl -s -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"make":"BMW","model":"E46 M3","year":2003,"image_url":"https://images.unsplash.com/photo-1555353540-64fd1b19584d?w=800"}'

# Pobierz pojazdy
curl -s http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer $TOKEN"
```

---

## Zrealizowane funkcjonalności

- ✅ Rejestracja i logowanie z JWT (7 dni ważności)
- ✅ Persystencja danych (SQLite – plik .db)
- ✅ Zarządzanie pojazdami (dodaj / usuń)
- ✅ Historia wpisów (paliwo, serwis, części, inne) + filtry
- ✅ Upload zdjęć pojazdu – plik lub URL; jeśli S3 skonfigurowane → chmura
- ✅ Statystyki miesięczne na dashboardzie
- ✅ Wyszukiwanie użytkowników w Społeczności
- ✅ PWA – instalacja na urządzeniu mobilnym
- ✅ Tryb jasny / ciemny
- ✅ Responsywny design (mobile + desktop)
