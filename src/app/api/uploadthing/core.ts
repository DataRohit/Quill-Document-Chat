import fetch from 'node-fetch';
import { createUploadthing, FileRouter } from 'uploadthing/next';

import { PLANS } from '@/config/stripe';
import { db } from '@/db';
import { pinecone } from '@/lib/pinecone';
import { getUserSubscriptionPlan } from '@/lib/strip';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

const f = createUploadthing();

const middleware = async () => {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	const subscriptionPlan = await getUserSubscriptionPlan();

	if (!user || !user.id) throw new Error("Unauthorized");

	return { subscriptionPlan, userId: user.id };
};

const onUploadComplete = async ({
	metadata,
	file,
}: {
	metadata: Awaited<ReturnType<typeof middleware>>;
	file: { key: string; name: string; url: string };
}) => {
	const isFileExist = await db.file.findFirst({
		where: {
			key: file.key,
		},
	});

	if (isFileExist) return;

	const createdFile = await db.file.create({
		data: {
			key: file.key,
			name: file.name,
			userId: metadata.userId,
			url: file.url,
			uploadStatus: "PROCESSING",
		},
	});

	try {
		const response = await fetch(createdFile.url);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer], {
			type: "application/pdf",
		});

		const loader = new PDFLoader(blob);
		const pageLevelDocs = await loader.load();

		const pagesCount = pageLevelDocs.length;

		const { subscriptionPlan } = metadata;
		const { isSubscribed } = subscriptionPlan;

		const isProExceeded =
			pagesCount > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
		const isFreeExceeded =
			pagesCount >
			PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

		if (
			(isProExceeded && !isSubscribed) ||
			(!isSubscribed && isFreeExceeded)
		) {
			await db.file.update({
				data: {
					uploadStatus: "FAILED",
				},
				where: {
					id: createdFile.id,
				},
			});
		}

		const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

		const embeddings = new OpenAIEmbeddings({
			apiKey: "lm-studio",
			configuration: {
				baseURL: process.env.LM_STUDIO_SERVER,
			},
		});

		await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
			pineconeIndex,
			namespace: createdFile.id,
		});

		await db.file.update({
			where: { id: createdFile.id },
			data: {
				uploadStatus: "SUCCESS",
			},
		});
	} catch (err) {
		console.error(err);

		await db.file.update({
			where: { id: createdFile.id },
			data: {
				uploadStatus: "FAILED",
			},
		});
	}
};

export const ourFileRouter = {
	freePlanUploader: f({ pdf: { maxFileSize: "8MB" } })
		.middleware(middleware)
		.onUploadComplete(onUploadComplete),
	proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
		.middleware(middleware)
		.onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
