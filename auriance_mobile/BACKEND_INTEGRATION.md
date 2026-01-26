# AURIANCE Flutter App - Backend Integration Guide

## API Endpoint Mapping

### Authentication Endpoints

#### Register
```dart
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Login
```dart
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=john_doe&password=SecurePassword123!

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { ... }
}
```

---

### Transcription Endpoints

#### Create Transcription (WITH AUDIO FILE)
```dart
POST /data/transcriptions
Authorization: Bearer {token}
Content-Type: multipart/form-data

Fields:
- text (string): Transcribed text or placeholder
- language (string): 'fr', 'en', 'es', etc.
- duration_seconds (float): Audio duration
- confidence_score (float): 0.0-1.0
- audio_file (binary): WAV file data

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "text": "Bonjour, comment allez-vous?",
  "language": "fr",
  "duration_seconds": 3.5,
  "confidence_score": 0.92,
  "audio_file_path": "/uploads/audio_uuid.wav",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get User Transcriptions
```dart
GET /data/transcriptions?skip=0&limit=20
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "text": "...",
    "language": "fr",
    "duration_seconds": 3.5,
    "confidence_score": 0.92,
    "created_at": "2024-01-01T00:00:00Z"
  },
  ...
]
```

#### Search Transcriptions (Semantic)
```dart
POST /data/transcriptions/search/semantic
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "greetings",
  "limit": 10
}

Response:
[
  {
    "id": "uuid",
    "text": "Bonjour, comment allez-vous?",
    "similarity_score": 0.85,
    ...
  },
  ...
]
```

---

## Current Implementation Status

### ✅ Implemented
- [x] Api client with Dio
- [x] Auth token injection
- [x] Error handling
- [x] Storage service (token persistence)
- [x] User provider (state management)
- [x] Recording service (audio capture)

### 🔄 In Progress
- [ ] Audio file streaming to backend
- [ ] Real-time transcription display
- [ ] WebSocket integration

### ⏳ TODO
- [ ] Extract/parse transcription data
- [ ] Search UI implementation
- [ ] Export transcriptions
- [ ] Offline mode

---

## How to Test Locally

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Verify Endpoints
```bash
# Check if backend is running
curl http://localhost:8000/docs

# Test registration
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

### 3. Run Flutter App
```bash
cd auriance_mobile
flutter run
```

---

## Streaming Audio Implementation (TODO)

### Current Code Location
[recording_screen.dart](lib/screens/recording_screen.dart) - Line ~77

### What Needs to Be Done
```dart
Future<void> _sendTranscription() async {
  // 1. Get audio bytes from _audioService
  final audioBytes = await _audioService.getAudioBytes();
  
  // 2. Create multipart request
  final multipartRequest = /* convert audioBytes to file */;
  
  // 3. Send to backend with FormData
  final response = await _apiService.createTranscription(
    text: '',
    language: _selectedLanguage,
    durationSeconds: duration,
    audioFile: audioBytes,
  );
  
  // 4. Display transcription result
  setState(() {
    _transcribedText = response.text;
    _confidence = response.confidenceScore;
  });
}
```

### Using Dio FormData
```dart
// In api_service.dart - Add this method:
Future<Transcription> createTranscriptionWithAudio({
  required String language,
  required double durationSeconds,
  required List<int> audioBytes,
}) async {
  final formData = FormData.fromMap({
    'text': '', // Server will transcribe
    'language': language,
    'duration_seconds': durationSeconds,
    'confidence_score': 0.0,
    'audio_file': MultipartFile.fromBytes(
      audioBytes,
      filename: 'recording_${DateTime.now().millisecondsSinceEpoch}.wav',
    ),
  });

  final response = await _dio.post(
    '${baseUrl}${Endpoints.dataTranscriptions}',
    data: formData,
  );

  return Transcription.fromJson(response.data);
}
```

---

## Environment Configuration

### .env.example
```
API_BASE_URL=http://localhost:8000
API_TIMEOUT=30
AUDIO_FORMAT=wav
AUDIO_SAMPLE_RATE=16000
AUDIO_CHANNELS=1
AUDIO_BITRATE=128000
```

### Load in main.dart
```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load();
  // ... rest of initialization
}
```

---

## Database Schema (Backend Reference)

### Transcription Table
```sql
CREATE TABLE transcription (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  language VARCHAR(5),
  duration_seconds FLOAT,
  confidence_score FLOAT,
  audio_file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

---

## Common Issues & Solutions

### Issue 1: "Microphone permission denied"
**Solution**: Add to AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Issue 2: "Audio file too large"
**Solution**: Compress before sending or stream in chunks
- Current: Full file at end
- Better: Stream chunks during recording

### Issue 3: "CORS error from backend"
**Solution**: Backend should have:
```python
# FastAPI CORS setup
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Performance Considerations

1. **Audio Quality vs File Size**
   - 16kHz mono (current) = ~2KB/sec = ~7MB for 1 hour
   - Acceptable for speech recognition

2. **Network Optimization**
   - Compress audio before sending
   - Consider chunked uploading for large files
   - Implement retry logic

3. **Battery Optimization**
   - Recording doesn't require screen on
   - Use WakeLock only when necessary
   - Stop recording when app backgrounded

---

## Testing Checklist

- [ ] User can register with valid email
- [ ] User can login with credentials
- [ ] Token persists after app restart
- [ ] User can record audio (5+ seconds)
- [ ] Audio stops when stop button pressed
- [ ] Transcription history displays correctly
- [ ] Language selection works
- [ ] Settings preferences persist
- [ ] Logout clears all data

---

## Related Files

- Backend API: `backend/app/main.py`
- Database: `init.sql`
- Docker Compose: `docker-compose.yml`
- Frontend Web: `auriance-frontend/`

---

Generated: 2024-12-14
Status: Ready for real-time audio streaming implementation
