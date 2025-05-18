// src/components/Toolbar.tsx
"use client";

import React from 'react';
import { Pencil, Eraser, Trash2, Save, Download, Copy, Sparkles, Palette as PaletteIcon, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ColorPalettePopover from './ColorPalettePopover';

interface ToolbarProps {
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  tool: 'pencil' | 'eraser';
  setTool: (tool: 'pencil' | 'eraser') => void;
  onClear: () => void;
  onSave: () => void;
  onDownload: () => void;
  onCopyImage: () => void;
  onGetSuggestions: () => void;
  isGeneratingSuggestions: boolean;
  suggestedColors: string[];
}

const Toolbar: React.FC<ToolbarProps> = ({
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  tool,
  setTool,
  onClear,
  onSave,
  onDownload,
  onCopyImage,
  onGetSuggestions,
  isGeneratingSuggestions,
  suggestedColors,
}) => {
  const strokeWidthMin = 1;
  const strokeWidthMax = 50;

  const increaseStrokeWidth = () => setStrokeWidth(Math.min(strokeWidthMax, strokeWidth + 1));
  const decreaseStrokeWidth = () => setStrokeWidth(Math.max(strokeWidthMin, strokeWidth - 1));

  const actionButtons = [
    { icon: Pencil, label: 'Pencil', action: () => setTool('pencil'), currentTool: 'pencil' },
    { icon: Eraser, label: 'Eraser', action: () => setTool('eraser'), currentTool: 'eraser' },
    { icon: Trash2, label: 'Clear Canvas', action: onClear },
    { icon: Save, label: 'Save Drawing', action: onSave },
    { icon: Download, label: 'Download Image', action: onDownload },
    { icon: Copy, label: 'Copy Image Data', action: onCopyImage },
  ];

  return (
    <TooltipProvider>
      <header className="p-2 sm:p-4 bg-card shadow-md sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 sm:gap-4">
          
          {/* Left section: Tool selection & Palette */}
          <div className="flex items-center gap-1 sm:gap-2">
            {actionButtons.slice(0, 2).map(btn => (
              <Tooltip key={btn.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === btn.currentTool ? 'default' : 'outline'}
                    size="icon"
                    onClick={btn.action}
                    className={tool === btn.currentTool ? 'bg-primary text-primary-foreground' : 'border-input'}
                    aria-label={btn.label}
                  >
                    <btn.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{btn.label}</p></TooltipContent>
              </Tooltip>
            ))}
            <ColorPalettePopover 
              selectedColor={strokeColor} 
              onColorChange={setStrokeColor}
              suggestedColors={suggestedColors}
            />
          </div>

          {/* Middle section: Stroke Width Slider */}
          <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 w-full sm:w-auto max-w-xs order-last sm:order-none mt-2 sm:mt-0">
            <Button variant="outline" size="icon" onClick={decreaseStrokeWidth} aria-label="Decrease stroke width"  className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              min={strokeWidthMin}
              max={strokeWidthMax}
              step={1}
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              className="w-full"
              aria-label="Stroke width"
            />
            <Button variant="outline" size="icon" onClick={increaseStrokeWidth} aria-label="Increase stroke width" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-sm w-8 text-center tabular-nums">{strokeWidth}</span>
          </div>
          
          {/* Right section: Actions & AI */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onGetSuggestions}
                  disabled={isGeneratingSuggestions}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  aria-label="Get AI Coloring Suggestions"
                >
                  <Sparkles className={`h-5 w-5 ${isGeneratingSuggestions ? 'animate-pulse' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>AI Coloring Suggestions</p></TooltipContent>
            </Tooltip>
            {actionButtons.slice(2).map(btn => (
              <Tooltip key={btn.label}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={btn.action} 
                    aria-label={btn.label}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <btn.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{btn.label}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>

        </div>
      </header>
    </TooltipProvider>
  );
};

export default Toolbar;

