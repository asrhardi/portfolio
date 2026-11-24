FROM node:24-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/app
RUN chown node:node /opt/app
USER node
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node providers ./providers
RUN npm ci --no-audit --no-fund
RUN npm rebuild better-sqlite3 esbuild @swc/core
COPY --chown=node:node . .
ARG PUBLIC_URL=http://127.0.0.1:1337
ENV PUBLIC_URL=$PUBLIC_URL STRAPI_TELEMETRY_DISABLED=true
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:24-bookworm-slim AS production
WORKDIR /opt/app
RUN mkdir -p /opt/app/.tmp && chown node:node /opt/app /opt/app/.tmp
COPY --from=builder --chown=node:node /opt/app /opt/app
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=1337 STRAPI_TELEMETRY_DISABLED=true
EXPOSE 1337
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||1337)+'/api/writing').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "scripts/start.cjs"]
