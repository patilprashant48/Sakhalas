import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { projectApi } from '../../api/project.api';
import type { Project, ProjectFormData } from '../../types/project.types';
import { ProjectForm } from '../../components/forms/ProjectForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { usePermissions } from '../../hooks/usePermissions';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

export const ProjectList = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; projectId: string | null }>({
    open: false,
    projectId: null,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProject(undefined);
    setFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      if (selectedProject) {
        await projectApi.update(selectedProject.id, data);
      } else {
        await projectApi.create(data);
      }
      setFormOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to save project', err);
    }
  };

  const handleArchive = async (projectId: string) => {
    try {
      await projectApi.archive(projectId);
      setConfirmDialog({ open: false, projectId: null });
      fetchProjects();
    } catch (err) {
      console.error('Failed to archive project', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Archived':
        return 'default';
      case 'On Hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: { xs: 3, sm: 4 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
            Manage all project budgets and timelines
          </Typography>
        </Box>
        {permissions.canCreateProject && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} size="medium">
            New Project
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Budget</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Spent</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Utilization</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const utilization = (project.spent / project.budget) * 100;
              return (
                <TableRow key={project.id} hover>
                  <TableCell sx={{ py: 2 }}>{project.name}</TableCell>
                  <TableCell sx={{ py: 2 }}>{project.managerName}</TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>{formatCurrency(project.budget)}</TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>{formatCurrency(project.spent)}</TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Chip
                      label={formatPercentage(utilization)}
                      color={utilization > 90 ? 'error' : utilization > 75 ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={project.status} color={getStatusColor(project.status)} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(project.endDate)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => navigate(`/projects/${project.id}`)}>
                      <VisibilityIcon />
                    </IconButton>
                    {permissions.canEditProject && (
                      <IconButton size="small" onClick={() => handleEdit(project)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    {permissions.canEditProject && project.status !== 'Archived' && (
                      <IconButton
                        size="small"
                        onClick={() => setConfirmDialog({ open: true, projectId: project.id })}
                      >
                        <ArchiveIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ProjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        project={selectedProject}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Archive Project"
        message="Are you sure you want to archive this project? This action can be reversed."
        onConfirm={() => confirmDialog.projectId && handleArchive(confirmDialog.projectId)}
        onCancel={() => setConfirmDialog({ open: false, projectId: null })}
        confirmText="Archive"
        confirmColor="warning"
      />
    </Container>
  );
};
