import { NuqsAdapter } from "nuqs/adapters/next/app";

export const NuqsAdapterProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <NuqsAdapter>{children}</NuqsAdapter>;
};
