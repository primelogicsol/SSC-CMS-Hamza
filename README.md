## sufism-cms-hamza

Lightweight JSON-based CMS content store for Sufi Science Explorer and Digital Academy.

Structure:

- content/
  - prod/
    - explorer/
    - academy/
    - index/
- schemas/
  - contentItem.ts

Publishing flow (MVP):
- Backend reads JSON files directly from this folder. S3 integration can be added later.
- Frontend fetches from backend endpoints: `/v1/content/:section/:slug`.

Env:
- CONTENT_ENV=prod (default)
- CONTENT_BASE_PATH can override the absolute path to `content/` if needed.


# SSC-CMS-Hamza
