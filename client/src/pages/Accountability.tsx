import { AccountabilityMode } from "@/components/AccountabilityMode";

export default function AccountabilityPage() {
  return (
    <div className="overflow-y-auto h-full pb-20">
      <div className="p-4 max-w-2xl">
        <AccountabilityMode />
      </div>
    </div>
  );
}
