# API Documentation

## Generate Summary

POST /api/summarize

### Request

```json
{
  "url": "https://youtube.com/watch?v=example"
}
```

### Response

```json
{
  "summary": "Video summary here",
  "key_points": [
    "Point 1",
    "Point 2"
  ]
}
```

---

## Extract Transcript

POST /api/transcript

### Response

```json
{
  "transcript": "Transcript text"
}
```
