import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Bar, Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function PreviewDashboardTrenDigital() {
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState({
    usage: { labels: [], datasets: [] },
    trends: { labels: [], datasets: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data.json");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const exportPDF = async () => {
    const element = document.getElementById("dashboard");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("dashboard-tren-digital.pdf");
  };

  if (loading) return <p className="p-6">Loading data tren digital...</p>;

  return (
    <div className="p-6" id="dashboard">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Preview Dashboard Tren Digital</h1>
        <Button onClick={exportPDF}>Export PDF</Button>
      </div>
      <div className="mb-6">
        <Select onValueChange={setFilter} defaultValue="all">
          <SelectTrigger className="w-64">Filter Kategori</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="hiburan">Hiburan</SelectItem>
            <SelectItem value="edukasi">Edukasi</SelectItem>
            <SelectItem value="budaya">Budaya Kerja</SelectItem>
            <SelectItem value="asn">Pelatihan ASN</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Distribusi Waktu Media Sosial</CardTitle>
        </CardHeader>
        <CardContent>
          {data.usage?.labels?.length && data.usage?.datasets?.length ? (
            <Bar data={data.usage} />
          ) : (
            <p>Data tidak tersedia.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Engagement Tren Per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {data.trends?.labels?.length && data.trends?.datasets?.length ? (
            <Line data={data.trends} />
          ) : (
            <p>Data tidak tersedia.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
