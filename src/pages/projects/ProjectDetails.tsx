import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { projectApi } from '../../api/project.api';
import type { Project } from '../../types/project.types';
import { formatCurrency, formatDate, formatPercentage, getInitials } from '../../utils/formatters';

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      const data = await projectApi.getById(projectId);
      setProject(data);
    } catch {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Project not found'}</Alert>
      </Container>
    );
  }

  const budgetUtilization = (project.spent / project.budget) * 100;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
        Back to Projects
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {project.name}
        </Typography>
        <Chip
          label={project.status}
          color={
            project.status === 'Active'
              ? 'success'
              : project.status === 'Completed'
              ? 'info'
              : 'default'
          }
        />
      </Box>

      <Grid container spacing={3}>
        {/* Project Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Project Manager
                </Typography>
                <Typography variant="body1">{project.managerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Team Members */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Members
            </Typography>
            <List>
              {project.teamMembers && project.teamMembers.length > 0 ? (
                project.teamMembers.map((member) => (
                  <ListItem key={member.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(member.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={`${member.role} • ${member.email}`}
                    />
                  </ListItem>
                ))
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No team members assigned yet
                </Alert>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Budget Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Budget
              </Typography>
              <Typography variant="h4">{formatCurrency(project.budget)}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Spent
              </Typography>
              <Typography variant="h4">{formatCurrency(project.spent)}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h4">{formatCurrency(project.budget - project.spent)}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Budget Utilization
              </Typography>
              <Typography
                variant="h4"
                color={budgetUtilization > 90 ? 'error' : budgetUtilization > 75 ? 'warning' : 'success'}
              >
                {formatPercentage(budgetUtilization)}
              </Typography>
            </CardContent>
          </Card>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={() => navigate(`/dashboard/project/${project.id}`)}
          >
            View Dashboard
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};
