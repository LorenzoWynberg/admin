'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { actionLabel } from '@/utils/lang';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (data: { body?: string; image?: File }) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!body.trim() && !image) return;
    onSend({ body: body.trim() || undefined, image: image || undefined });
    setBody('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-3">
      {image && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">{image.name}</span>
          <button
            type="button"
            className="text-destructive text-xs hover:underline"
            onClick={() => {
              setImage(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            {actionLabel('remove')}
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImage(file);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat:type_message', {
            defaultValue: 'Type a message...',
          })}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!body.trim() && !image)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
