import React, { useRef, useState } from 'react';
import { ChartImageInput, AnalysisMode } from '../types';
import { SAMPLE_PRESETS, SCALPING_SAMPLE_PRESETS, SamplePreset } from '../data/samplePresets';
import { Upload, Image as ImageIcon, Trash2, Eye, Sparkles, CheckCircle2, Zap, Target } from 'lucide-react';

interface ChartUploaderProps {
  images: ChartImageInput;
  onChangeImages: (images: ChartImageInput) => void;
  onSelectPreset: (preset: SamplePreset) => void;
  analysisMode: AnalysisMode;
  onChangeAnalysisMode: (mode: AnalysisMode) => void;
}

interface TimeframeConfig {
  key: keyof ChartImageInput;
  title: string;
  badge: string;
  role: string;
  bgGrad: string;
  borderColor: string;
}

const STANDARD_TIMEFRAMES: TimeframeConfig[] = [
  {
    key: 'h4Image',
    title: 'TF H4 (4-Hour)',
    badge: 'Higher Timeframe',
    role: 'วิเคราะห์โครงสร้างใหญ่ (Macro Structure) & Trend หลัก',
    bgGrad: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-500/30',
  },
  {
    key: 'h1Image',
    title: 'TF H1 (1-Hour)',
    badge: 'Intermediate Timeframe',
    role: 'วิเคราะห์โซนสำคัญ (Order Block, FVG, Pattern, ChoCH)',
    bgGrad: 'from-blue-500/10 to-indigo-500/5',
    borderColor: 'border-blue-500/30',
  },
  {
    key: 'm15Image',
    title: 'TF M15 (15-Minute)',
    badge: 'Lower Timeframe',
    role: 'วิเคราะห์จุดเข้าเทรดจริง (Entry Trigger, SL, TP)',
    bgGrad: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'border-emerald-500/30',
  },
];

const SCALPING_TIMEFRAMES: TimeframeConfig[] = [
  {
    key: 'h4Image',
    title: 'TF M15 (15-Minute)',
    badge: 'Macro Scalp Bias',
    role: 'วิเคราะห์โครงสร้างคลื่นแม่ & Trend หลักสายซิ่ง (Macro Bias M15)',
    bgGrad: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-500/30',
  },
  {
    key: 'h1Image',
    title: 'TF M5 (5-Minute)',
    badge: 'Bounce & Pullback Zone',
    role: 'วิเคราะห์โซนย่อเด้งตามเทรนด์หลัก & Demand/Supply M5',
    bgGrad: 'from-cyan-500/10 to-blue-500/5',
    borderColor: 'border-cyan-500/30',
  },
  {
    key: 'm15Image',
    title: '⚡ TF M1 (1-Minute)',
    badge: 'Sniper Trigger M1',
    role: 'จุดเข้าเทรด M1 คมกริบ โดนลากน้อยที่สุด เน้นกำไรเยอะ (Sniper Entry M1)',
    bgGrad: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/5',
    borderColor: 'border-emerald-500/50',
  },
];

