import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';

const DownloadPDF = ({ data, prediction, selectedPosition, addressRef, mapRef }) => {
  const handleDownload = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let yOffset = margin;

    // Title
    doc.setFontSize(18);
    doc.text('Soil Parameter & Prediction Report', margin, yOffset);
    yOffset += 12;

    // Timestamp
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, 210 - margin, yOffset - 6, { align: 'right' });

    // Address
    if (addressRef?.current?.innerText) {
      const address = addressRef.current.innerText.replace(/[^\x00-\x7F]/g, ''); // remove non-ASCII
      const addressLines = doc.splitTextToSize(`Location: ${address}`, 180);
      doc.setFontSize(12);
      doc.text(addressLines, margin, yOffset);
      yOffset += addressLines.length * 6 + 4;
    }

    // Coordinates
    if (selectedPosition) {
      const [lat, lng] = selectedPosition;
      doc.text(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, margin, yOffset);
      yOffset += 8;
    }

    // Map Snapshot
    if (mapRef?.current) {
      try {
        const canvas = await html2canvas(mapRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', margin, yOffset, 180, 80);
        yOffset += 90;
      } catch (err) {
        console.error('Map snapshot failed:', err);
        doc.text('⚠️ Failed to capture map snapshot', margin, yOffset);
        yOffset += 10;
      }
    }

    // Fetched Data Table
    if (data) {
      doc.setFontSize(14);
      doc.text('Environmental & Soil Data:', margin, yOffset);
      yOffset += 6;

      const rows = Object.entries(data).map(([key, value]) => {
        const label = formatLabel(key);
        const numeric = parseFloat(value);
        const val = isNaN(numeric) ? value : normalizeValue(key, numeric).toFixed(2);
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
      doc.text('Predicted NPK Values:', margin, yOffset);
      yOffset += 6;

      const predRows = Object.entries(prediction).map(([key, val]) => {
        const label = key.toUpperCase();
        const value = typeof val === 'number' ? val.toFixed(2) : val;
        return [label, `${value} ratio`];
      });

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

    const fileName = `soil_report_${Date.now()}.pdf`;
    doc.save(fileName);
  };

  const normalizeValue = (key, value) => {
    const scale = {
      bdod: 100,
      cec: 10,
      cfvo: 10,
      clay: 10,
      nitrogen: 100,
      phh2o: 10,
      sand: 10,
      silt: 10,
      soc: 10,
      ocd: 10,
      ocs: 10,
      wv0010: 1000,
      wv0033: 1000,
      wv1500: 1000,
      humidity: 1,
      temperature: 1,
      rainfall: 1,
      elevation: 1,
    };

    const factor = scale[key.toLowerCase()] || 1;
    return value / factor;
  };

  const formatLabel = (key) =>
    ({
      latitude: 'LATITUDE',
      longitude: 'LONGITUDE',
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
    }[key.toLowerCase()] || key.toUpperCase());

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
    }[key.toLowerCase()] || '');

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
