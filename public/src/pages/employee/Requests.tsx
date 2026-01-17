import { RequestClaimWidget } from "@/components/employee/RequestClaimWidget";

export default function Requests() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Claims & Requests</h1>
        <p className="text-muted-foreground">
          Submit a claim, request an approval, or ask a question — with clear tracking and updates.
        </p>
      </div>

      <RequestClaimWidget />
    </div>
  );
}
