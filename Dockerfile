# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

FROM base AS build
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV OLLAMA_URL=http://host.docker.internal:11434
ENV QDRANT_URL=http://host.docker.internal:6333
RUN bun run build

RUN ls -lA

ENV OLLAMA_URL=http://host.docker.internal:11434
ENV QDRANT_URL=http://host.docker.internal:6333

RUN cd build && bun install

# run the app
USER bun
EXPOSE 3000/tcp

CMD sleep infinity

ENTRYPOINT [ "bun", "--bun", "run", ".build/index.js" ]