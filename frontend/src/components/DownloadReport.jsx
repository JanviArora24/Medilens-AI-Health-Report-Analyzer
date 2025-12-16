import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DownloadReport() {
  const downloadPDF = async () => {
    const element = document.getElementById("report-section");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#020617",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("MediLens_Report.pdf");
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={downloadPDF}
        className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
      >
        ⬇ Download Report PDF
      </button>
    </div>
  );
}
