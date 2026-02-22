"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { FileText, Download, Play, Music, Trash2, Loader2, X, Maximize2 } from "lucide-react";
import { ImageLightbox } from "./image-lightbox";

interface MarkdownRendererProps {
    content?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video" | "pdf" | "audio";
    isMe: boolean;
    isDeleted?: boolean;
    fileName?: string;
    isUploading?: boolean;
    transcript?: string;
}

export const MarkdownRenderer = ({ content, mediaUrl, mediaType, isMe, isDeleted, fileName, isUploading, transcript }: MarkdownRendererProps) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    if (isDeleted) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground italic py-1">
                <Trash2 className="h-3 w-3" />
                <span className="text-xs">This message was deleted</span>
            </div>
        );
    }

    const renderMedia = () => {
        if (!mediaUrl && !isUploading) return null;

        const loadingOverlay = (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl animate-in fade-in duration-300">
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Uploading</span>
            </div>
        );

        switch (mediaType) {
            case "image":
                return (
                    <div className="relative group/media overflow-hidden rounded-2xl bg-muted/20 border shadow-sm w-fit max-w-full">
                        {isUploading && loadingOverlay}
                        <img
                            src={mediaUrl || "/placeholder.png"}
                            alt={fileName || "Attached image"}
                            onClick={() => !isUploading && setIsPreviewOpen(true)}
                            className={cn(
                                "max-w-full max-h-[350px] md:max-h-[450px] cursor-pointer object-cover rounded-2xl transition-all duration-500",
                                !isUploading && "group-hover/media:scale-[1.02]",
                                isUploading && "opacity-50 blur-sm"
                            )}
                        />
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity flex flex-col justify-end p-3 md:p-4",
                            "opacity-100 md:opacity-0 md:group-hover/media:opacity-100"
                        )}>
                            <div className="flex items-center justify-between gap-2 pointer-events-auto">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-white text-[11px] font-bold truncate mb-0.5">
                                        {fileName || "Image"}
                                    </span>
                                    <span className="text-white/70 text-[9px] uppercase tracking-wider font-medium">
                                        {mediaType}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <a
                                        href={mediaUrl || "#"}
                                        download={fileName || "image"}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 bg-white/20 hover:bg-white/30 active:scale-90 rounded-full backdrop-blur-md transition-all border border-white/20"
                                    >
                                        <Download className="h-3.5 w-3.5 text-white" />
                                    </a>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
                                        className="p-2 bg-white/20 hover:bg-white/30 active:scale-90 rounded-full backdrop-blur-md transition-all border border-white/20"
                                    >
                                        <Maximize2 className="h-3.5 w-3.5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "video":
                return (
                    <div className="relative w-fit max-w-full rounded-2xl overflow-hidden border bg-secondary/20 shadow-sm group/video">
                        {isUploading && loadingOverlay}
                        <video
                            controls={!isUploading}
                            src={mediaUrl}
                            className={cn(
                                "max-w-full max-h-[350px] md:max-h-[450px] block rounded-2xl transition-transform duration-500",
                                !isUploading && "group-hover/video:scale-[1.01]",
                                isUploading && "opacity-50 blur-sm"
                            )}
                            poster={mediaUrl ? mediaUrl + "#t=0.5" : undefined}
                        />
                        <div className={cn(
                            "absolute top-2 left-2 flex items-center gap-2 pointer-events-auto transition-opacity",
                            "opacity-100 md:opacity-0 md:group-hover/video:opacity-100"
                        )}>
                            <span className="text-white text-[10px] font-bold backdrop-blur-md bg-black/50 px-2.5 py-1 rounded-full border border-white/20 truncate max-w-[120px] md:max-w-[200px]">
                                {fileName || "Video"}
                            </span>
                            <a
                                href={mediaUrl || "#"}
                                download={fileName || "video"}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-black/50 hover:bg-black/70 active:scale-90 rounded-full backdrop-blur-md transition-all border border-white/20"
                            >
                                <Download className="h-3.5 w-3.5 text-white" />
                            </a>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
                                className="p-2 bg-black/50 hover:bg-black/70 active:scale-90 rounded-full backdrop-blur-md transition-all border border-white/20"
                            >
                                <Maximize2 className="h-3.5 w-3.5 text-white" />
                            </button>
                        </div>
                    </div>
                );
            case "pdf":
                const downloadUrl = mediaUrl ? (mediaUrl.includes('?') ? `${mediaUrl}&download=true` : `${mediaUrl}?download=true`) : "#";
                return (
                    <a
                        href={isUploading ? undefined : downloadUrl}
                        download={fileName || "document.pdf"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-sm relative overflow-hidden",
                            !isUploading && "hover:scale-[1.02] active:scale-[0.98]",
                            isMe
                                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                : "bg-background border-border text-foreground hover:bg-secondary",
                            isUploading && "opacity-80 pointer-events-none"
                        )}
                    >
                        {isUploading && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20">
                                <div className="h-full bg-primary animate-progress origin-left w-full" />
                            </div>
                        )}
                        <div className={cn(
                            "p-3 rounded-xl shadow-inner shrink-0",
                            isMe ? "bg-white/20" : "bg-secondary text-primary"
                        )}>
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate uppercase tracking-tight">
                                {fileName || "PDF Document"}
                            </div>
                            <div className="text-[10px] opacity-60 truncate">
                                {isUploading ? "Uploading file..." : "Click to view/download"}
                            </div>
                        </div>
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isMe ? "bg-white/10" : "bg-muted"
                        )}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 opacity-70" />}
                        </div>
                    </a>
                );
            case "audio":
                return (
                    <div className={cn(
                        "rounded-[1.25rem] p-3.5 flex flex-col gap-3 shadow-sm border relative overflow-hidden min-w-[240px] max-w-full md:max-w-[300px]",
                        isMe ? "bg-white/10 border-white/20" : "bg-secondary/40 border-border",
                        isUploading && "opacity-80"
                    )}>
                        {isUploading && (
                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/20">
                                <div className="h-full bg-primary animate-progress origin-left w-full" />
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shadow-lg shrink-0",
                                isMe ? "bg-white/20 text-white" : "bg-primary text-primary-foreground"
                            )}>
                                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    isMe ? "text-white/80" : "text-primary/80"
                                )}>
                                    Voice Note
                                </div>
                                <div className={cn(
                                    "text-[11px] truncate font-medium",
                                    isMe ? "text-white/60" : "text-muted-foreground"
                                )}>
                                    {fileName || "Audio Message"}
                                </div>
                            </div>
                        </div>

                        {!isUploading && (
                            <div className="flex flex-col gap-2.5">
                                <audio
                                    src={mediaUrl}
                                    controls
                                    className={cn(
                                        "h-8 w-full",
                                        isMe ? "[&::-webkit-media-controls-enclosure]:bg-white/10" : ""
                                    )}
                                />
                                {transcript && (
                                    <div className={cn(
                                        "p-2.5 rounded-xl text-[13px] leading-relaxed relative",
                                        isMe ? "bg-black/20 text-white/90" : "bg-black/5 text-foreground/80"
                                    )}>
                                        <div className="absolute top-0 left-2 -translate-y-1/2">
                                            <div className={cn(
                                                "w-2 h-2 rotate-45",
                                                isMe ? "bg-black/20" : "bg-black/5"
                                            )} />
                                        </div>
                                        <span className="opacity-60 italic mr-1.5">AIGenerated Transcript:</span>
                                        {transcript}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {renderMedia()}
            {content && (
                <div className={cn(
                    "prose prose-sm max-w-none dark:prose-invert break-words",
                    isMe
                        ? "prose-p:text-primary-foreground prose-a:text-primary-foreground prose-strong:text-primary-foreground prose-code:text-primary-foreground marker:text-primary-foreground"
                        : "prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground marker:text-primary",
                    "prose-p:m-0 prose-p:leading-relaxed",
                    "prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
                )}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");

                                if (!inline && match) {
                                    return (
                                        <div className="mt-2 mb-2 rounded-md overflow-hidden bg-[#1E1E1E] text-sm shadow-sm border border-black/10">
                                            <div className="flex items-center justify-between px-3 py-1 bg-black/40 text-xs text-slate-300 font-mono select-none">
                                                {match[1]}
                                            </div>
                                            <SyntaxHighlighter
                                                style={vscDarkPlus as any}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, "")}
                                            </SyntaxHighlighter>
                                        </div>
                                    );
                                }

                                return (
                                    <code className={cn("bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5", className)} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            a({ node, children, ...props }: any) {
                                return (
                                    <a target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-80 font-medium" {...props}>
                                        {children}
                                    </a>
                                );
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            )}

            <ImageLightbox
                isOpen={isPreviewOpen && !!mediaUrl && !isUploading}
                onClose={() => setIsPreviewOpen(false)}
                mediaUrl={mediaUrl!}
                fileName={fileName}
                mediaType={mediaType === "image" || mediaType === "video" ? mediaType : undefined}
            />
        </div>
    );
};
