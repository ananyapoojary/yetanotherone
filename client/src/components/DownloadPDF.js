import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

const soilMetadata = {
  bdod: { name: 'Bulk Density', unit: 'kg/dm³', factor: 0.01 },
  cec: { name: 'Cation Exchange Capacity', unit: 'cmol(c)/kg', factor: 0.1 },
  cfvo: { name: 'Coarse Fragments Volume', unit: 'vol%', factor: 0.1 },
  clay: { name: 'Clay Content', unit: '%', factor: 0.1 },
  nitrogen: { name: 'Total Nitrogen', unit: 'g/kg', factor: 0.01 },
  phh2o: { name: 'pH (H₂O)', unit: '', factor: 0.1 },
  sand: { name: 'Sand Content', unit: '%', factor: 0.1 },
  silt: { name: 'Silt Content', unit: '%', factor: 0.1 },
  soc: { name: 'Organic Carbon', unit: 'g/kg', factor: 0.1 },
  ocd: { name: 'Organic Carbon Density', unit: 'kg/m³', factor: 0.1 },
  ocs: { name: 'Organic Carbon Stock', unit: 'kg/m²', factor: 0.1 },
  wv0010: { name: 'Water @ 0.01 bar', unit: 'cm³/cm³', factor: 0.001 },
  wv0033: { name: 'Water @ 0.33 bar', unit: 'cm³/cm³', factor: 0.001 },
  wv1500: { name: 'Water @ 15 bar', unit: 'cm³/cm³', factor: 0.001 },
  humidity: { name: 'Relative Humidity @ 2m', unit: '%', factor: 1 },
  temperature: { name: 'Temperature @ 2m', unit: '°C', factor: 1 },
  rainfall: { name: 'Rainfall', unit: 'mm', factor: 1 },
  elevation: { name: 'Elevation', unit: 'm', factor: 1 },
};

const DownloadPDF = ({ data, prediction, selectedPosition, addressRef, mapRef }) => {
  const handleDownload = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let yOffset = margin;

    doc.setFontSize(18);
    doc.text('Soil Parameter & Prediction Report', margin, yOffset);
    yOffset += 12;

    if (addressRef?.current?.innerText) {
      const address = addressRef.current.innerText;
      const addressLines = doc.splitTextToSize(`Location: ${address}`, 180);
      doc.setFontSize(12);
      doc.text(addressLines, margin, yOffset);
      yOffset += addressLines.length * 6 + 4;
    }

    if (selectedPosition) {
      const [lat, lng] = selectedPosition;
      doc.setFontSize(12);
      doc.text(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, margin, yOffset);
      yOffset += 8;
    }

    if (mapRef?.current) {
      try {
        const canvas = await html2canvas(mapRef.current, {
          useCORS: true,
          backgroundColor: null,
          allowTaint: true,
          scrollX: 0,
          scrollY: -window.scrollY,
        });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', margin, yOffset, 180, 80);
        yOffset += 90;
      } catch (error) {
        console.error("Error capturing map snapshot:", error);
        doc.setFontSize(12);
        doc.text('Map snapshot could not be captured.', margin, yOffset);
        yOffset += 10;
      }
    }

    if (data) {
      doc.setFontSize(14);
      doc.text('Environmental & Soil Data:', margin, yOffset);
      yOffset += 6;

      const rows = Object.entries(data).map(([key, value]) => {
        const meta = soilMetadata[key] || {};
        const label = meta.name || key.toUpperCase();
        const unit = meta.unit || '';
        const factor = meta.factor ?? 1;
        const val = typeof value === 'number' ? (value * factor).toFixed(2) : value;
        return [label, `${val} ${unit}`.trim()];
      });

      doc.autoTable({
        head: [['Parameter', 'Value']],
        body: rows,
        startY: yOffset,
        styles: { fontSize: 10 },
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], halign: 'center' },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 },
        },
      });

      yOffset = doc.lastAutoTable.finalY + 10;
    }

    if (prediction && !prediction.error) {
      doc.setFontSize(14);
      doc.text('Predicted NPK Values:', margin, yOffset);
      yOffset += 6;

      const predRows = Object.entries(prediction).map(([key, val]) => [
        key.toUpperCase(),
        `${Number(val).toFixed(2)} ratio`,
      ]);

      doc.autoTable({
        head: [['Nutrient', 'Value']],
        body: predRows,
        startY: yOffset,
        styles: { fontSize: 10 },
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], halign: 'center' },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 },
        },
      });

      yOffset = doc.lastAutoTable.finalY + 10;
    }

    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setFontSize(10);
    doc.text(`Generated on: ${formattedDate}`, margin, 290);

    doc.save('soil_report.pdf');
  };

  return (
    <button onClick={handleDownload} style={styles.button}>
      Download Report as PDF
    </button>
  );
};

const styles = {
  button: {
    marginTop: '1.5rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default DownloadPDF;
