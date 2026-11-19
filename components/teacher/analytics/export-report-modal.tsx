import React from 'react';
import { ActivityTypeFilter } from '../../../src/services/analytics';
import { FilterPeriod } from '../../../src/utils/dashboardFilters';
import { ParentExportModal, ParentExportOptions } from '../../parent/parent-export-modal';

export interface TeacherExportOptions {
  period: FilterPeriod;
  startDate: Date | null;
  endDate: Date | null;
  label: string;
  format: 'pdf' | 'excel';
  activityType: ActivityTypeFilter;
}

interface ExportReportModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (options: TeacherExportOptions) => void;
  isLoading?: boolean;
  isTablet: boolean;
  studentName?: string;
}

export function ExportReportModal({
  visible,
  onClose,
  onGenerate,
  isLoading = false,
  isTablet,
  studentName = 'Student',
}: ExportReportModalProps) {
  const handleConfirm = (options: ParentExportOptions) => {
    onGenerate({
      period: options.period,
      startDate: options.startDate ?? null,
      endDate: options.endDate ?? null,
      label: options.timeframeLabel,
      format: options.format ?? 'pdf',
      activityType: options.activityType,
    });
  };

  return (
    <ParentExportModal
      visible={visible}
      onClose={onClose}
      isTablet={isTablet}
      studentName={studentName}
      title="Download Student Report"
      description={`Select the date range and activity source for ${studentName}'s official progress report.`}
      isExporting={isLoading}
      showExcelDownload
      onConfirmExport={handleConfirm}
    />
  );
}
