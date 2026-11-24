# Writing with Strapi

## Applications

- The existing React/Vite portfolio stays at the repository root.
- `cms/` is a separate Strapi 5.63 application with its own dependencies and administrator panel.
- The local Docker setup uses the existing SQLite database and uploads. The separate VPS Compose setup uses PostgreSQL 17.
- Writing has real URLs: `/writing` and `/writing/<slug>`. Existing portfolio menus retain their hash URLs.
- The website reads only published content. No CMS administrator token is embedded in the frontend.

## Writing design

The public pages retain the portfolio's vintage monochrome identity: paper texture, charcoal ink, Archivo Black display text, Space Grotesk reading text, and the existing italic metadata style. Dated list rows suit an archive of essays; a narrower article column keeps longer writing readable. The title is the visual accent, and spacing separates the introduction, article list, and body. There are no new decorative animations. The design dials are ENERGY 2 / RHYTHM 2 / MOTION 1. The administrator panel uses Strapi's own interface.

## Local setup

The normal local CMS runs in Docker in production mode. Docker Engine and Docker Compose are required. Node.js 24 LTS (`.nvmrc`) runs the portfolio and setup helpers; Strapi dependencies and native SQLite bindings are installed inside the image.

```sh
npm ci
npm run cms:docker:setup -- --public-url https://cms001.asrhardi.xyz
npm run cms:up
```

The setup creates a private `cms/.env.docker`, retaining application secrets from `cms/.env`. If `.env` is missing, it first generates one. Later setup runs preserve the Docker environment; supplying `--public-url` explicitly updates that URL without regenerating keys. No data is copied into the image. The container binds `cms/.tmp/` and `cms/public/uploads/`, so the existing administrator account, articles, and images remain available after container recreation. These folders must be writable by container user 1000, which matches this machine's user.

Do not run `cms:dev`, `cms:start`, or a second container against this database at the same time. Before the initial switch, the existing database, uploads, and environment were backed up into the private, gitignored `cms/.backups/` directory.

Useful commands from the repository root:

```sh
npm run cms:status
npm run cms:logs
npm run cms:down
npm run cms:up
```

`cms:down` stops and removes the container; it preserves the database, images, and private environment on the host. `cms:up` rebuilds when source or public URL settings change. To change content types during development, stop Docker first and use `npm --prefix cms ci && npm run cms:dev`; stop the host process before starting Docker again.

## HTTPS tunnel

Configure the tunnel you manage with this route:

```text
Public hostname: cms001.asrhardi.xyz
Origin service:  http://127.0.0.1:1337
Admin panel:     https://cms001.asrhardi.xyz/admin
Public API:      https://cms001.asrhardi.xyz/api/writing
```

The tunnel agent currently runs on this host, so loopback reaches the container's published port. If you later containerize the tunnel agent, its `127.0.0.1` refers to that agent's container; use a shared Docker network and the CMS service name instead.

The tunnel must preserve the public host and forward `X-Forwarded-Proto: https`. `.env.docker` sets `PUBLIC_URL=https://cms001.asrhardi.xyz` and `TRUST_PROXY=true`. Only loopback port 1337 is published. Use the HTTPS address for administrator login: production authentication uses secure cookies, so the plain HTTP origin is intended for local API/health checks. No cookie security setting has been disabled.

The existing administrator signs in with the same account. For a fresh installation, register the first administrator through a private HTTPS route before opening access to others. The repository does not modify the running tunnel, its credentials, DNS, or Cloudflare policies.

In a second terminal:

```sh
npm run dev
```

Visit http://127.0.0.1:5174/writing. Vite proxies Writing requests and uploaded images to the local container over HTTP; administrator access uses the tunnel's HTTPS URL. If the CMS runs elsewhere, set `CMS_URL` in the root `.env.local` and restart Vite.

## Write and publish

1. Open **Content Manager > Article > Create new entry**.
2. Fill in **title**, **slug**, **excerpt**, and **body**. Use a lowercase slug with words separated by hyphens, such as `a-personal-note`.
3. Optionally add a **cover**, a display **date**, **seoTitle**, and **seoDescription**. Uploaded images must be JPG, PNG, WebP, GIF, or AVIF, up to 10 MB.
4. Save the draft. It stays unavailable through the public Writing endpoints.
5. Publish the entry. Refresh the local Writing page to see it.

The body supports paragraphs, headings, links, lists, quotes, code blocks, and images. HTML is displayed as text, and executable link schemes are rejected by the frontend renderer. Article body italics use the body font to preserve reading comfort.

