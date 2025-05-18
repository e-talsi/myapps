// src/app/page.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { DrawingCanvasRef } from '@/components/DrawingCanvas'; // Import type explicitly
import DrawingCanvas from '@/components/DrawingCanvas';
import Toolbar from '@/components/Toolbar';
import AdBanner from '@/components/AdBanner'; // Import the AdBanner component
import { useToast } from "@/hooks/use-toast";
import { generateColoringSuggestions, type GenerateColoringSuggestionsInput } from '@/ai/flows/generate-coloring-suggestions';
import { Button } from '@/components/ui/button'; // For initial load button
import { Loader2 } from 'lucide-react';

export default function DoodlePadPage() {
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false); // To prevent SSR issues with canvas

  const drawingCanvasRef = useRef<DrawingCanvasRef>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true); // Component has mounted, safe to render canvas
    
    // Load saved drawing on mount
    const savedDrawing = localStorage.getItem('doodlePadDrawing');
    if (savedDrawing && drawingCanvasRef.current) {
      drawingCanvasRef.current.loadDataURL(savedDrawing)
        .then(() => {
          toast({ title: "Loaded saved drawing!" });
        })
        .catch((error) => {
          console.error("Error loading saved drawing to canvas:", error);
          toast({ 
            title: "Error loading saved drawing", 
            description: "Could not apply the saved drawing. It might be corrupted.",
            variant: "destructive" 
          });
          localStorage.removeItem('doodlePadDrawing'); // Clean up potentially bad data
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount. `toast` is stable.


  const handleClear = useCallback(() => {
    drawingCanvasRef.current?.clear();
    setSuggestedColors([]); // Also clear AI suggestions
    toast({ title: "Canvas Cleared!" });
  }, [toast]);

  const handleSave = useCallback(() => {
    const dataURL = drawingCanvasRef.current?.getDataURL();
    if (dataURL) {
      localStorage.setItem('doodlePadDrawing', dataURL);
      toast({ title: "Drawing Saved!", description: "Your artwork is saved in browser storage." });
    }
  }, [toast]);

  const handleDownload = useCallback(() => {
    const dataURL = drawingCanvasRef.current?.getDataURL();
    if (dataURL) {
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'doodle.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Image Downloading!" });
    }
  }, [toast]);

  const handleCopyImage = useCallback(() => {
    const dataURL = drawingCanvasRef.current?.getDataURL();
    if (dataURL) {
      // Attempt to use Clipboard API for images if available (requires HTTPS)
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        fetch(dataURL)
          .then(res => res.blob())
          .then(blob => {
            navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
              .then(() => toast({ title: "Image Copied!", description: "Artwork copied to clipboard." }))
              .catch(err => {
                console.warn("Clipboard API copy failed, falling back to text copy:", err);
                // Fallback to copying Data URL as text
                navigator.clipboard.writeText(dataURL)
                  .then(() => toast({ title: "Image Data Copied!", description: "Data URL (text) copied to clipboard." }))
                  .catch(textErr => toast({ title: "Copy Failed", description: textErr.message, variant: "destructive" }));
              });
          })
          .catch(err => {
             console.error("Error fetching blob for clipboard:", err);
             toast({ title: "Copy Failed", description: "Could not prepare image for copying.", variant: "destructive" })
          });
      } else {
         // Fallback for older browsers or non-HTTPS sites
        navigator.clipboard.writeText(dataURL)
          .then(() => toast({ title: "Image Data Copied!", description: "Data URL (text) copied to clipboard." }))
          .catch(err => toast({ title: "Copy Failed", description: err.message, variant: "destructive" }));
      }
    }
  }, [toast]);

  const handleGetSuggestions = useCallback(async () => {
    const dataURL = drawingCanvasRef.current?.getDataURL('image/jpeg', 0.7); // Use JPEG for smaller size
    if (!dataURL) {
      toast({ title: "Error", description: "Could not get drawing data.", variant: "destructive" });
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const input: GenerateColoringSuggestionsInput = { drawingDataUri: dataURL };
      const result = await generateColoringSuggestions(input);
      setSuggestedColors(result.suggestedColors);
      if (result.suggestedColors.length > 0) {
        toast({ title: "Color Suggestions Ready!", description: "Check the palette for new colors." });
      } else {
        toast({ title: "No New Suggestions", description: "AI couldn't find specific suggestions for this drawing." });
      }
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      let description = "Failed to get color suggestions.";
      if (error instanceof Error) {
        description = error.message.includes("SAFETY") ? "The drawing could not be processed due to content safety filters." : description;
      }
      toast({ title: "AI Error", description, variant: "destructive" });
      setSuggestedColors([]); // Clear suggestions on error
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [toast]);
  
  if (!isMounted) {
     return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold text-primary">Doodle Pad</h1>
        <p className="text-muted-foreground">Loading your creative space...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Toolbar
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        tool={tool}
        setTool={setTool}
        onClear={handleClear}
        onSave={handleSave}
        onDownload={handleDownload}
        onCopyImage={handleCopyImage}
        onGetSuggestions={handleGetSuggestions}
        isGeneratingSuggestions={isGeneratingSuggestions}
        suggestedColors={suggestedColors}
      />
      <main className="flex-grow relative p-2 sm:p-4 min-h-0"> {/* min-h-0 is important for flex-grow to shrink */}
        <DrawingCanvas
          ref={drawingCanvasRef}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          tool={tool}
          className="rounded-lg shadow-xl border border-border"
        />
      </main>
      <AdBanner /> {/* AdBanner added here */}
    </div>
  );
}
