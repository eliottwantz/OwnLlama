# OwnLlama

Welcome to your OwnLlama! To get started with your llama, check out the **Getting started** section.

## Getting started

### Prerequisites

You must have [Docker](https://www.docker.com/products/docker-desktop) installed.

1. Create the containers

```bash
docker run --rm -d --name rag-qdrant -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant

docker run -d -p 3000:3000 \
    --add-host=host.docker.internal:host-gateway \
    --name OwnLlama \
    --restart always \
    eliottwantz/ownllama:latest
```

2. Open your browser and navigate to http://localhost:3000

## Development

### Prerequisites

You must have [Bun](https://bun.sh/) installed.

1. Clone this repo

```bash
git clone https://github.com/eliottwantz/OwnLlama
```

2. Create the containers

```bash
docker run --rm -d --name rag-qdrant -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

3. Run the development server

```bash
bun run dev
```
