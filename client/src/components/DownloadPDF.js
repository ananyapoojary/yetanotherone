import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable'; 
// import autoTable from 'jspdf-autotable';

// // Register autoTable plugin
// autoTable(jsPDF);

const DownloadPDF = ({ data, prediction, selectedPosition, addressRef, mapRef }) => {
  const handleDownload = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let yOffset = margin;

    // Title
    doc.setFontSize(18);
    doc.text('🌾 Soil Parameter & Prediction Report', margin, yOffset);
    yOffset += 12;

    // Address
    if (addressRef?.current?.innerText) {
      const address = addressRef.current.innerText;
      const addressLines = doc.splitTextToSize(`📍 Location: ${address}`, 180);
      doc.setFontSize(12);
      doc.text(addressLines, margin, yOffset);
      yOffset += addressLines.length * 6 + 4;
    }

    // Coordinates
    if (selectedPosition) {
      const [lat, lng] = selectedPosition;
      doc.setFontSize(12);
      doc.text(`🌐 Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, margin, yOffset);
      yOffset += 8;
    }

    // Map Snapshot
    if (mapRef?.current) {
      const canvas = await html2canvas(mapRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', margin, yOffset, 180, 80);
      yOffset += 90;
    }

    // Fetched Data Table
    if (data) {
      doc.setFontSize(14);
      doc.text('🧪 Environmental & Soil Data:', margin, yOffset);
      yOffset += 6;

      const rows = Object.entries(data).map(([key, value]) => {
        const label = formatLabel(key);
        const val = typeof value === 'number' ? value.toFixed(2) : value;
        const unit = getUnit(key);
        return [label, `${val} ${unit}`];
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

    // Prediction Table
    if (prediction && !prediction.error) {
      doc.setFontSize(14);
      doc.text('🌱 Predicted NPK Values:', margin, yOffset);
      yOffset += 6;

      const predRows = Object.entries(prediction).map(([key, val]) => [
        key.toUpperCase(),
        `${val.toFixed(2)} ratio`,
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
    }

    doc.save('soil_report.pdf');
  };

  const formatLabel = (key) =>
    ({
      bdod: 'Bulk Density',
      cec: 'Cation Exchange Capacity',
      cfvo: 'Coarse Fragments Volume',
      clay: 'Clay Content',
      nitrogen: 'Total Nitrogen',
      phh2o: 'pH (H₂O)',
      sand: 'Sand Content',
      silt: 'Silt Content',
      soc: 'Organic Carbon',
      ocd: 'Organic Carbon Density',
      ocs: 'Organic Carbon Stock',
      wv0010: 'Water @ 0.01 bar',
      wv0033: 'Water @ 0.33 bar',
      wv1500: 'Water @ 15 bar',
      humidity: 'Relative Humidity @ 2m',
      temperature: 'Temperature @ 2m',
      rainfall: 'Rainfall',
      elevation: 'Elevation',
    }[key] || key.toUpperCase());

  const getUnit = (key) =>
    ({
      bdod: 'kg/dm³',
      cec: 'cmol(c)/kg',
      cfvo: 'vol%',
      clay: '%',
      nitrogen: 'g/kg',
      phh2o: '',
      sand: '%',
      silt: '%',
      soc: 'g/kg',
      ocd: 'kg/m³',
      ocs: 'kg/m²',
      wv0010: 'cm³/cm³',
      wv0033: 'cm³/cm³',
      wv1500: 'cm³/cm³',
      humidity: '%',
      temperature: '°C',
      rainfall: 'mm',
      elevation: 'm',
    }[key] || '');

  return (
    <button onClick={handleDownload} style={styles.button}>
      📄 Download Report as PDF
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
