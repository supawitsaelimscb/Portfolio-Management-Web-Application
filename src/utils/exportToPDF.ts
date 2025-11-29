import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import type { Portfolio } from '../types/portfolio';
import type { Transaction } from '../types/transaction';
import type { PortfolioStats } from '../hooks/usePortfolio';
import { INVESTMENT_TYPES } from '../types/portfolio';

interface PDFReportOptions {
  portfolios: Portfolio[];
  transactions?: Transaction[];
  stats?: PortfolioStats;
  appUser?: {
    displayName: string;
    email: string;
  };
  includeCharts?: boolean;
  chartElements?: {
    distributionChart?: HTMLElement;
    performanceChart?: HTMLElement;
  };
}

export async function generatePortfolioReport(options: PDFReportOptions): Promise<void> {
  const {
    portfolios,
    transactions = [],
    stats,
    appUser,
    includeCharts = false,
    chartElements,
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMMM dd, yyyy'), pageWidth / 2, 30, { align: 'center' });

  yPosition = 50;

  // User Information
  if (appUser) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Information', 20, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${appUser.displayName || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Email: ${appUser.email || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Report Generated: ${format(new Date(), 'PPpp')}`, 20, yPosition);
    yPosition += 15;
  }

  // Portfolio Summary
  if (stats) {
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Portfolio Summary', 20, yPosition);
    yPosition += 10;

    // Summary table
    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: [
        ['Total Portfolios', portfolios.length.toString()],
        ['Total Value', `THB ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Total Invested', `THB ${stats.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Total Return', `THB ${stats.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Return Percentage', `${stats.returnPercentage.toFixed(2)}%`],
        ['Total Transactions', stats.transactionCount.toString()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Portfolio Distribution by Type
  checkPageBreak(60);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Distribution by Type', 20, yPosition);
  yPosition += 10;

  const typeBreakdown = portfolios.reduce((acc, portfolio) => {
    const type = portfolio.investmentType;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        totalValue: 0,
        totalInvested: 0,
      };
    }
    acc[type].count++;
    acc[type].totalValue += portfolio.currentValue;
    acc[type].totalInvested += portfolio.totalInvested;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; totalInvested: number }>);

  const distributionData = Object.entries(typeBreakdown).map(([type, data]) => {
    const typeInfo = INVESTMENT_TYPES[type as keyof typeof INVESTMENT_TYPES];
    const percentage = stats ? (data.totalValue / stats.totalValue) * 100 : 0;
    return [
      typeInfo.label,
      data.count.toString(),
      `THB ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `THB ${data.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `${percentage.toFixed(1)}%`,
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Investment Type', 'Count', 'Current Value', 'Total Invested', 'Portfolio %']],
    body: distributionData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 9, font: 'helvetica' },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Individual Portfolios
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Individual Portfolios', 20, yPosition);
  yPosition += 10;

  portfolios.forEach((portfolio) => {
    checkPageBreak(40);

    const typeInfo = INVESTMENT_TYPES[portfolio.investmentType];
    
    autoTable(doc, {
      startY: yPosition,
      head: [[portfolio.name]],
      body: [
        ['Investment Type', typeInfo.label],
        ['Current Value', `THB ${portfolio.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Total Invested', `THB ${portfolio.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Total Return', `THB ${portfolio.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ['Return %', `${portfolio.returnPercentage.toFixed(2)}%`],
        ['Transactions', portfolio.transactionCount.toString()],
        ...(portfolio.targetAmount ? [['Target Amount', `THB ${portfolio.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`]] : []),
        ...(portfolio.targetAmount ? [['Target Progress', `${Math.min((portfolio.currentValue / portfolio.targetAmount) * 100, 100).toFixed(1)}%`]] : []),
        ...(portfolio.description ? [['Description', portfolio.description]] : []),
      ],
      theme: 'plain',
      headStyles: { 
        fillColor: [59, 130, 246], 
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
      },
      styles: { fontSize: 9, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });

  // Recent Transactions
  if (transactions.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Transactions', 20, yPosition);
    yPosition += 10;

    const recentTransactions = transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20);

    const transactionData = recentTransactions.map((t) => {
      const portfolio = portfolios.find(p => p.id === t.portfolioId);
      const typeInfo = portfolio ? INVESTMENT_TYPES[portfolio.investmentType] : null;
      
      return [
        format(t.date, 'yyyy-MM-dd'),
        typeInfo ? typeInfo.label : 'N/A',
        portfolio?.name || 'Unknown',
        t.type === 'deposit' ? 'Deposit' : 'Withdrawal',
        `THB ${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Type', 'Portfolio', 'Transaction', 'Amount']],
      body: transactionData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 8, font: 'helvetica' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { halign: 'right', cellWidth: 35 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Charts (if included)
  if (includeCharts && chartElements) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Charts & Analytics', 20, yPosition);
    yPosition += 10;

    // Distribution Chart
    if (chartElements.distributionChart) {
      try {
        const canvas = await html2canvas(chartElements.distributionChart, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        checkPageBreak(imgHeight + 20);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Portfolio Distribution', 20, yPosition);
        yPosition += 10;
        
        doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.error('Error capturing distribution chart:', error);
      }
    }

    // Performance Chart
    if (chartElements.performanceChart) {
      try {
        checkPageBreak(100);
        
        const canvas = await html2canvas(chartElements.performanceChart, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        checkPageBreak(imgHeight + 20);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Over Time', 20, yPosition);
        yPosition += 10;
        
        doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.error('Error capturing performance chart:', error);
      }
    }
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Portfolio Management Web Application',
      20,
      pageHeight - 10
    );
    doc.text(
      format(new Date(), 'yyyy-MM-dd HH:mm'),
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `Portfolio-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}

// Export individual portfolio report
export async function generateSinglePortfolioReport(
  portfolio: Portfolio,
  transactions: Transaction[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const typeInfo = INVESTMENT_TYPES[portfolio.investmentType];

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(portfolio.name, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`${typeInfo.label} Portfolio Report`, pageWidth / 2, 30, { align: 'center' });

  yPosition = 55;

  // Portfolio Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Portfolio Summary', 20, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: [
      ['Current Value', `THB ${portfolio.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Total Invested', `THB ${portfolio.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Total Return', `THB ${portfolio.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
      ['Return Percentage', `${portfolio.returnPercentage.toFixed(2)}%`],
      ['Number of Transactions', portfolio.transactionCount.toString()],
      ...(portfolio.targetAmount ? [['Target Amount', `THB ${portfolio.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`]] : []),
      ...(portfolio.targetAmount ? [['Progress to Target', `${Math.min((portfolio.currentValue / portfolio.targetAmount) * 100, 100).toFixed(1)}%`]] : []),
      ['Created', format(portfolio.createdAt, 'PPP')],
      ['Last Updated', format(portfolio.updatedAt, 'PPP')],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { halign: 'right' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Transactions
  if (transactions.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History', 20, yPosition);
    yPosition += 10;

    const transactionData = transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((t) => [
        format(t.date, 'yyyy-MM-dd'),
        t.type === 'deposit' ? 'Deposit' : 'Withdrawal',
        `THB ${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        t.mutualFundDetails?.fundName || t.stockDetails?.stockName || '-',
        t.notes || '-',
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Type', 'Amount', 'Details', 'Notes']],
      body: transactionData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 8, font: 'helvetica' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { halign: 'right', cellWidth: 30 },
        3: { cellWidth: 50 },
        4: { cellWidth: 'auto' },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const fileName = `${portfolio.name.replace(/[^a-z0-9]/gi, '-')}-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
