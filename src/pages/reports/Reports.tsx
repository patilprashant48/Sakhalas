import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useSnackbar } from 'notistack';
import { usePermissions } from '../../hooks/usePermissions';
import { dashboardApi } from '../../api/dashboard.api';

export const Reports = () => {
  const permissions = usePermissions();
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    projectId: '',
    reportType: 'company',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (type: 'pdf' | 'csv') => {
    if (!permissions.canExportReports) {
      setError('You do not have permission to export reports');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = await dashboardApi.exportReport({
        type,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        projectId: filters.projectId || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${new Date().toISOString().split('T')[0]}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      enqueueSnackbar(`Report exported successfully as ${type.toUpperCase()}`, { variant: 'success' });
    } catch (_err) {
      console.error('Export error:', _err);
      setError('Failed to export report. Please try again.');
      enqueueSnackbar('Failed to export report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.hasPermission('view_reports')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">You do not have permission to view reports</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
          Reports & Export
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and export comprehensive financial reports
        </Typography>
      </Box>

      <Paper sx={{ p: { xs: 2.5, sm: 3, md: 4 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Filter Options
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="reportType"
              label="Report Type"
              select
              value={filters.reportType}
              onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
            >
              <MenuItem value="company">Company Overview</MenuItem>
              <MenuItem value="project">Project Details</MenuItem>
              <MenuItem value="expenses">Expense Report</MenuItem>
              <MenuItem value="payments">Payment Report</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="projectId"
              label="Project (Optional)"
              select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            >
              <MenuItem value="">All Projects</MenuItem>
              <MenuItem value="1">Project 1</MenuItem>
              <MenuItem value="2">Project 2</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleExport('pdf')}
            disabled={loading || !permissions.canExportReports}
            size="large"
            sx={{ minWidth: { xs: '100%', sm: 'auto' }, py: 1.25 }}
          >
            Export as PDF
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<TableChartIcon />}
            onClick={() => handleExport('csv')}
            disabled={loading || !permissions.canExportReports}
            size="large"
            sx={{ minWidth: { xs: '100%', sm: 'auto' }, py: 1.25 }}
          >
            Export as CSV
          </Button>
        </Box>

        {!permissions.canExportReports && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You do not have permission to export reports. Contact your administrator.
          </Alert>
        )}

        <Box sx={{ mt: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 }, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Report Description
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.7 }}>
            {filters.reportType === 'company' &&
              'Company Overview includes total budget, expenses by project, expenses by category, and overdue payments.'}
            {filters.reportType === 'project' &&
              'Project Details includes budget vs spent, team members, expense breakdown, and payment status.'}
            {filters.reportType === 'expenses' &&
              'Expense Report includes all expenses with filtering options by date range, project, and category.'}
            {filters.reportType === 'payments' &&
              'Payment Report includes all payment transactions with detailed payment history and proof attachments.'}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontStyle: 'italic' }}>
            Date range filter is optional. If not specified, all records will be included in the report.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