export const ChartUploader: React.FC<ChartUploaderProps> = ({
  images,
  onChangeImages,
  onSelectPreset,
  analysisMode,
  onChangeAnalysisMode,
}) => {
  const [activePreview, setActivePreview] = useState<{ title: string; url: string } | null>(null);
  const [dragActiveTF, setDragActiveTF] = useState<string | null>(null);

  const isScalping = analysisMode === 'SCALPING';
  const currentTfConfigs = isScalping ? SCALPING_TIMEFRAMES : STANDARD_TIMEFRAMES;
  const currentPresets = isScalping ? SCALPING_SAMPLE_PRESETS : SAMPLE_PRESETS;

  const fileInputRefs = {
    h4Image: useRef<HTMLInputElement>(null),
    h1Image: useRef<HTMLInputElement>(null),
    m15Image: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = (tfKey: keyof ChartImageInput, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChangeImages({
        ...images,
        [tfKey]: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (tfKey: keyof ChartImageInput, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTF(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(tfKey, e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (tfKey: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTF(tfKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTF(null);
  };

  const handleRemove = (tfKey: keyof ChartImageInput) => {
    onChangeImages({
      ...images,
      [tfKey]: null,
    });
  };

  // Count uploaded images
  const uploadedCount = [images.h4Image, images.h1Image, images.m15Image].filter(Boolean).length;

  return (
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
      {/* Mode Switcher Bar */}
      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">เลือกโหมดการวิเคราะห์:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onChangeAnalysisMode('STANDARD')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border ${
              !isScalping
                ? 'bg-slate-800 text-slate-100 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Target className={`w-4 h-4 ${!isScalping ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>🎯 โหมดมาตรฐาน (H4, H1, M15)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeAnalysisMode('SCALPING')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 border ${
              isScalping
                ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-4 h-4 ${isScalping ? 'text-amber-300 animate-pulse' : 'text-slate-500'}`} />
            <span>⚡ โหมดเทรดสายซิ่ง (M15, M5, M1)</span>
          </button>
        </div>
      </div>

      {/* Header & Quick Preset Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              2
            </span>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>
                {isScalping
                  ? 'อัปโหลดรูปภาพกราฟ 3 Timeframe (M15, M5, M1) สำหรับสายซิ่ง'
                  : 'อัปโหลดรูปภาพกราฟ 3 Timeframe (H4, H1, M15)'}
              </span>
              {isScalping && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ⚡ M1 Scalper Mode
                </span>
              )}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              อัปโหลดแล้ว {uploadedCount}/3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isScalping
              ? 'แนบรูป M15 (คลื่นแม่) -> M5 (จุดย่อเด้ง) -> M1 (เข้าเทรดสไนเปอร์ โดนลากน้อยที่สุด กำไรเยอะ)'
              : 'ลากและวางรูปภาพภาพกราฟ TradingView / MetaTrader หรือแนบไฟล์แยกตาม Timeframe'}
          </p>
        </div>

        {/* 1-Click Sample Preset Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            ทดลองด่วน:
          </span>
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition shrink-0 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{preset.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3 Timeframe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentTfConfigs.map((tf) => {
          const imageSrc = images[tf.key];
          const isDragging = dragActiveTF === tf.key;

          return (
            <div
              key={tf.key}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between bg-gradient-to-b ${tf.bgGrad} ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]'
                  : imageSrc
                  ? 'border-emerald-500/50 bg-slate-800/80 shadow-md'
                  : `${tf.borderColor} bg-slate-800/40 hover:bg-slate-800/70`
              }`}
              onDragOver={(e) => handleDragOver(tf.key, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(tf.key, e)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{tf.title}</span>
                  <span className="text-[10px] text-slate-400">{tf.badge}</span>
                </div>
                {imageSrc ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> พร้อมวิเคราะห์
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    ยังไม่อัปโหลด
                  </span>
                )}
              </div>

              {/* Card Body - Upload or Preview */}
              {imageSrc ? (
                <div className="relative group rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 aspect-video flex items-center justify-center my-2">
                  <img
                    src={imageSrc}
                    alt={tf.title}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setActivePreview({ title: tf.title, url: imageSrc })}
                      className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium flex items-center gap-1 border border-slate-600"
                      title="ดูภาพขยาย"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>ขยาย</span>
                    </button>
                    <button
                      onClick={() => handleRemove(tf.key)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium flex items-center gap-1 border border-red-500/30"
                      title="ลบรูปนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRefs[tf.key].current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-5 my-2 text-center transition flex flex-col items-center justify-center gap-2 group min-h-[140px]"
                >
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block group-hover:text-emerald-300">
                      คลิกอัปโหลด หรือลากรูปวางที่นี่
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{tf.role}</span>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRefs[tf.key]}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(tf.key, e.target.files[0]);
                  }
                }}
              />

              {/* Card Footer Note */}
              <div className="mt-1 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                {tf.role}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Image Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-4 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                รูปภาพตัวอย่าง: {activePreview.title}
              </h3>
              <button
                onClick={() => setActivePreview(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={activePreview.url}
                alt={activePreview.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
