# Picnik Ecopark

Django REST backend + vanilla JS frontend for a cottage/cabin booking platform.

## Prerequisites

- Python 3.11+ (repo tested with 3.13)
- PostgreSQL running locally, reachable with the credentials in
  `backend/config/settings/base.py` (`DATABASES`):
  - DB name: `piknik_ecopark`
  - User: `piknik_user`
  - Password: `12345`
  - Host/port: `localhost:5432`

  A `backend/config/docker-compose.yml` is provided, but it maps the
  container to host port **5433**, not 5432 — either edit that file to
  publish `5432:5432`, or point `DATABASES.PORT` in `base.py` at `5433`
  before using it. Otherwise use a native Postgres install on 5432.

## Backend

```bash
cd backend

# create the virtualenv (skip if backend/venv already exists)
python3 -m venv venv

./venv/bin/pip install -r requirements.txt

./venv/bin/python manage.py migrate
./venv/bin/python manage.py runserver 127.0.0.1:8000
```

The API is served at `http://127.0.0.1:8000/api`, and the site itself at
`http://127.0.0.1:8000/`.

Email/contact settings are read from a `.env` file in the project root
(`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `CONTACT_EMAIL`) — create one if
it doesn't exist.

## Frontend

No separate step needed — Django serves the frontend directly, there is no
build step and no second process to run. `frontend/index.html` is loaded as
a Django template (it uses `{% now 'U' %}` for cache-busting on every CSS/JS
URL) and, while `DEBUG=True`, Django also serves the JS/CSS/asset files from
`frontend/` itself via `STATICFILES_DIRS`.

Once the backend is running (see above), just open `http://127.0.0.1:8000/`
in a browser — the SPA's own hash-based router (`frontend/js/router.js`)
takes over from there.

**Do not** try to serve the `frontend/` folder with a separate static file
server (e.g. `python3 -m http.server`) — the `{% now 'U' %}` template tag is
only evaluated by Django, so outside of it every CSS/JS `<link>`/`<script>`
URL ends up broken and the page fails to load properly.

## Ports

| Service              | URL                          |
|----------------------|-------------------------------|
| Backend + frontend   | http://127.0.0.1:8000        |
| PostgreSQL           | localhost:5432                |

## Troubleshooting

- Backend can't connect to the database — check the docker-compose port
  mismatch noted above, or that a local Postgres instance is running with
  the matching db/user/password.
- Page loads but CSS/JS look broken or fail to load — make sure you're
  opening `http://127.0.0.1:8000/` (served by Django), not opening
  `frontend/index.html` directly or through a separate static file server.
