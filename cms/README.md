# Portfolio CMS

Self-hosted Strapi 5 for the portfolio's Writing section. Content is managed in the Article collection with draft/publish, rich text, images, and optional SEO fields.

From the repository root:

```sh
npm ci
npm run cms:docker:setup -- --public-url https://cms001.asrhardi.xyz
npm run cms:up
```

Point the HTTPS tunnel for `cms001.asrhardi.xyz` to `http://127.0.0.1:1337`, then open https://cms001.asrhardi.xyz/admin. Existing administrator accounts, articles, and uploads remain available. A fresh installation needs its first administrator. Run `npm run dev` in another terminal to open the portfolio at http://127.0.0.1:5174/writing.

`cms:up` builds and starts the production Strapi container with `compose.local.yaml`. It reuses the existing SQLite database in `.tmp/` and images in `public/uploads/` through bind mounts. The private `.env.docker` copies existing application secrets from `.env` on first setup. An explicit `--public-url` updates only that URL on later runs. Use `cms:status`, `cms:logs`, and `cms:down` to manage it. Do not run a host Strapi process against the same database at the same time.

The separate `compose.yaml` provides PostgreSQL for a fresh VPS deployment. It does not automatically migrate local SQLite data or administrator accounts.

The only anonymous content endpoints are `GET /api/writing` and `GET /api/writing/:slug`. They always return published articles, ignoring client-supplied publication filters. Article writes and media uploads require the administrator interface.

See [the Writing operations guide](../docs/WRITING_CMS.md) for publishing, Vercel builds, Docker hosting, backups, and tests.

## Vercel Container deployment

Import a separate Vercel project with Root Directory `cms` and the Container preset. `cms/vercel.json` selects the container and port 1337; the Docker image starts with a configuration check. Vercel uses PostgreSQL and the included Blob upload provider instead of local files.

```sh
npm run cms:vercel:setup -- --public-url https://cms-eight-puce-83.vercel.app
npm run cms:vercel:check
```

Setup creates private `cms/.env.vercel` with generated application secrets. Create a dedicated Neon database and a public Vercel Blob store, connect them to the CMS project's Production environment, then fill/import the remaining settings from that file. Blob uses Vercel-managed OIDC with `BLOB_STORE_ID`; an optional `BLOB_READ_WRITE_TOKEN` supports running outside Vercel. Never commit `.env.vercel` or copy credentials into the frontend project.

Article images are public. Upload at most 4 MiB in total per request in Vercel mode. Existing local articles, administrators, uploaded images, and webhooks are not migrated automatically. Keep the current CMS running until the new instance has been tested with its real database and Blob store. The full operations guide covers setup, migration, and verification.
