# MiniMax Video Generation V2

## Endpoints

- Create: `POST https://api.minimaxi.com/v2/video_generation`
- Query: `GET https://api.minimaxi.com/v2/query/video_generation/{task_id}`
- Authentication: `Authorization: Bearer $MINIMAX_API_KEY`

## Content roles

- Text: `{ "type": "text", "text": "..." }`
- Image: `{ "type": "image_url", "image_url": { "url": "..." }, "role": "first_frame|last_frame|reference_image" }`
- Video: `{ "type": "video_url", "video_url": { "url": "..." }, "role": "reference_video" }`
- Audio: `{ "type": "audio_url", "audio_url": { "url": "..." }, "role": "reference_audio" }`

Every request needs non-empty text. Frame inputs and reference inputs are mutually exclusive. Reference audio requires at least one reference image or video.

## Limits

- Duration: integer 4-15 seconds
- Ratios: `adaptive`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`
- Text-only generation requires a concrete ratio
- Frame generation always uses `adaptive`
- Up to one first frame, one last frame, nine reference images, three reference videos, and three reference audios
- Request body: at most 64 MB
- Image: at most 30 MB; video: at most 50 MB; audio: at most 15 MB
- Check current official documentation before relying on model or resolution availability because these can change.

## Terminal statuses

- Success: `succeeded`
- Failure: `failed`, `cancelled`, `expired`
- In progress: `queued`, `running`
