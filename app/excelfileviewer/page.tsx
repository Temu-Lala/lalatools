'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Moon, Sun, Download, Upload, Search, BarChart2, FileText, Undo, Redo, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FFCD56', '#4CAF50', '#F44336', '#2196F3',
  '#E91E63', '#3F51B5', '#8BC34A', '#FFC107', '#9C27B0'
];

const ExcelViewer: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(20);
  const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' | null }>({ key: -1, direction: null });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [showChartModal, setShowChartModal] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [chartData, setChartData] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<{ startRow: number; endRow: number; startCol: number; endCol: number } | null>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [editHistory, setEditHistory] = useState<{ data: any[]; action: 'edit' | 'undo' }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedColumns, setSelectedColumns] = useState<number[]>([0, 1]);
  const [datasetColors, setDatasetColors] = useState<{ [key: number]: string }>({ 1: '#FF6384' });
  const { theme, setTheme } = useTheme();
  const tableRef = useRef<HTMLTableElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<any>(null);

  // Initialize column widths and colors
  useEffect(() => {
    if (data.length > 0) {
      setColumnWidths(new Array(data[0]?.length || 0).fill(150));
      const initialColors = selectedColumns.slice(1).reduce((acc, col, i) => {
        acc[col] = defaultColors[i % defaultColors.length];
        return acc;
      }, {} as { [key: number]: string });
      setDatasetColors(initialColors);
    }
  }, [data, selectedColumns]);

  // Handle file input with progress
  const handleFile = useCallback((file: File) => {
    setError(null);
    setProgress(0);
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress((e.loaded / e.total) * 100);
      }
    };
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (!result) throw new Error('Failed to read file');
        const wb = XLSX.read(result, { type: 'binary', cellStyles: true });
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        setData(jsonData);
        setFilteredData(jsonData);
        setEditHistory([{ data: jsonData, action: 'edit' }]);
        setHistoryIndex(0);
        setProgress(100);
      } catch (err) {
        setError('Error reading file: ' + (err as Error).message);
        setProgress(0);
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Handle sheet selection
  const handleSheetChange = (value: string) => {
    if (workbook) {
      setSelectedSheet(value);
      const sheet = workbook.Sheets[value];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setData(jsonData);
      setFilteredData(jsonData);
      setSearchQuery('');
      setCurrentPage(1);
      setSortConfig({ key: -1, direction: null });
      setEditHistory([{ data: jsonData, action: 'edit' }]);
      setHistoryIndex(0);
      setSelectedRange(null);
      setSelectedColumns([0, 1]);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery) {
      const filtered = data.filter((row) =>
        row.some((cell: any) =>
          cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data]);

  // Sorting
  const handleSort = (colIndex: number) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === colIndex && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: colIndex, direction });
    const sortedData = [...filteredData].sort((a, b) => {
      const valA = a[colIndex] ?? '';
      const valB = b[colIndex] ?? '';
      if (direction === 'asc') {
        return valA.toString().localeCompare(valB.toString());
      } else {
        return valB.toString().localeCompare(valB.toString());
      }
    });
    setFilteredData(sortedData);
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Cell editing
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    setCellValue(filteredData[rowIndex][colIndex]?.toString() || '');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCellValue(e.target.value);
  };

  const handleCellBlur = () => {
    if (editingCell && workbook) {
      const newData = [...filteredData];
      newData[editingCell.row][editingCell.col] = cellValue;
      setFilteredData(newData);
      setData(newData);
      const newHistory = editHistory.slice(0, historyIndex + 1).concat([{ data: newData, action: 'edit' }]);
      setEditHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      const sheet = workbook.Sheets[selectedSheet];
      const cellRef = XLSX.utils.encode_cell({ r: editingCell.row, c: editingCell.col });
      sheet[cellRef] = { v: cellValue, t: 's' };
    }
    setEditingCell(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (e.key === 'Enter' && editingCell) {
      handleCellBlur();
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let newRow = rowIndex;
      let newCol = colIndex;
      if (e.key === 'ArrowUp' && rowIndex > 0) newRow--;
      if (e.key === 'ArrowDown' && rowIndex < filteredData.length - 1) newRow++;
      if (e.key === 'ArrowLeft' && colIndex > 0) newCol--;
      if (e.key === 'ArrowRight' && colIndex < (filteredData[0]?.length || 0) - 1) newCol++;
      handleCellClick(newRow, newCol);
    }
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevHistory = editHistory[historyIndex - 1];
      setData(prevHistory.data);
      setFilteredData(prevHistory.data);
      setHistoryIndex(historyIndex - 1);
      if (workbook) {
        const sheet = workbook.Sheets[selectedSheet];
        XLSX.utils.sheet_add_json(sheet, prevHistory.data, { skipHeader: true, origin: 'A1' });
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      const nextHistory = editHistory[historyIndex + 1];
      setData(nextHistory.data);
      setFilteredData(nextHistory.data);
      setHistoryIndex(historyIndex + 1);
      if (workbook) {
        const sheet = workbook.Sheets[selectedSheet];
        XLSX.utils.sheet_add_json(sheet, nextHistory.data, { skipHeader: true, origin: 'A1' });
      }
    }
  };

  // Column resizing
  const handleResize = (colIndex: number, size: number) => {
    setColumnWidths((prev) => {
      const newWidths = [...prev];
      newWidths[colIndex] = Math.max(50, size);
      return newWidths;
    });
  };

  // Range selection
  const handleRangeSelection = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      setSelectedRange((prev) => {
        if (!prev) {
          return { startRow: rowIndex, endRow: rowIndex, startCol: colIndex, endCol: colIndex };
        }
        return { ...prev, endRow: rowIndex, endCol: colIndex };
      });
    } else {
      setSelectedRange({ startRow: rowIndex, endRow: rowIndex, startCol: colIndex, endCol: colIndex });
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (workbook) {
      if (selectedRange) {
        const rangeData = data.slice(selectedRange.startRow, selectedRange.endRow + 1).map((row) =>
          row.slice(selectedRange.startCol, selectedRange.endCol + 1)
        );
        const newWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWb, XLSX.utils.aoa_to_sheet(rangeData), 'SelectedRange');
        const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/vnd.ms-excel' }), 'selected_range.xlsx');
      } else {
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/vnd.ms-excel' }), 'exported_spreadsheet.xlsx');
      }
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (workbook && selectedSheet) {
      const sheet = workbook.Sheets[selectedSheet];
      if (selectedRange) {
        const rangeData = data.slice(selectedRange.startRow, selectedRange.endRow + 1).map((row) =>
          row.slice(selectedRange.startCol, selectedRange.endCol + 1)
        );
        const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(rangeData));
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'selected_range.csv');
      } else {
        const csv = XLSX.utils.sheet_to_csv(sheet);
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${selectedSheet}.csv`);
      }
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    if (workbook && selectedSheet) {
      const doc = new jsPDF();
      doc.text(`Sheet: ${selectedSheet}`, 10, 10);
      let yOffset = 20;
      const exportData = selectedRange
        ? data.slice(selectedRange.startRow, selectedRange.endRow + 1).map((row) =>
          row.slice(selectedRange.startCol, selectedRange.endCol + 1)
        )
        : paginatedData;
      exportData.forEach((row) => {
        row.forEach((cell: any, colIndex: number) => {
          doc.text(cell?.toString() || '', 10 + colIndex * 50, yOffset);
        });
        yOffset += 10;
        if (yOffset > 280) {
          doc.addPage();
          yOffset = 10;
        }
      });
      doc.save(`${selectedSheet}${selectedRange ? '_range' : ''}.pdf`);
    }
  };

  // Chart generation
  const generateChart = () => {
    if (!data.length || selectedColumns.length < 2) return;
    const labels = data.slice(1).map((row) => row[selectedColumns[0]]?.toString() || '');
    const datasets = selectedColumns.slice(1).map((colIndex) => ({
      label: data[0][colIndex] || `Column ${colIndex}`,
      data: data.slice(1).map((row) => parseFloat(row[colIndex]) || 0),
      backgroundColor: datasetColors[colIndex] || defaultColors[0],
      borderColor: datasetColors[colIndex] || defaultColors[0],
      fill: chartType === 'line' ? false : true,
    }));
    setChartData({ labels, datasets });
    setShowChartModal(true);
  };

  // Download chart
  const downloadChart = (format: 'png' | 'svg' | 'pdf') => {
    if (!chartRef.current) return;
    if (format === 'png') {
      const url = chartRef.current.toBase64Image();
      saveAs(url, 'chart.png');
    } else if (format === 'svg') {
      const canvas = chartRef.current.canvas;
      const svg = `<svg>${canvas.toDataURL('image/svg+xml')}</svg>`;
      saveAs(new Blob([svg], { type: 'image/svg+xml' }), 'chart.svg');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Chart Export', 10, 10);
      const imgData = chartRef.current.toBase64Image();
      doc.addImage(imgData, 'PNG', 10, 20, 180, 100);
      doc.save('chart.pdf');
    }
  };

  // Reset colors to default
  const resetColors = () => {
    const newColors = selectedColumns.slice(1).reduce((acc, col, i) => {
      acc[col] = defaultColors[i % defaultColors.length];
      return acc;
    }, {} as { [key: number]: string });
    setDatasetColors(newColors);
    setChartData((prev: any) => ({
      ...prev,
      datasets: prev.datasets.map((ds: any, i: number) => ({
        ...ds,
        backgroundColor: newColors[selectedColumns[i + 1]] || defaultColors[0],
        borderColor: newColors[selectedColumns[i + 1]] || defaultColors[0],
      })),
    }));
  };

  // Formula evaluation
  const calculateFormula = (formula: string, range: { startRow: number; endRow: number; startCol: number; endCol: number }) => {
    const values: number[] = [];
    for (let r = range.startRow; r <= range.endRow; r++) {
      for (let c = range.startCol; c <= range.endCol; c++) {
        const val = parseFloat(data[r][c]);
        if (!isNaN(val)) values.push(val);
      }
    }
    switch (formula.toLowerCase()) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'average':
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return 'Invalid formula';
    }
  };

  // Data statistics
  const getColumnStats = (colIndex: number) => {
    const values = data.slice(1).map((row) => parseFloat(row[colIndex])).filter((v) => !isNaN(v));
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Get cell styles
  const getCellStyle = (rowIndex: number, colIndex: number) => {
    const isSelected =
      selectedRange &&
      rowIndex >= selectedRange.startRow &&
      rowIndex <= selectedRange.endRow &&
      colIndex >= selectedRange.startCol &&
      colIndex <= selectedRange.endCol;
    const style: React.CSSProperties = {};
    if (workbook && selectedSheet) {
      const sheet = workbook.Sheets[selectedSheet];
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      const cell = sheet[cellRef];
      if (cell?.s?.fill?.fgColor?.rgb) {
        style.backgroundColor = `#${cell.s.fill.fgColor.rgb}`;
      }
    }
    if (isSelected) {
      style.border = '2px solid #3B82F6';
    }
    return style;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 flex gap-4"
    >
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold"
          >
            Excel File Viewer
          </motion.h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center',
                isDragging ? 'border-primary bg-primary/10' : 'border-muted'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              whileHover={{ scale: 1.02 }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Drag and drop an Excel file here, or</p>
              <label className="cursor-pointer text-primary hover:underline">
                <span>click to select a file</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsb,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </motion.div>
            {progress > 0 && progress < 100 && (
              <Progress value={progress} className="mt-4" />
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="mb-6 bg-destructive/10">
                <CardContent className="p-4 text-destructive">{error}</CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {sheets.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <Select value={selectedSheet} onValueChange={handleSheetChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select sheet" />
              </SelectTrigger>
              <SelectContent>
                {sheets.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-[200px]">
              <Input
                placeholder="Search data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="w-5 h-5" /> Excel{selectedRange ? ' (Range)' : ''}
            </Button>
            <Button onClick={exportToCSV} variant="secondary" className="flex items-center gap-2">
              <Download className="w-5 h-5" /> CSV{selectedRange ? ' (Range)' : ''}
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> PDF{selectedRange ? ' (Range)' : ''}
            </Button>
            <Button onClick={generateChart} variant="outline" className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Chart
            </Button>
            <Button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Undo className="w-5 h-5" /> Undo
            </Button>
            <Button
              onClick={handleRedo}
              disabled={historyIndex >= editHistory.length - 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Redo className="w-5 h-5" /> Redo
            </Button>
          </div>
        )}

        {paginatedData.length > 0 && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table ref={tableRef}>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {data[0]?.map((header: any, colIndex: number) => (
                      <TableHead
                        key={colIndex}
                        onClick={() => handleSort(colIndex)}
                        className="cursor-pointer hover:bg-muted"
                        style={{ width: `${columnWidths[colIndex]}px`, minWidth: '50px' }}
                      >
                        <div className="flex items-center justify-between">
                          {header}
                          {sortConfig.key === colIndex && (
                            <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                          <div
                            className="w-2 h-full cursor-col-resize"
                            onMouseDown={(e) => {
                              const startX = e.clientX;
                              const startWidth = columnWidths[colIndex];
                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const newWidth = startWidth + (moveEvent.clientX - startX);
                                handleResize(colIndex, newWidth);
                              };
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };
                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.isArray(row) &&
                        row.map((cell, colIndex) => (
                          <TableCell
                            key={colIndex}
                            onClick={(e) => {
                              handleCellClick(rowIndex, colIndex);
                              handleRangeSelection(rowIndex, colIndex, e);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            tabIndex={0}
                            style={{ ...getCellStyle(rowIndex, colIndex), width: `${columnWidths[colIndex]}px` }}
                            className={cn(
                              'p-2',
                              editingCell?.row === rowIndex && editingCell?.col === colIndex
                                ? 'bg-primary/10'
                                : ''
                            )}
                          >
                            {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                              <Input
                                ref={inputRef}
                                value={cellValue}
                                onChange={handleCellChange}
                                onBlur={handleCellBlur}
                                className="w-full h-full"
                              />
                            ) : (
                              cell
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="self-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <Card className="w-[250px]">
          <CardHeader>
            <CardTitle>Data Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Formula</Label>
                <Select
                  onValueChange={(value) => {
                    if (selectedRange) {
                      const result = calculateFormula(value, selectedRange);
                      alert(`Result: ${result}`);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select formula" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="min">Min</SelectItem>
                    <SelectItem value="max">Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedColumns.map((colIndex, i) => (
                i === 0 ? null : (
                  <div key={colIndex}>
                    <Label>{data[0][colIndex] || `Column ${colIndex}`} Stats</Label>
                    <div className="text-sm">
                      {Object.entries(getColumnStats(colIndex)).map(([key, value]) => (
                        <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</p>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showChartModal && chartData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowChartModal(false)}
        >
          <Card className="w-[90%] max-w-[800px]" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Data Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select
                    value={chartType}
                    onValueChange={(value: 'bar' | 'pie' | 'line') => setChartType(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="pie">Pie</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedColumns[0].toString()}
                    onValueChange={(value) => setSelectedColumns([parseInt(value), ...selectedColumns.slice(1)])}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Label column" />
                    </SelectTrigger>
                    <SelectContent>
                      {data[0]?.map((header: any, i: number) => (
                        <SelectItem key={i} value={i.toString()}>
                          {header || `Column ${i}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedColumns.slice(1).join(',')}
                    onValueChange={(value) => {
                      const newCols = [selectedColumns[0], ...value.split(',').map(Number).filter((v) => !isNaN(v))];
                      setSelectedColumns(newCols);
                      const newColors = newCols.slice(1).reduce((acc, col, i) => {
                        acc[col] = datasetColors[col] || defaultColors[i % defaultColors.length];
                        return acc;
                      }, {} as { [key: number]: string });
                      setDatasetColors(newColors);
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Data columns" />
                    </SelectTrigger>
                    <SelectContent>
                      {data[0]?.map((header: any, i: number) => (
                        i !== selectedColumns[0] && (
                          <SelectItem key={i} value={i.toString()}>
                            {header || `Column ${i}`}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Dataset Colors</Label>
                    <Button variant="ghost" size="sm" onClick={resetColors} aria-label="Reset colors">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  <TooltipProvider>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedColumns.slice(1).map((colIndex) => (
                        <motion.div
                          key={colIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                type="color"
                                value={datasetColors[colIndex] || defaultColors[0]}
                                onChange={(e) => {
                                  const newColors = { ...datasetColors, [colIndex]: e.target.value };
                                  setDatasetColors(newColors);
                                  setChartData((prev: any) => ({
                                    ...prev,
                                    datasets: prev.datasets.map((ds: any, i: number) => ({
                                      ...ds,
                                      backgroundColor: newColors[selectedColumns[i + 1]] || defaultColors[0],
                                      borderColor: newColors[selectedColumns[i + 1]] || defaultColors[0],
                                    })),
                                  }));
                                }}
                                className="w-10 h-10"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              {data[0][colIndex] || `Column ${colIndex}`}
                            </TooltipContent>
                          </Tooltip>
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: datasetColors[colIndex] || defaultColors[0] }}
                          />
                          <span className="truncate">{data[0][colIndex] || `Column ${colIndex}`}</span>
                        </motion.div>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
              <div className="relative h-[400px]">
                {chartType === 'bar' ? (
                  <Bar ref={chartRef} data={chartData} />
                ) : chartType === 'pie' ? (
                  <Pie ref={chartRef} data={chartData} />
                ) : (
                  <Line ref={chartRef} data={chartData} />
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => downloadChart('png')} variant="outline">
                  Save as PNG
                </Button>
                <Button onClick={() => downloadChart('svg')} variant="outline">
                  Save as SVG
                </Button>
                <Button onClick={() => downloadChart('pdf')} variant="outline">
                  Save as PDF
                </Button>
                <Button onClick={() => setShowChartModal(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExcelViewer;