// /utils/pdf.ts
import jsPDF from "jspdf";

/**
 * Strips HTML, decodes entities, and sanitizes text to prevent corrupted
 * characters in the generated PDF, which has limited font support for non-ASCII characters.
 * This function is implemented based on the user's request for robust text cleaning.
 */
function cleanItineraryText(html: string): string {
    if (!html) return "";

    // 1. Convert HTML to plain text, handling line breaks and entities.
    let cleanText = html
        .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
        .replace(/<[^>]+>/g, "")     // Strip all other HTML tags
        .replace(/&nbsp;/g, " ")     // Handle non-breaking spaces
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // 2. Normalize special characters and symbols to their ASCII equivalents.
    cleanText = cleanText
        .replace(/[\u2018\u2019]/g, "'") // smart quotes → normal
        .replace(/[\u201C\u201D]/g, '"') // curly quotes → straight
        .replace(/[\u2022\u25CF]/g, "-") // bullet icons → dash
        .replace(/—/g, '--')             // em dash → double dash
        .replace(/…/g, '...');           // ellipsis → three dots

    // 3. Remove specific corrupted symbols and any remaining non-ASCII characters
    // to ensure maximum compatibility with jsPDF's standard fonts.
    cleanText = cleanText
        .replace(/[ØÜ¡�]/g, "")           // Remove known corrupted symbols
        .replace(/[^\x00-\x7F]/g, "");    // Remove all other non-ASCII chars

    // 4. Final cleanup of whitespace for clean formatting.
    return cleanText.replace(/\n\s*\n/g, "\n\n").trim();
}


/** Split long text into wrapped lines for the given width */
function wrapText(doc: jsPDF, text: string, maxWidth: number) {
  return doc.splitTextToSize(text, maxWidth);
}

export function downloadItineraryPDF(opts: {
  destination: string;
  duration: string;
  style?: string;
  itinerary: string;
}) {
  const { destination, duration, style = "", itinerary } = opts;
  const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842pt approx
  const marginX = 56; // 0.78in
  const maxWidth = 595 - marginX * 2;

  // Colors / brand
  const gold = "#a4823f";
  const textColor = "#2d2a26";

  // Header
  doc.setTextColor(gold);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Globetrotter Travel Lens — Itinerary", marginX, 72);

  // Subheader line
  doc.setDrawColor(gold);
  doc.setLineWidth(1);
  doc.line(marginX, 82, 595 - marginX, 82);

  // Meta
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const metaLeft = [
    `Destination: ${destination || "—"}`,
    `Trip Duration: ${duration || "—"}`,
    style ? `Travel Style: ${style}` : "",
  ].filter(Boolean).join("  •  ");

  doc.text(metaLeft, marginX, 106);

  // Body
  const clean = cleanItineraryText(itinerary);
  doc.setFontSize(12);
  const lines = wrapText(doc, clean, maxWidth);

  let y = 136;
  const lineHeight = 17;

  lines.forEach((ln) => {
    // New page if close to bottom margin
    if (y > 812) {
      // footer before new page
      doc.setFontSize(10);
      doc.setTextColor("#7a7166");
      doc.text("Created by RAKI AI Digital DEN • © 2025", marginX, 828);
      doc.addPage();
      y = 72;
      // header carry-over
      doc.setTextColor(gold);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Itinerary (cont.) — ${destination}`, marginX, y);
      y += 24;
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
    }
    doc.text(ln, marginX, y);
    y += lineHeight;
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor("#7a7166");
  doc.text("Created by RAKI AI Digital DEN • © 2025", marginX, 828);

  const safeDest = (destination || "Itinerary").replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");
  doc.save(`Globetrotter_${safeDest}_Itinerary.pdf`);
}
