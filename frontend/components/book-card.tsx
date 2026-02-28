"use client";

import { Heart, Edit2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BookCardProps {
  id?: number; // 增加 id 以便識別
  title: string;
  author: string;
  progress: number;
  isFavorite: boolean;
  image: string;
  color?: string;
  // 新增功能屬性
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
}

export function BookCard({
  title,
  author,
  progress,
  isFavorite,
  image,
  color,
  onEdit,
  onDelete,
  onFavorite,
}: BookCardProps) {
  return (
    <div className="bg-[#1e293b]/30 border border-white/5 rounded-2xl p-4 transition-all hover:translate-y-[-5px] group">
      {/* 圖片容器 */}
      <div
        className={cn(
          "relative aspect-[3/4] mb-4 rounded-xl overflow-hidden shadow-inner flex items-center justify-center",
          color || "bg-slate-800",
        )}
      >
        {/* 書本封面圖 */}
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="text-slate-500 text-xs">No Cover</div>
        )}

        {/* 喜愛按鈕 - 綁定 onFavorite */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavorite?.();
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors z-10"
        >
          <Heart
            size={24}
            className={cn(
              "transition-all",
              isFavorite ? "fill-rose-500 text-rose-500" : "text-white/70",
            )}
          />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-white leading-tight truncate text-sm">
          {title}
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">{author}</p>
      </div>

      <div className="space-y-2 mb-6">
        <Progress value={progress} className="h-1.5 progress-container" />
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          {progress === 100 ? "Finished" : `${progress}% Complete`}
        </p>
      </div>

      <div className="flex gap-2">
        {/* Edit 按鈕 - 綁定 onEdit */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit?.();
          }}
          className="flex-1 py-2 text-[11px] font-bold text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5"
        >
          <Edit2 size={12} />
          Edit
        </button>

        {/* Delete 按鈕 - 綁定 onDelete */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete?.();
          }}
          className="flex-1 py-2 text-[11px] font-bold border border-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  );
}
