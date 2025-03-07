import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapterProvider } from "./nuqs-adapter";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<NuqsAdapterProvider>
				{children}
				<Toaster richColors />
				<Analytics mode="production" />
			</NuqsAdapterProvider>
		</ThemeProvider>
	);
}