Changes to an already-published article remain private until published again. Unpublishing removes it from the public API. Avoid changing a published slug unless you also arrange a redirect for the old URL.

The CMS Media Library serves uploaded files publicly, including images attached to drafts. Do not upload confidential files. Draft privacy applies to article content, not to private file storage.

## Website builds and Vercel

The production website is static. During `npm run build`, published articles are fetched from the CMS and rendered into their own HTML pages. The build creates:

- A Writing index and one HTML page per published article.
- JSON for client-side navigation and an embedded initial payload for direct visits.
- Local copies of CMS-uploaded article images. They remain available if the CMS is temporarily offline.
- Article-specific titles, descriptions, canonical URLs, and BlogPosting data.
- A sitemap containing the homepage, Writing index, and published article URLs.

Set `CMS_URL=https://cms001.asrhardi.xyz` in the **Vercel project's build environment** once the tunnel is reachable. The value is used by the build process, not as a browser credential. If the CMS advertises a different public media origin than the build URL, also set `CMS_PUBLIC_URL`.

```sh
CMS_URL=http://127.0.0.1:1337 npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

An unset `CMS_URL` deliberately builds an empty Writing index. A configured but unreachable CMS fails the build rather than silently publishing an empty collection. Vercel keeps the previous successful deployment when a new build fails. No Strapi server runs inside Vercel's static frontend deployment.

`vercel.json` enables clean URLs. Generated article files are served directly; do not add a catch-all rewrite that replaces them with the homepage. Missing articles use the generated `404.html` and a noindex state.

Publishing in Strapi updates the API immediately, but the deployed static site changes only after another successful website build. For automatic publication:

1. Create a **Deploy Hook** in the Vercel project for the production branch.
2. In Strapi **Settings > Webhooks**, add that private hook URL.
3. Enable **entry.publish**, **entry.unpublish**, and **entry.delete**. A publish event also covers a newly-published revision.
4. Keep the hook URL private. Avoid editing or deleting media that existing published articles still use; republish and rebuild after media changes.

Neither a Vercel account, an external server, DNS, nor a Deploy Hook is provisioned by this repository.

While the CMS runs on your computer, the computer, Docker, and tunnel must be online during a Vercel build. A sleeping or offline computer prevents new publication builds; existing static portfolio pages keep working. Any tunnel access policy must allow the build infrastructure to reach the published API and its images.

## Self-host with Docker

The local commands above already run Strapi in Docker. You can move that same SQLite setup to a VPS by stopping the local CMS, transferring `.tmp/`, `public/uploads/`, and the private `.env.docker` securely, restoring their ownership for UID 1000, then running `npm run cms:up` on the VPS with the same code. Preserve all application secrets. Update the public URL and tunnel/proxy origin as needed. Keep one active writer for the SQLite database; the local instance must stay stopped during the move.

For a **fresh PostgreSQL deployment**, run these commands from `cms/`:

```sh
npm run setup -- --production
```

This creates a private `.env.production` with separate generated secrets and database credentials. Set `PUBLIC_URL` in that file to the final HTTPS CMS address before building the image. Keep the keys stable across redeployments; changing encryption keys can make stored secrets unreadable.

```sh
docker compose --env-file .env.production up --build -d
docker compose --env-file .env.production logs -f cms
```

The CMS listens on the server's loopback port 1337. Put an HTTPS reverse proxy in front of it and forward the original host/protocol headers. `TRUST_PROXY=true` in the production environment assumes that the loopback-bound service is reached through that trusted proxy. PostgreSQL has no published host port. The named `database` and `uploads` volumes persist across container recreation.

This PostgreSQL Compose file uses a separate database and separate uploads volume. Switching Compose files does not migrate the SQLite database, administrator accounts, images, or encryption secrets. Plan and verify a data migration before replacing an existing installation with it.

Register the administrator before exposing the CMS publicly. Restrict dashboard access to the intended administrator and configure an SMTP email provider if you need password-reset emails. Set `CMS_URL` in Vercel only after the published API is reachable from its build infrastructure.

If you change `PUBLIC_URL`, rebuild the CMS image because the admin frontend also uses the configured address. The Compose service can use a different loopback host port through `CMS_PORT`.

### Backups and upgrades

Back up the PostgreSQL database, the uploads volume, and the private environment file. A database backup alone does not include image files. For the local Docker/SQLite setup, run `npm run cms:down` before copying `.tmp/`, and also preserve `public/uploads`, `.env`, and `.env.docker`. Restart with `npm run cms:up` afterward.

Before upgrades, take a backup and test it on a separate database. Strapi dependencies are pinned in `cms/package-lock.json`. Normal `docker compose down` preserves named volumes; `down --volumes` deletes them and must not be used for ordinary redeployments.

## Deploy the CMS to Vercel with Neon and Blob

The frontend and CMS are two Vercel projects. The frontend retains repository root `.` and its existing build command. The CMS uses Root Directory `cms`, the **Container** preset, and its own `cms/vercel.json`. Keep the CMS Build/Output overrides at their container defaults; do not use the frontend's `dist` output directory here.

The CMS image starts an HTTP server on port 1337, matching the project configuration. `CMS_DEPLOYMENT_TARGET=vercel` enables startup validation, PostgreSQL defaults with TLS verification, an idle-free pool (minimum 0, maximum 5), trusted HTTPS proxy headers, and the Blob provider. Missing configuration fails with variable names and guidance, without printing secret values. SQLite and local uploads are rejected in this deployment mode. The same source continues to support local Docker/SQLite and VPS/PostgreSQL.

### 1. Generate private CMS configuration

From the repository root:

```sh
npm --prefix cms ci
npm run cms:vercel:setup -- --public-url https://cms-eight-puce-83.vercel.app
```

This creates `cms/.env.vercel` with mode 600. It is gitignored and excluded from Docker build context. The example `cms/.env.vercel.example` is safe to commit. The generated environment has separate random Strapi secrets; rerunning setup preserves the file and keys. Keep a private backup. This is a new deployment configuration, not an automatic migration of the local administrator account or encrypted database contents.

### 2. Connect a dedicated Neon database

Create a Neon PostgreSQL resource through Vercel Marketplace and connect it to the **CMS project, Production environment**. Use a new dedicated database for this Strapi application, not a database with another application's tables. Set `DATABASE_URL` to its PostgreSQL connection string. Prefer a pooled connection with a valid TLS configuration; keep certificate verification enabled. The application uses the regular `pg` driver, not Neon's HTTP driver.

The file contains these defaults:

```text
DATABASE_CLIENT=postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
DATABASE_POOL_MIN=0
DATABASE_POOL_MAX=5
```

Copy the integration's actual connection string into the private file if you want to check it locally. Do not overwrite an automatically-injected connection string with the empty example value.

### 3. Connect a public Vercel Blob store

Create a **public** Blob store and connect it to the **CMS project's Production environment**. The integration supplies `BLOB_STORE_ID`; Vercel supplies and rotates `VERCEL_OIDC_TOKEN`. The provider lets `@vercel/blob` read these automatically, including token refresh. Do not manually copy an OIDC token into the environment file or pass it as a static SDK credential.

When running outside Vercel, an optional `BLOB_READ_WRITE_TOKEN` can authenticate instead. Keep it server-side. `UPLOAD_PROVIDER=vercel-blob` selects the included provider, and `BLOB_PATH_PREFIX=strapi/production` places CMS images in a dedicated prefix. Thumbnails and optimized formats use the same provider. Blob object names have random suffixes; replacing a media file uploads the new object before deleting the previous object. Credentials are never stored in Media Library metadata or public Writing responses.

All media in this store is public, including files attached to draft articles. Vercel mode limits each image and the total multipart file content per request to **4 MiB**, leaving space for multipart overhead under the default Function payload cap. Upload small batches or one image at a time. The local Docker setup retains its 10 MiB image limit. Larger upload flows would require a separate direct-upload implementation.

### 4. Configure the CMS project and deploy

In the CMS project's Production environment, add the generated secret values from `cms/.env.vercel`:

```text
APP_KEYS
ADMIN_JWT_SECRET
API_TOKEN_SALT
TRANSFER_TOKEN_SALT
ENCRYPTION_KEY
```

Also add `PUBLIC_URL=https://cms-eight-puce-83.vercel.app`, `DATABASE_URL`, `DATABASE_CLIENT=postgres`, `UPLOAD_PROVIDER=vercel-blob`, and `TRUST_PROXY=true`, plus the Blob connection. Import only filled values from the private environment file. `cms/vercel.json` supplies the deployment target and `PORT=1337` automatically.

