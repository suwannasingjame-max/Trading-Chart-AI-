import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, ChartOverlayCoordinates } from '../types';
import { Eye, Layers, Sliders, Download, Maximize2, RefreshCw, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

interface AnnotatedChartViewerProps {
  result: AnalysisResult;
}

export const AnnotatedChartViewer: React.FC<AnnotatedChartViewerProps> = ({ result }) => {
  const isScalp = result.analysisMode === 'SCALPING';
  const tfList = isScalp ? ['M1', 'M5', 'M15', 'M30', 'H1', 'H4'] : ['M15', 'H1', 'H4'];

  const [selectedTF, setSelectedTF] = useState<string>(isScalp ? 'M1' : 'M15');
  const [showOverlays, setShowOverlays] = useState(true);
  const [showKeyZones, setShowKeyZones] = useState(true);
  const [interactiveSL, setInteractiveSL] = useState<number>(result.tradeSetup.stopLossValue);
  const [interactiveTP, setInteractiveTP] = useState<number>(result.tradeSetup.takeProfit2Value);
  const [zoomLevel, setZoomLevel] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync interactive values if result changes
  useEffect(() => {
    setInteractiveSL(result.tradeSetup.stopLossValue);
    setInteractiveTP(result.tradeSetup.takeProfit2Value);
    setSelectedTF(result.analysisMode === 'SCALPING' ? 'M1' : 'M15');
  }, [result]);

  const { images, overlayCoords, tradeSetup, signal } = result;

  // Determine active chart image based on selectedTF
  let activeImage: string | null | undefined = null;
  if (selectedTF === 'M1') activeImage = images.m1Image || images.m15Image;
  else if (selectedTF === 'M5') activeImage = images.m5Image || images.h1Image;
  else if (selectedTF === 'M15') activeImage = images.m15Image || images.h4Image;
  else if (selectedTF === 'M30') activeImage = images.m30Image;
  else if (selectedTF === 'H1') activeImage = images.h1Image;
  else if (selectedTF === 'H4') activeImage = images.h4Image;

  if (!activeImage) {
    activeImage = images.m1Image || images.m5Image || images.m15Image || images.m30Image || images.h1Image || images.h4Image;
  }

  // Defaults for overlays if Gemini provided percentages
  const entryY = overlayCoords?.entryYPercent ?? 50;
  const slY = overlayCoords?.slYPercent ?? 78;
  const tp1Y = overlayCoords?.tp1YPercent ?? 35;
  const tp2Y = overlayCoords?.tp2YPercent ?? 22;
  const tp3Y = overlayCoords?.tp3YPercent ?? 12;

  // Calculate live Risk:Reward ratio if fine-tuned
  const entryVal = tradeSetup.entryPriceValue;
  const pipsSL = Math.abs(entryVal - interactiveSL);
  const pipsTP = Math.abs(interactiveTP - entryVal);
  const liveRR = pipsSL > 0 ? (pipsTP / pipsSL).toFixed(2) : '1:3';

  // Function to download annotated chart
  const handleDownloadAnnotatedChart = () => {
    if (!activeImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = activeImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) return;

      // Draw base chart image
      ctx.drawImage(img, 0, 0);

      const w = canvas.width;
      const h = canvas.height;

      // Draw Header Overlay on Canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, w, 60);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${result.symbol} • ${selectedTF} • AI Chart Analysis (${signal})`, 20, 38);

      // If overlays are enabled, draw lines on canvas
      if (showOverlays) {
        const drawLine = (yPercent: number, color: string, label: string) => {
          const y = (yPercent / 100) * h;

          ctx.beginPath();
          ctx.setLineDash([8, 6]);
          ctx.lineWidth = 4;
          ctx.strokeStyle = color;
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();

          // Label Box
          ctx.fillStyle = color;
          ctx.fillRect(w - 220, y - 18, 200, 36);

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(label, w - 210, y + 6);
        };

        drawLine(entryY, '#10B981', `ENTRY: ${tradeSetup.entryPrice}`);
        drawLine(slY, '#EF4444', `STOP LOSS: ${tradeSetup.stopLoss}`);
        drawLine(tp1Y, '#38BDF8', `TP1: ${tradeSetup.takeProfit1}`);
        drawLine(tp2Y, '#F59E0B', `TP2: ${tradeSetup.takeProfit2}`);
        drawLine(tp3Y, '#A855F7', `TP3: ${tradeSetup.takeProfit3}`);
      }

      // Draw Watermark Disclaimer Footer on Canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, h - 36, w, 36);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        'คำเตือน: การเทรดสัญญาซื้อขายล่วงหน้า ออปชัน และ Forex มีความเสี่ยงสูง ผลวิเคราะห์ AI เป็นเพียงเครื่องมือช่วยคัดกรองสัญญาณ โปรดบริหารความเสี่ยง (Risk Management) ทุกครั้งก่อนส่งคำสั่ง',
        16,
        h - 14
      );

      // Export canvas as image download
      const link = document.createElement('a');
      link.download = `${result.symbol}_${selectedTF}_AI_Analysis.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            3
          </span>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            ภาพแสดงจุดซื้อขายบนกราฟ (Annotated Chart View)
          </h2>
        </div>

        {/* Timeframe Switcher & Toggle Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* TF Selector */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(['M15', 'H1', 'H4'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTF(tf)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedTF === tf
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Toggle Overlays */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showOverlays
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>เส้นแสดงจุดเทรด</span>
          </button>

          {/* Toggle Key Zones */}
          <button
            onClick={() => setShowKeyZones(!showKeyZones)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showKeyZones
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>โซน OB / FVG</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadAnnotatedChart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="ดาวน์โหลดรูปกราฟพร้อมจุดวิเคราะห์"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>ดาวน์โหลดรูป</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Display Container */}
      <div
        ref={containerRef}
        className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center min-h-[420px] max-h-[650px]"
      >
        {activeImage ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-2">
            {/* Chart Image */}
            <div
              className="relative w-full max-w-5xl"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <img
                src={activeImage}
                alt={`Chart ${selectedTF}`}
                className="w-full h-auto object-contain rounded-lg"
              />

              {/* Light Diagonal Watermark Text Overlay across the Chart */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none flex flex-col justify-around opacity-[0.12] z-0">
                <div className="transform -rotate-12 whitespace-nowrap text-[12px] sm:text-sm font-bold text-slate-100 text-center tracking-widest">
                  คำเตือน: การเทรดมีความเสี่ยงสูง • AI เป็นเพียงเครื่องมือคัดกรองสัญญาณ • โปรดบริหารความเสี่ยง (Risk Management) ทุกครั้ง
                </div>
                <div className="transform -rotate-12 whitespace-nowrap text-[12px] sm:text-sm font-bold text-slate-100 text-center tracking-widest">
                  คำเตือน: การเทรดมีความเสี่ยงสูง • AI เป็นเพียงเครื่องมือคัดกรองสัญญาณ • โปรดบริหารความเสี่ยง (Risk Management) ทุกครั้ง
                </div>
                <div className="transform -rotate-12 whitespace-nowrap text-[12px] sm:text-sm font-bold text-slate-100 text-center tracking-widest">
                  คำเตือน: การเทรดมีความเสี่ยงสูง • AI เป็นเพียงเครื่องมือคัดกรองสัญญาณ • โปรดบริหารความเสี่ยง (Risk Management) ทุกครั้ง
                </div>
              </div>

              {/* Bottom Subtle Watermark Disclaimer Overlay */}
              <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-10 flex justify-center">
                <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-center max-w-3xl shadow-lg">
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-relaxed">
                    <span className="text-amber-400 font-bold">⚠️ คำเตือน:</span> การเทรดสัญญาซื้อขายล่วงหน้า ออปชัน และ Forex มีความเสี่ยงสูง ผลวิเคราะห์ AI เป็นเพียงเครื่องมือช่วยคัดกรองสัญญาณ โปรดบริหารความเสี่ยง (Risk Management) ทุกครั้งก่อนส่งคำสั่ง
                  </p>
                </div>
              </div>

              {/* OVERLAY LAYER (Absolute Position over Image) */}
              {showOverlays && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Key OB / FVG Boxes from Gemini */}
                  {showKeyZones && overlayCoords?.keyZones?.map((zone) => (
                    <div
                      key={zone.id}
                      className="absolute border-2 rounded-md flex items-start p-1 backdrop-blur-[1px] transition-all"
                      style={{
                        top: `${zone.yPercentMin}%`,
                        height: `${Math.max(zone.yPercentMax - zone.yPercentMin, 4)}%`,
                        left: `${zone.xPercentMin}%`,
                        width: `${Math.max(zone.xPercentMax - zone.xPercentMin, 20)}%`,
                        borderColor: zone.colorHex,
                        backgroundColor: `${zone.colorHex}25`,
                      }}
                    >
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-950 shadow-sm"
                        style={{ backgroundColor: zone.colorHex }}
                      >
                        {zone.label}
                      </span>
                    </div>
                  ))}

                  {/* Entry Line (Green) */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400 flex items-center justify-end px-3 transition-all"
                    style={{ top: `${entryY}%` }}
                  >
                    <div className="bg-emerald-500 text-slate-950 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 -translate-y-1/2">
                      <span className="w-2 h-2 rounded-full bg-slate-950" />
                      ENTRY: {tradeSetup.entryPrice}
                    </div>
                  </div>

                  {/* Stop Loss Line (Red) */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-red-500 flex items-center justify-end px-3 transition-all"
                    style={{ top: `${slY}%` }}
                  >
                    <div className="bg-red-500 text-slate-100 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 -translate-y-1/2">
                      <span className="w-2 h-2 rounded-full bg-slate-100" />
                      SL: {tradeSetup.stopLoss}
                    </div>
                  </div>

                  {/* Take Profit 1 Line (Cyan) */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400 flex items-center justify-end px-3 transition-all"
                    style={{ top: `${tp1Y}%` }}
                  >
                    <div className="bg-cyan-500 text-slate-950 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 -translate-y-1/2">
                      TP1: {tradeSetup.takeProfit1}
                    </div>
                  </div>

                  {/* Take Profit 2 Line (Gold) */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400 flex items-center justify-end px-3 transition-all"
                    style={{ top: `${tp2Y}%` }}
                  >
                    <div className="bg-amber-400 text-slate-950 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 -translate-y-1/2">
                      TP2: {tradeSetup.takeProfit2}
                    </div>
                  </div>

                  {/* Take Profit 3 Line (Purple) */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-purple-400 flex items-center justify-end px-3 transition-all"
                    style={{ top: `${tp3Y}%` }}
                  >
                    <div className="bg-purple-500 text-slate-100 text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 -translate-y-1/2">
                      TP3: {tradeSetup.takeProfit3}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-slate-500">
            ไม่มีรูปภาพสำหรับ Timeframe {selectedTF}
          </div>
        )}

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
            title="ซูมออก"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold text-slate-400 px-2">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2.0))}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
            title="ซูมเข้า"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Level Adjuster & Fine-Tuner */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            เครื่องมือปรับแต่งระยะ SL / TP และคำนวณ R:R สด (Live RR Fine-Tuner)
          </span>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            R:R ที่ปรับแต่งแล้ว: 1 : {liveRR}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* SL Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400 font-semibold">ปรับระยะ Stop Loss (SL)</span>
              <span className="text-slate-200 font-bold">{interactiveSL}</span>
            </div>
            <input
              type="range"
              min={Math.min(tradeSetup.entryPriceValue, tradeSetup.stopLossValue) * 0.95}
              max={Math.max(tradeSetup.entryPriceValue, tradeSetup.stopLossValue) * 1.05}
              step={0.1}
              value={interactiveSL}
              onChange={(e) => setInteractiveSL(parseFloat(e.target.value))}
              className="w-full accent-red-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* TP Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-400 font-semibold">ปรับระยะ Take Profit (TP)</span>
              <span className="text-slate-200 font-bold">{interactiveTP}</span>
            </div>
            <input
              type="range"
              min={Math.min(tradeSetup.entryPriceValue, tradeSetup.takeProfit2Value) * 0.95}
              max={Math.max(tradeSetup.entryPriceValue, tradeSetup.takeProfit2Value) * 1.05}
              step={0.1}
              value={interactiveTP}
              onChange={(e) => setInteractiveTP(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
