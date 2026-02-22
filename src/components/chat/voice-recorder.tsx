"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    onCancel: () => void;
}

export const VoiceRecorder = ({ onRecordingComplete, onCancel }: VoiceRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                onRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied:", err);
            onCancel();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        startRecording();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center gap-4 bg-muted/50 rounded-xl px-4 py-2 border border-primary/20"
        >
            <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 h-3 w-3 bg-red-500 rounded-full animate-ping opacity-75" />
                </div>
                <span className="text-sm font-mono text-foreground font-medium">
                    {formatTime(recordingTime)}
                </span>
                <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute inset-0 bg-primary/40"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-destructive transition-colors h-9 w-9 rounded-lg"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    onClick={stopRecording}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9 px-4 rounded-lg shadow-sm"
                >
                    <Square className="h-3 w-3 fill-current" />
                    Stop
                </Button>
            </div>
        </motion.div>
    );
};
