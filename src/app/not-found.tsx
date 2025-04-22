import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center gap-6 max-w-2xl text-center">
        <div className="rounded-full bg-purple-100 p-3">
          <Construction className="w-6 h-6 text-purple-600" />
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight">
          Coming Soon
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg">
            Hold on tight, we're working on it!

        </p>
        <Link href="/">
          <Button className="gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 