After filling the private file with the database URL and Blob store id, run:

```sh
npm run cms:vercel:check
```

This checks values and requirements without opening a database connection or uploading anything. It accepts a store id without an OIDC token because Vercel injects that token at runtime. The actual startup check requires both, or a read-write token. Missing resources must be filled before this check can pass.

Commit/push the source changes, then deploy the CMS project. No database, store, credentials, Vercel settings, or production deployments are created by the setup command. On a fresh database, complete first-administrator registration through a private/protected HTTPS deployment before opening public access. Use the same secrets across future deployments.

Use separate databases and Blob stores/prefixes for Preview and Production; do not point automatic Preview deployments at the production database. Configure each environment explicitly. A preview URL alone does not isolate its data.

### 5. Verify before switching the portfolio

1. Check CMS runtime logs for a successful startup and open `/admin` over HTTPS.
2. Register or sign in, upload a small image, and publish a test article. Confirm the image URL points to the public Blob domain.
3. Confirm `/api/writing` and `/api/writing/<slug>` return only published content.
4. Redeploy the CMS and let a container instance stop/start. Confirm administrator access, article data, and images persist. Test a cold request after the service has been idle.
5. Build the frontend with `CMS_URL=https://cms-eight-puce-83.vercel.app` and inspect the actual article page and image. Set that value on the **portfolio project's** Production environment only after the new CMS is verified.
6. Recreate the portfolio Deploy Hook webhook on the new CMS, selecting Article Publish, Unpublish, and Delete. Verify deployment reaches Ready and publication/unpublication changes the site.

