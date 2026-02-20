import { BuilderNetwork } from "@/components/BuilderNetwork";

export default function BuilderPage() {
  return (
    <div className="overflow-y-auto h-full pb-20">
      <div className="p-4 max-w-2xl">
        <BuilderNetwork />
      </div>
    </div>
  );
}
