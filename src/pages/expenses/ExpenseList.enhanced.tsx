import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Card,
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSnackbar } from 'notistack';
import type { Expense, ExpenseFormData } from '../../types/expense.types';
import { expenseApi } from '../../api/expense.api';
import { projectApi } from '../../api/project.api';
import { formatCurrency } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import { ExpenseForm } from '../../components/forms/ExpenseForm';

export const ExpenseList = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { canCreateExpense } = usePermissions();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getAll();
      setExpenses(data);
    } catch (error) {
      enqueueSnackbar('Failed to load expenses', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data.map(p => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error('Failed to load projects', error);
    }
  };

  const handleFormSubmit = async (data: ExpenseFormData, billFile?: File) => {
    try {
      const formData = new FormData();
      formData.append('projectId', data.projectId);
      formData.append('category', data.category);
      formData.append('amount', data.amount.toString());
      formData.append('vendor', data.vendor);
      formData.append('description', data.description);
      formData.append('date', data.date);
      formData.append('status', data.status);
      if (billFile) formData.append('billFile', billFile);

      await expenseApi.create(formData);
      setFormOpen(false);
      fetchExpenses();
      enqueueSnackbar('Expense created successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to create expense', { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
      Draft: 'default',
      'Pending Approval': 'warning',
      Approved: 'success',
      Rejected: 'error',
      Paid: 'info',
    };
    return colors[status] || 'default';
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      Object.values(expense).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [expenses, searchTerm]);

  const handleExport = () => {
    const csv = [
      ['ID', 'Project', 'Category', 'Amount', 'Status', 'Date', 'Vendor'].join(','),
      ...filteredExpenses.map((expense) =>
        [
          expense.id,
          expense.projectName,
          expense.category,
          expense.amount,
          expense.status,
          format(new Date(expense.date), 'yyyy-MM-dd'),
          expense.vendor,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    enqueueSnackbar('Expenses exported successfully', { variant: 'success' });
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={500}>
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'projectName',
      headerName: 'Project',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {formatCurrency(params.value as number)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value as string}
          color={getStatusColor(params.value as string)}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        format(new Date(params.value as string), 'MMM dd, yyyy'),
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/expenses/${params.row.id}`)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ px: { xs: 0, sm: 0 } }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={{ xs: 3, sm: 4 }} 
        spacing={{ xs: 2, sm: 0 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
            Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
            Manage and track all project expenses
          </Typography>
        </Box>
        <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={filteredExpenses.length === 0}
            size="medium"
          >
            Export
          </Button>
          {canCreateExpense && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
              size="medium"
            >
              Add Expense
            </Button>
          )}
        </Stack>
      </Stack>

      <Card sx={{ mb: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <TextField
            fullWidth
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: 1.5,
                '& fieldset': {
                  borderColor: 'divider',
                },
              } 
            }}
          />
        </Box>
      </Card>

      <Card sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={filteredExpenses}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: 'divider',
              py: 1.5,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'action.hover',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: 'divider',
              bgcolor: 'background.default',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
              cursor: 'pointer',
            },
          }}
          onRowClick={(params) => navigate(`/expenses/${params.id}`)}
        />
      </Card>

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        projects={projects}
      />
    </Box>
  );
};
