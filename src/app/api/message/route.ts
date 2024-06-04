import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
	const body = await req.json();

	const { getUser } = getKindeServerSession();
	const user = await getUser();

	const { id: userId } = user!;

	if (!userId) return new Response("Unauthorized", { status: 401 });

	const { fileId, message } = SendMessageValidator.parse(body);

	const file = await db.file.findFirst({
		where: {
			id: fileId,
			userId,
		},
	});

	if (!file) return new Response("Not Found", { status: 404 });

	await db.message.create({
		data: {
			text: message,
			isUserMessage: true,
			userId,
			fileId,
		},
	});

	const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

	const embeddings = new OpenAIEmbeddings({
		apiKey: "lm-studio",
		configuration: {
			baseURL: process.env.LM_STUDIO_SERVER,
		},
	});

	const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
		pineconeIndex,
		namespace: file.id,
	});

	const results = await vectorStore.similaritySearch(message, 4);

	const prevMessages = await db.message.findMany({
		where: {
			fileId,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 6,
	});

	const formattedPreviousMessages = prevMessages.map((message) => ({
		role: message.isUserMessage
			? ("user" as const)
			: ("assistant" as const),

		content: message.text,
	}));

	const response = await openai.chat.completions.create({
		model: "LM Studio Community/Meta-Llama-3-8B-Instruct-GGUF",
		temperature: 0,
		stream: true,
		messages: [
			{
				role: "system",
				content:
					"Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
			},
			{
				role: "user",
				content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
			
	\n----------------\n
	
	PREVIOUS CONVERSATION:
	${formattedPreviousMessages.map((message) => {
		if (message.role === "user") return `User: ${message.content}\n`;
		return `Assistant: ${message.content}\n`;
	})}
	
	\n----------------\n
	
	CONTEXT:
	${results.map((r) => r.pageContent).join("\n\n")}
	
	USER INPUT: ${message}`,
			},
		],
	});

	const stream = OpenAIStream(response, {
		async onCompletion(completion) {
			await db.message.create({
				data: {
					text: completion,
					isUserMessage: false,
					userId,
					fileId,
				},
			});
		},
	});

	return new StreamingTextResponse(stream);
};
