FROM node:24-alpine AS build
# bun installs and builds the registry; node runs `next build` itself.
COPY --from=oven/bun:1.4.5-alpine /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# The static export behind Caddy (Caddyfile: clean URLs, Markdown twins, CORS).
FROM caddy:2.10-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/out /srv
EXPOSE 3000
