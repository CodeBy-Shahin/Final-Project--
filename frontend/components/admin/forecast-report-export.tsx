"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DemandForecast } from "@/types/domain";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function safeText(value: string | number | undefined | null) {
  return String(value ?? "").replace(/[^\x20-\x7E]/g, "-");
}

export function ForecastReportExport({ forecast }: { forecast: DemandForecast }) {
  const [busy, setBusy] = useState(false);

  async function exportPdf() {
    setBusy(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 18;

      const addPageIfNeeded = (height: number) => {
        if (y + height > pageHeight - margin) {
          doc.addPage();
          y = 18;
        }
      };

      const bestProduct = forecast.items[0];
      const totalPredicted = forecast.items.reduce((sum, item) => sum + item.predictedUnits, 0);
      const avgConfidence = forecast.items.length
        ? Math.round(
            forecast.items.reduce((sum, item) => sum + item.confidence, 0) / forecast.items.length,
          )
        : 0;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Demand Forecast Report", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${formatDate(forecast.generatedAt)}`, margin, y);
      doc.text(`Horizon: ${forecast.horizon}`, pageWidth - margin, y, { align: "right" });
      y += 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Summary", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const summary = [
        `Most likely to sell: ${bestProduct?.name ?? "No sales data yet"}`,
        `Predicted units for top product: ${bestProduct?.predictedUnits ?? 0}`,
        `Average confidence: ${avgConfidence}%`,
        `Total predicted units in report: ${totalPredicted}`,
      ];

      for (const line of summary) {
        doc.text(safeText(line), margin, y);
        y += 6;
      }

      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Future Demand Ranking", margin, y);
      y += 8;

      const columns = [
        { label: "Product", x: margin, width: 48 },
        { label: "Vendor", x: 64, width: 36 },
        { label: "Recent", x: 103, width: 18 },
        { label: "Pred.", x: 124, width: 18 },
        { label: "Trend", x: 146, width: 22 },
        { label: "Conf.", x: 172, width: 18 },
      ];

      addPageIfNeeded(16);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      columns.forEach((column) => doc.text(column.label, column.x, y));
      y += 7;

      doc.setFont("helvetica", "normal");
      forecast.items.forEach((item, index) => {
        addPageIfNeeded(14);

        if (index > 0 && y < 24) {
          doc.setFont("helvetica", "bold");
          columns.forEach((column) => doc.text(column.label, column.x, y));
          y += 7;
          doc.setFont("helvetica", "normal");
        }

        const productLines = doc.splitTextToSize(safeText(item.name), columns[0].width);
        const vendorLines = doc.splitTextToSize(safeText(item.vendorName), columns[1].width);
        const rowHeight = Math.max(productLines.length, vendorLines.length, 1) * 4 + 4;

        addPageIfNeeded(rowHeight);
        doc.text(productLines, columns[0].x, y);
        doc.text(vendorLines, columns[1].x, y);
        doc.text(String(item.recentSold), columns[2].x, y);
        doc.text(String(item.predictedUnits), columns[3].x, y);
        doc.text(item.trend, columns[4].x, y);
        doc.text(`${item.confidence}%`, columns[5].x, y);
        y += rowHeight;
      });

      if (forecast.items.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("No product demand data found.", margin, y);
      }

      doc.save(`demand-forecast-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={exportPdf} disabled={busy || forecast.items.length === 0}>
      <Download className="size-4" />
      {busy ? "Exporting..." : "Export report"}
    </Button>
  );
}
