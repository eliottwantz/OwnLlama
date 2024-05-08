import { type Static, t } from "elysia";

export const DocumentSchema = t.Object({
  content: t.String(),
  metadata: t.Optional(t.Record(t.String(), t.Any())),
});
export type Document = Static<typeof DocumentSchema>;

export type DocumentWithEmbedding = Document & {
  embedding: number[];
};
