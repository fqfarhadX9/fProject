# VidStream 🎬

---
# Summary of this project

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have.
We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project and we are sure that you will learn a lot from this project.


## 🚀 Features

- User authentication (JWT)
- Upload and manage videos
- Toggle video publish/unpublish status
- Fetch channel stats (total videos, views, likes, subscribers)
- Fetch all videos for a channel
- Healthcheck endpoint
- Standardized API responses
- Error handling middleware

---

## 🛠 Technologies

- Node.js
- Express.js
- MongoDB & Mongoose
- Async/Await & Error Handling Middleware
- RESTful API Design

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthcheck` | Check if API is running |
| GET | `/api/channel/:channelId/videos` | Get all videos for a channel |
| GET | `/api/channel/:channelId/stats` | Get channel statistics |
| PATCH | `/api/video/:videoId/toggle-publish` | Toggle video publish status |
| PUT | `/api/video/:videoId` | Update video details (title, description, thumbnail) |
| DELETE | `/api/video/:videoId` | Delete a video |

---

## 📸 Example Requests & Responses

### Healthcheck
**Request:** `GET /api/healthcheck`  
**Response:**
```json
{
  "statusCode": 200,
  "data": { "message": "API is healthy" },
  "message": "OK"
}

