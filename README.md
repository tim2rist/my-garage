<div align="center">
  <h1>🚗 MyGarage</h1>
  <p><b>Your Ultimate Cloud-Native Vehicle Logbook</b></p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

## ✨ What is MyGarage?
MyGarage is a **Progressive Web App (PWA)** built for car enthusiasts. It helps you track expenses, log service history, and keep all your vehicle documentation safely stored in the cloud. No more lost receipts or forgotten oil changes!

## 📸 Sneak Peek
> **Note to self:** *Drop a cool GIF or screenshot of the app working here!*
---

## 🚀 Features Roadmap
Watch the project grow! Here is what's done and what's coming:

- [x] **Secure Auth:** JWT-based login & registration.
- [x] **Cloud Storage:** Images directly uploaded to **AWS S3** (Stockholm).
- [x] **NoSQL Database:** Lightning-fast data fetch via **AWS DynamoDB**.
- [x] **Virtual Garage:** Add, edit, and remove your vehicles.
- [x] **Service Logs:** Track fuel, tuning, and maintenance expenses.
- [ ] **Community Feed:** See what other enthusiasts are building (WIP).
- [ ] **Dark Mode:** Because real developers code in the dark (WIP).

---

## 🛠️ The Tech Stack
We ditched local SQLite for a fully scalable Cloud architecture:
* **Frontend:** React 19 + Vite + Tailwind CSS (Fast & Responsive)
* **Backend:** Node.js + Express.js (REST API)
* **Cloud Infrastructure:** Amazon Web Services (DynamoDB for data, S3 for media)
* **Security:** bcryptjs + jsonwebtoken

---

## ⚡ Quick Start
Want to run this locally? It's easy.

**1. Grab the code:**
```bash
git clone [https://github.com/YOUR_USERNAME/mygarage-pwa.git](https://github.com/YOUR_USERNAME/mygarage-pwa.git)
```

**2. Set up the Cloud (Backend):**
Create a `.env` file in the `server/` folder and add your AWS credentials:
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
JWT_SECRET=make_it_secure
```

**3. Fire it up!**
Open two terminals.
* Terminal 1 (Backend): `cd server && npm install && npm run dev`
* Terminal 2 (Frontend): `cd client && npm install && npm run dev`

Boom! 💥 You're live on `http://localhost:5173`.
