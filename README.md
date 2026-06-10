# Tellro — Team Task Tracker

แอพ Todo สำหรับทีม office เล็ก รัน Docker บน LAN ใช้ร่วมกันได้ทันที

## 🚀 เริ่มใช้งาน

### ต้องการ
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) หรือ Docker + Docker Compose

### รันครั้งแรก

```bash
# 1. เปิด terminal ที่โฟลเดอร์นี้
cd tellro-dotolist

# 2. Build และ start ทุก service
docker compose up --build -d

# 3. เปิดเบราว์เซอร์
# เครื่องตัวเอง: http://localhost:3000
# เครื่องอื่นใน LAN: http://<IP-เครื่องที่รัน>:3000
```

### หา IP เครื่องที่รัน Docker
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep inet
```

## 📱 หน้าต่างๆ

| หน้า | คำอธิบาย |
|------|-----------|
| **วันนี้** | งานวันนี้ + Progress % + งานที่กำลังทำ |
| **Board** | Kanban board แบ่งตามสถานะ |
| **ทีม** | ดูว่าใครกำลังทำงานอะไรอยู่ |
| **Projects** | จัดกลุ่มงานตาม project |

## 🔧 คำสั่งที่ใช้บ่อย

```bash
# หยุด
docker compose down

# ดู logs
docker compose logs -f

# Restart
docker compose restart

# ลบข้อมูลทั้งหมด (เริ่มใหม่)
docker compose down -v
```

## 🏗️ โครงสร้าง

```
tellro-dotolist/
├── docker-compose.yml      # orchestration
├── backend/                # Node.js + Express API
│   ├── Dockerfile
│   └── src/
│       ├── index.js
│       ├── db/schema.js    # PostgreSQL schema
│       ├── middleware/auth.js
│       └── routes/         # auth, tasks, projects
└── frontend/               # React + Vite
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── pages/          # Today, Board, Team, Projects
        └── components/     # TaskCard, TaskModal, Sidebar
```

## 🔒 Default

- Database: PostgreSQL 16 (data เก็บใน Docker volume)
- Auth: JWT token, 30 วัน
- Port 3000: Frontend
- Port 4000: API (ใช้งาน internal)
