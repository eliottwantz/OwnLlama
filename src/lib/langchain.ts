import { OLLAMA_URL, createOllamaLLM } from '$lib/ollama';
import {
	EMBEDDINGS_COLLECTION_NAME,
	QDRANT_URL,
	createQdrantRetriever,
	getPoint
} from '$lib/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { Document, type DocumentInput } from '@langchain/core/documents';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { QdrantVectorStore } from '@langchain/qdrant';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

export type DocumentMetadata = DocumentInput['metadata'] & {
	title: string;
	createdAt: string;
};

export const insertDocuments = async (
	documents: DocumentInput[],
	model: string = 'nomic-embed-text'
) => {
	await QdrantVectorStore.fromTexts(
		documents.map((d) => d.pageContent),
		documents.map((d) => ({ ...d.metadata, createdAt: new Date().toISOString() })),
		new OllamaEmbeddings({ model, baseUrl: OLLAMA_URL }),
		{
			url: QDRANT_URL,
			collectionName: EMBEDDINGS_COLLECTION_NAME
		}
	);
};

export const insertPDF = async (file: Blob, title: string) => {
	const loader = new PDFLoader(file, {
		splitPages: false
	});

	const docs = await loader.load();
	docs[0].metadata.title = title;

	await insertDocuments(docs);

	return docs;
};

export const promptLLM = async (prompt: string, model: string = 'llama3') => {
	const llm = createOllamaLLM(model);
	return await llm.invoke(prompt);
};

export const promptLLMWithKnowledgeBase = async (question: string, model: string = 'llama3') => {
	return await promptLLMWithKnowledge(question, undefined, model);
};

export const promptLLMWithDocument = async (
	question: string,
	docId: string,
	model: string = 'llama3'
) => {
	const document = await getPoint(docId).then((d) => d?.payload?.content as string | undefined);
	if (!document) {
		throw new Error('Document not found');
	}

	console.log('Document:\n', document);

	return await promptLLMWithKnowledge(question, document, model);
};

const promptLLMWithKnowledge = async (
	question: string,
	document?: string,
	model: string = 'llama3'
) => {
	const llm = createOllamaLLM(model);
	const prompt = ChatPromptTemplate.fromMessages([
		[
			'system',
			`Answer any use questions based solely on the context below:

<context>
{context}
</context>`
		],
		['human', '{input}']
	]);

	const documentChain = await createStuffDocumentsChain({
		llm,
		prompt
	});

	let response: string;
	if (document) {
		console.log('Have a document');
		response = await documentChain.invoke({
			input: question,
			context: [new Document({ pageContent: document })]
		});
	} else {
		const retriever = await createQdrantRetriever();

		const retrievalChain = await createRetrievalChain({
			combineDocsChain: documentChain,
			retriever
		});

		response = await retrievalChain
			.invoke({
				input: question
			})
			.then((r) => r.answer);
	}

	console.log('LLM response:\n', response);

	return response;
};

export const chatLLM = async (question: string, model: string = 'llama3') => {
	const llm = createOllamaLLM(model);

	const messages = [
		new SystemMessage('Please try to provide useful, helpful and actionable answers.'),
		new HumanMessage(question)
	];

	return llm.pipe(new HttpResponseOutputParser()).stream(messages);
};

export const chatLLMUsingDocument = async (
	question: string,
	documentId: string,
	model: string = 'llama3'
) => {
	const document = await getPoint(documentId).then(
		(d) => d?.payload as { content: string; metadata: DocumentMetadata }
	);
	if (!document) {
		throw new Error('Document not found');
	}

	console.log('Have a document');

	const llm = createOllamaLLM(model);
	const messages = [
		new SystemMessage(`Please try to provide useful, helpful and actionable answers. Answer the questions based solely on the context below:

		<context>
		${document.content}
		</context>`),
		new HumanMessage(question)
	];

	return llm.pipe(new HttpResponseOutputParser()).stream(messages);
};
