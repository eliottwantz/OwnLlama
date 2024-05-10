import { t } from 'elysia';

export const DocumentSchema = t.Object({
	pageContent: t.String(),
	metadata: t.Optional(t.Record(t.String(), t.Any()))
});

export type DocumentWithEmbedding = Document & {
	id: string;
	embedding: number[];
};
