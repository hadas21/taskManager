# Urgent Logistics Task Manager API

שירות API לניהול משימות לוגיסטיות דחופות במרכז הפצה.

## מה כולל הפתרון

1. **ניהול תורים אסינכרוני עם BullMQ + Redis**
   - קריאות עדכון משימה לא נכתבות ישירות ל־DB.
   - כל עדכון נכנס ל־Queue בשם `urgent-logistics-tasks` ומעובד על ידי Worker עם `concurrency: 10`.

2. **Rate Limiting**
   - הגבלת קצב גלובלית לפי IP: עד **30 בקשות בדקה**.
   - במקרה חריגה מוחזר `429 Too Many Requests`.

3. **בדיקות יחידה (Unit Tests)**
   - בדיקה שהלוגיקה המרכזית שומרת משימה תקינה ומגדילה `version`.
   - בדיקת מניעת כתיבה מתחרה באמצעות `expectedVersion` (Optimistic Locking).
   - בדיקת ולידציה לערך סטטוס לא תקין.

4. **מענה לשאלת Race Condition**
   - כדי למנוע מצב ששני עובדים מעדכנים אותה משימה בו־זמנית:
     - שימוש ב־**Optimistic Locking** עם שדה `version` לכל משימה.
     - הלקוח שולח `expectedVersion`; אם גרסת הרשומה השתנתה עד זמן הכתיבה — העדכון נדחה עם שגיאת `Version conflict`.
     - ניתן לשלב גם **Distributed Lock (Redis SET NX + TTL)** סביב עדכון משימה קריטית במיוחד.

---

## התקנה והרצה

```bash
npm install
npm start
```

ברירת מחדל: `http://localhost:3000`

> יש לוודא ש־Redis רץ על `redis://127.0.0.1:6379` או להגדיר `REDIS_URL`.

## הרצת בדיקות

```bash
npm test
```

## API Endpoints

### 1) enqueue עדכון משימה

**POST** `/tasks/update`

```json
{
  "taskId": "T-123",
  "status": "IN_PROGRESS", // OPEN | IN_PROGRESS | BLOCKED | DONE
  "priority": "critical",
  "location": "Dock-7",
  "expectedVersion": 2
}
```

תגובה:

```json
{
  "message": "Task update accepted for async processing",
  "jobId": "123"
}
```

### 2) שליפת משימה

**GET** `/tasks/:taskId`

