// ============================================================
// exportUtils.ts — Utility untuk export CSV dan cetak laporan
// ============================================================

/** Unduh data sebagai file CSV */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][][]) {
  const csvRows: string[] = []
  csvRows.push(headers.join(','))
  rows.forEach(row => {
    csvRows.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  })
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Buka jendela print dengan HTML yang diberikan */
export function printHTML(title: string, bodyHTML: string) {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Popup diblokir. Izinkan popup untuk mencetak.')
    return
  }
  win.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #1a56db; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 16px; font-weight: 700; color: #1a56db; }
    .header p  { font-size: 11px; color: #555; margin-top: 4px; }
    .meta { display: flex; gap: 32px; margin-bottom: 16px; font-size: 11px; color: #444; }
    .meta strong { color: #111; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1a56db; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
    .badge-green  { background: #d1fae5; color: #065f46; }
    .badge-orange { background: #fef3c7; color: #92400e; }
    .badge-red    { background: #fee2e2; color: #991b1b; }
    .badge-blue   { background: #dbeafe; color: #1e40af; }
    .footer { text-align: right; font-size: 10px; color: #888; margin-top: 8px; }
    .summary { display: flex; gap: 16px; margin-bottom: 16px; }
    .summary-box { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
    .summary-box .label { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
    .summary-box .value { font-size: 20px; font-weight: 700; color: #1a56db; }
    @media print {
      body { padding: 10px; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
  ${bodyHTML}
  <div class="footer">Dicetak pada: ${new Date().toLocaleString('id-ID')} · SIMAGANG – Diskominfo Humaspendis</div>
  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`)
  win.document.close()
}

