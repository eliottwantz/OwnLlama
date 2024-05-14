export type ChatMessage = {
	question: string;
	answer: string;
	model: string;
	timestamp: Date;
};

class ChatStore {
	messages = $state<ChatMessage[]>([
		{
			question: 'Why is the sky blue?',
			answer: `_Lorem_ ipsum dolor sit amet consectetur adipisicing elit. Velit labore voluptatem adipisci, nesciunt consectetur dolor? Aperiam consectetur tempore perspiciatis temporibus quisquam quod, impedit veniam laboriosam explicabo dolor quae ut accusantium.
			**Obcaecati** delectus earum, minima, ducimus ea assumenda sit laboriosam quia exercitationem quasi incidunt. Officiis explicabo, sapiente ea, cupiditate odio consequatur eum, dolorem saepe iure quisquam itaque voluptates ab enim laudantium.
			1. Lorem ipsum dolor sit amet consectetur adipisicing elit.
			2. Lorem ipsum dolor sit amet consectetur adipisicing elit.
			Error qui doloremque cum ut delectus assumenda ea pariatur illo, ipsam excepturi beatae fuga recusandae laborum voluptas veniam aspernatur dignissimos quibusdam. Similique, maxime? Error libero illo est nesciunt iusto dolores?
			- Lorem ipsum dolor sit amet consectetur adipisicing elit.
			- Lorem ipsum dolor sit amet consectetur adipisicing elit.
			`,
			model: 'llama3:latest',
			timestamp: new Date()
		},
		{
			question: 'What is electricity?',
			answer: `_Lorem_ ipsum dolor sit amet consectetur adipisicing elit. Velit labore voluptatem adipisci, nesciunt consectetur dolor? Aperiam consectetur tempore perspiciatis temporibus quisquam quod, impedit veniam laboriosam explicabo dolor quae ut accusantium.
			**Obcaecati** delectus earum, minima, ducimus ea assumenda sit laboriosam quia exercitationem quasi incidunt. Officiis explicabo, sapiente ea, cupiditate odio consequatur eum, dolorem saepe iure quisquam itaque voluptates ab enim laudantium.
			1. Lorem ipsum dolor sit amet consectetur adipisicing elit.
			2. Lorem ipsum dolor sit amet consectetur adipisicing elit.
			Error qui doloremque cum ut delectus assumenda ea pariatur illo, ipsam excepturi beatae fuga recusandae laborum voluptas veniam aspernatur dignissimos quibusdam. Similique, maxime? Error libero illo est nesciunt iusto dolores?
			- Lorem ipsum dolor sit amet consectetur adipisicing elit.
			- Lorem ipsum dolor sit amet consectetur adipisicing elit.
			`,
			model: 'llama3:latest',
			timestamp: new Date()
		}
	]);

	latestChat = $derived(this.messages.at(-1));

	constructor() {}

	addQuestion(question: string, model: string = 'llama3:latest') {
		this.messages.push({ question, answer: '', model, timestamp: new Date() });
	}
}

export const useChatHistory = () => new ChatStore();
