// src/components/ColorPalettePopover.tsx
"use client";

import React from 'react';
import { Paintbrush, Palette as PaletteIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ColorPalettePopoverProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  suggestedColors?: string[];
}

const defaultColors = [
  '#FF0000', '#FFA500', '#FFFF00', '#00C000', '#0000FF', '#800080', 
  '#A52A2A', '#000000', '#FFFFFF', '#CCCCCC', '#888888', '#444444'
];

const ColorPalettePopover: React.FC<ColorPalettePopoverProps> = ({
  selectedColor,
  onColorChange,
  suggestedColors = [],
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Paintbrush className="h-5 w-5" />
          <span className="sr-only">Open color palette</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-4">
        <div>
          <Label htmlFor="color-picker-input" className="text-sm font-medium mb-2 block">Custom Color</Label>
          <div className="flex items-center gap-2">
             <Input
                id="color-picker-input"
                type="color"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-14 h-10 p-0 border-0 cursor-pointer rounded-md"
                aria-label="Select custom color"
              />
              <Input 
                type="text"
                value={selectedColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-24 h-10"
                aria-label="Custom color hex code"
              />
          </div>
        </div>
        
        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Default Colors</h4>
          <div className="grid grid-cols-6 gap-2">
            {defaultColors.map((color) => (
              <Button
                key={color}
                aria-label={`Select color ${color}`}
                className={`w-8 h-8 rounded-full border-2 ${selectedColor.toLowerCase() === color.toLowerCase() ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>

        {suggestedColors.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
              <div className="grid grid-cols-6 gap-2">
                {suggestedColors.map((color, index) => (
                  <Button
                    key={`suggested-${index}-${color}`}
                    aria-label={`Select AI suggested color ${color}`}
                    className={`w-8 h-8 rounded-full border-2 ${selectedColor.toLowerCase() === color.toLowerCase() ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ColorPalettePopover;