The existing local database, administrator, images, and webhook configuration are not automatically copied into Neon/Blob. Take a backup and use Strapi's supported export/import or transfer workflow on a separate target, checking its overwrite prompts and supported data types. Administrator accounts and API credentials need separate setup; verify content counts, draft/published states, media URLs, links, secrets, and webhooks before switching. Keep the local instance as the source until the target has been verified. Repository data is never used as a database migration.

Vercel Container Runtime can scale idle instances down. Strapi has startup work and schema checks, so a successful Docker build alone does not verify cold-start behavior, simultaneous instances, database pooling, or cloud media access. These checks must run with the actual Neon and Blob resources before replacing the local CMS. Source adaptation and local tests do not certify production cloud operation.

Local verification for this adaptation included the container build, startup on a read-only application filesystem with temporary `/tmp`, a PostgreSQL TLS connection with certificate verification, secure administrator cookies behind forwarded HTTPS, and administrator persistence after a container restart. The integration suite also exercised PostgreSQL article publication/unpublication, image metadata, and restart persistence with an in-memory substitute for Blob calls. Real Neon connectivity, Blob authentication/upload, and an actual Vercel cold start remain unverified until those resources are connected.

References: [Vercel Container Runtime](https://vercel.com/docs/functions/runtimes/container), [Vercel Blob SDK and OIDC](https://vercel.com/docs/vercel-blob/using-blob-sdk), [Vercel Function payload limits](https://vercel.com/docs/functions/limitations), [Strapi media providers](https://docs.strapi.io/cms/configurations/media-library-providers), and [Strapi data management](https://docs.strapi.io/cms/features/data-management).

## Checks

From the repository root:

```sh
npm test
npm run cms:test
npm run lint
npm run test:cms
npm run cms:build
CMS_URL=http://127.0.0.1:1337 npm run build
```

`test:cms` boots Strapi with a temporary, isolated SQLite database. It verifies an administrator's Article editor and upload access, published-only reads, draft/revision isolation, blocked anonymous writes, unpublishing, and a real static website build with images. Temporary records, credentials, and uploaded test files are removed afterward. The generated `dist/` contains a clearly-labelled integration fixture until the next normal build; always run a normal build before deploying.

The supplied Docker image was built and started locally with PostgreSQL. Its published-content endpoint returned HTTP 200, and both a database marker and an upload marker survived container recreation in an isolated test project. The test containers and volumes were then removed.

Production verification should include opening an article URL directly, refreshing it, following links from Writing, checking a missing slug returns HTTP 404, and inspecting the generated HTML and sitemap. HTTPS reverse-proxy behavior and the deployment environment still need to be checked on the actual host before public launch.

### Dependency audit

On 24 November 2026, `npm audit --omit=dev` in `cms/` flagged 28 packages: 22 high and 6 moderate. These package counts include transitive effects from shared dependencies, rather than 28 independently verified vulnerabilities. Reported dependency chains include Zod, React Router, glob/minimatch, and `@hono/node-server`.

Review these upstream advisories and compatible fixes before exposing the CMS publicly. The audit's proposed Strapi 4 downgrade and React Router 7 upgrade are incompatible with this Strapi 5 setup; do not apply `npm audit fix --force`. Functional checks do not constitute a security audit. The CMS is currently available only on local loopback addresses.
