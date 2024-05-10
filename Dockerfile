FROM oven/bun:1 as base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
ENV OLLAMA_URL=http://host.docker.internal:11434
ENV QDRANT_URL=http://host.docker.internal:6333
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build .

ENV OLLAMA_URL=http://host.docker.internal:11434
ENV QDRANT_URL=http://host.docker.internal:6333

RUN bun install

USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "bun", "--bun", "run", "./index.js" ]