import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Add error handling wrapper
const handler = toNextJsHandler(auth);

export const POST = async (...args: Parameters<typeof handler.POST>) => {
	try {
		return await handler.POST(...args);
	} catch (error) {
		console.error("[Auth Handler Error]:", {
			error,
			stack: error instanceof Error ? error.stack : undefined,
			type: typeof error,
			value: error instanceof Error ? undefined : error,
		});
		return new Response("Internal Server Error", { status: 500 });
	}
};

export const GET = async (...args: Parameters<typeof handler.GET>) => {
	try {
		return await handler.GET(...args);
	} catch (error) {
		console.error("[Auth Handler Error]:", {
			error,
			stack: error instanceof Error ? error.stack : undefined,
			type: typeof error,
			value: error instanceof Error ? undefined : error,
		});
		return new Response("Internal Server Error", { status: 500 });
	}
};
