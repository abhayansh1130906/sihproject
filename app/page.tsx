"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { officialId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (officialId) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [officialId, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#002045]" />
      <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Directing to SkillIntel...
      </span>
    </div>
  );
}
