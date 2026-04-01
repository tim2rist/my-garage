# MyGarage – Cyfrowy dziennik pojazdu 🚗

Aplikacja PWA dla entuzjastów motoryzacji. Umożliwia śledzenie wydatków, historii serwisowej i przeglądanie projektów innych użytkowników.

---

## Stack technologiczny

| Warstwa    | Technologia                                    |
|------------|------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS v4, React Router  |
| Backend    | Node.js, Express 5                             |
| Baza danych| SQLite (better-sqlite3)                        |
| Auth       | JWT (jsonwebtoken) + bcryptjs                  |
| PWA        | vite-plugin-pwa                                |

---

## Struktura projektu

```
mygarage/
├── client/                  ← Frontend (React)
│   └── src/
│       ├── App.jsx
│       ├── contexts/
│       │   └── AuthContext.jsx        ← Auth state + authFetch
│       ├── pages/
│       │   ├── Auth.jsx               ← Logowanie / Rejestracja
│       │   ├── Dashboard.jsx          ← Pojazdy + statystyki
│       │   ├── ServiceHistory.jsx     ← Historia wpisów (NOWE)
│       │   └── Community.jsx          ← Galeria + wyszukiwanie
│       └── components/
│           ├── AddEntryModal.jsx      ← Modal dodawania wpisu
│           └── AddVehicleModal.jsx    ← Modal dodawania pojazdu (NOWE)
│
└── server/
    ├── server.js            ← Express API
    ├── package.json
    └── mygarage.db          ← Tworzy się automatycznie
```

---

## Uruchomienie projektu

### 1. Backend

```bash
cd server
npm install
npm run dev
# Serwer działa na http://localhost:3000
```

> **Uwaga:** `better-sqlite3` wymaga kompilacji natywnej.
> Potrzebujesz: Node.js 18+, Python 3, i node-gyp.
> Na Windows: `npm install -g windows-build-tools`
> Na Mac/Linux: zwykle działa od razu.

### 2. Frontend

```bash
cd client
npm install
npm run dev
# Aplikacja działa na http://localhost:5173
```

---

## API – Endpointy

### Autoryzacja
| Metoda | Ścieżka                  | Opis                        | Auth |
|--------|--------------------------|-----------------------------|------|
| GET    | /api/check-id/:id        | Sprawdź dostępność ID       | Nie  |
| POST   | /api/register            | Rejestracja                 | Nie  |
| POST   | /api/login               | Logowanie                   | Nie  |

### Pojazdy
| Metoda | Ścieżka                  | Opis                        | Auth |
|--------|--------------------------|-----------------------------|------|
| GET    | /api/vehicles            | Pobierz pojazdy użytkownika | Tak  |
| POST   | /api/vehicles            | Dodaj pojazd                | Tak  |
| DELETE | /api/vehicles/:id        | Usuń pojazd                 | Tak  |

### Wpisy (Historia serwisowa)
| Metoda | Ścieżka                           | Opis              | Auth |
|--------|-----------------------------------|-------------------|------|
| GET    | /api/vehicles/:id/entries         | Pobierz wpisy     | Tak  |
| POST   | /api/vehicles/:id/entries         | Dodaj wpis        | Tak  |
| DELETE | /api/entries/:id                  | Usuń wpis         | Tak  |

### Statystyki i Społeczność
| Metoda | Ścieżka                           | Opis                     | Auth |
|--------|-----------------------------------|--------------------------|------|
| GET    | /api/stats                        | Statystyki miesięczne    | Tak  |
| GET    | /api/community/search/:username   | Wyszukaj użytkownika     | Nie  |

### Body dla POST /api/register
```json
{ "username": "miki_tuning", "email": "miki@example.com", "password": "haslo123" }
```

### Body dla POST /api/vehicles
```json
{ "make": "BMW", "model": "E46 M3", "year": 2003, "image_url": "https://..." }
```

### Body dla POST /api/vehicles/:id/entries
```json
{
  "type": "paliwo",       // paliwo | serwis | czesci | inne
  "amount": 150.50,
  "description": "Tankowanie BP",
  "mileage": 123000,      // opcjonalne
  "is_public": false      // widoczny w Społeczności
}
```

---

## Zmiany względem pierwotnego kodu

### Naprawione błędy
- Import `AddEntryModal` w `Dashboard.jsx` wskazywał zły katalog
- Brak rzeczywistej persystencji danych (tylko hardcoded array)
- Autentykacja nie wykonywała żadnych zapytań do API

### Nowe funkcjonalności
- ✅ SQLite database – dane zapisywane na dysku
- ✅ Rejestracja z haszowaniem hasła (bcrypt)
- ✅ Logowanie z tokenem JWT (7 dni)
- ✅ Token zapisywany w localStorage – sesja przeżywa odświeżenie
- ✅ Modal dodawania pojazdu (marka, model, rok, URL zdjęcia)
- ✅ Usuwanie pojazdów (pojawia się na hover)
- ✅ Wpisy zapisywane do bazy – kwota, przebieg, opis, is_public
- ✅ Usuwanie wpisów
- ✅ Strona Historia Serwisowa z filtrami (typ, pojazd)
- ✅ Wyszukiwanie użytkowników w Społeczności działa przez API
- ✅ Statystyki miesięczne z podziałem na kategorie
- ✅ Profil użytkownika widoczny w sidebarze

---

## Dane testowe

Po uruchomieniu możesz zarejestrować konta przez UI lub curl:

```bash
# Rejestracja
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"miki_tuning","email":"miki@test.com","password":"haslo123"}'

# Logowanie
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"miki@test.com","password":"haslo123"}'
```
