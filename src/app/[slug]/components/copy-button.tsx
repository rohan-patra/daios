"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function CopyButton({ text }: { text: string }) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: "Token address has been copied to your clipboard.",
    });
  };

  return (
    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
      <Copy className="h-4 w-4" />
    </Button>
  );
}
