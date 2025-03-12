import {
  DeleteAccountCard,
  UpdateAvatarCard,
  ProvidersCard,
  SessionsCard,
} from "@daveyplate/better-auth-ui";

export function CustomSettings() {
  return (
    <div className="flex flex-col gap-6">
      <UpdateAvatarCard
        classNames={{
          avatar: {
            base: "size-20",
            fallback: "size-20",
          },
        }}
      />
      <ProvidersCard />
      <SessionsCard />
      <DeleteAccountCard />
    </div>
  );
}
