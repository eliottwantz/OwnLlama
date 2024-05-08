import { Elysia, t } from "elysia";
import { ensureCollection, qdrant } from "./src/qdrant";
import { COLLECTION_NAME, insertDocuments } from "./src/rag";
import { DocumentSchema } from "./src/document";

await ensureCollection(COLLECTION_NAME);

const app = new Elysia()
  .get("/", () => "rad-qdrant 🔥😁👍")
  .get("/documents", async () => {
    const documents = await qdrant.getCollection(COLLECTION_NAME);
    return documents;
  })
  .post(
    "/documents",
    async ({ set, body }) => {
      const res = await insertDocuments(body.documents);
      if (!res) {
        console.log("Failed to insert documents");
        set.status = 500;
        return;
      }

      console.log("Inserted documents:\n", res);
      set.status = 201;
    },
    {
      body: t.Object({
        documents: t.Array(DocumentSchema),
      }),
    }
  )
  .listen(8080);

console.log(`Listening on ${app.server!.url}`);
