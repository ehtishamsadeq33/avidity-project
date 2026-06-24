import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return Buffer.from(mergedBytes);
}

export async function mergeGroupReportPdfs(
  portraitBuffer: Buffer,
  landscapeBuffer: Buffer,
  footerText?: string,
): Promise<Buffer> {
  const portraitPdf = await PDFDocument.load(portraitBuffer);
  const landscapePdf = await PDFDocument.load(landscapeBuffer);
  const mergedPdf = await PDFDocument.create();

  // Copy first 2 portrait pages (indices 0 and 1)
  const portraitFirstTwo = await mergedPdf.copyPages(portraitPdf, [0, 1]);
  portraitFirstTwo.forEach((page) => mergedPdf.addPage(page));

  // Insert landscape page(s) after page 2
  const landscapePages = await mergedPdf.copyPages(
    landscapePdf,
    landscapePdf.getPageIndices(),
  );
  landscapePages.forEach((page) => mergedPdf.addPage(page));

  // Add remaining portrait pages (index 2 onwards)
  const remainingPortraitPages = await mergedPdf.copyPages(
    portraitPdf,
    portraitPdf.getPageIndices().slice(2),
  );
  remainingPortraitPages.forEach((page) => mergedPdf.addPage(page));

  // Add unified footers after merging
  const totalPages = mergedPdf.getPageCount();
  const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 8;
  const grey = rgb(0.4, 0.4, 0.4);

  for (let i = 0; i < totalPages; i++) {
    const page = mergedPdf.getPage(i);
    const { width, height } = page.getSize();
    const leftText =
      footerText ||
      "Avidity International | Copyright © Coach Readiness Assessment Report";
    const rightText = `page ${i + 1} of ${totalPages}`;

    // Draw left text
    page.drawText(leftText, {
      x: 15,
      y: 10,
      size: fontSize,
      font,
      color: grey,
    });

    // Draw right text
    const rightTextWidth = font.widthOfTextAtSize(rightText, fontSize);
    page.drawText(rightText, {
      x: width - rightTextWidth - 15,
      y: 10,
      size: fontSize,
      font,
      color: grey,
    });
  }

  const mergedBytes = await mergedPdf.save();
  return Buffer.from(mergedBytes);
}
