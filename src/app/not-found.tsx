import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
            <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 relative z-10">
                        <MessageSquare className="h-12 w-12 text-primary" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-24 bg-primary/20 rounded-3xl blur-2xl opacity-50 -z-0" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-7xl font-bold tracking-tighter text-primary">404</h1>
                    <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
                    <p className="text-muted-foreground text-lg">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 px-8 transition-all hover:scale-105">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="rounded-xl px-8 border-primary/20 hover:bg-primary/5 transition-all hover:scale-105">
                        <Link href="mailto:support@pulse.app">
                            Contact Support
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
