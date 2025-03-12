import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="flex flex-col gap-10">
        <h1 className="text-3xl font-medium">Settings</h1>
        <SettingsNav />
        {children}
      </div>
    </div>
  );
}
