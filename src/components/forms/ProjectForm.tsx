import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import type { Project, ProjectFormData } from '../../types/project.types';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.number().min(0, 'Budget must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  managerId: z.string().min(1, 'Manager is required'),
  teamMemberIds: z.array(z.string()),
}) as z.ZodSchema<ProjectFormData>;

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  project?: Project;
  loading?: boolean;
}

export const ProjectForm = ({ open, onClose, onSubmit, project, loading }: ProjectFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    // @ts-expect-error - Zod schema type mismatch with react-hook-form
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description,
          budget: project.budget,
          startDate: project.startDate.split('T')[0],
          endDate: project.endDate.split('T')[0],
          managerId: project.managerId,
          teamMemberIds: project.teamMembers.map((m) => m.id),
        }
      : {
          name: '',
          description: '',
          budget: 0,
          startDate: '',
          endDate: '',
          managerId: '',
          teamMemberIds: [],
        },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      container={() => document.body}
    >
      <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
      <form onSubmit={handleSubmit((data: ProjectFormData) => onSubmit(data))}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Project Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="budget"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    onChange={(e) => onChange(Number(e.target.value))}
                    label="Budget"
                    type="number"
                    fullWidth
                    error={!!errors.budget}
                    helperText={errors.budget?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="managerId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Project Manager"
                    fullWidth
                    select
                    error={!!errors.managerId}
                    helperText={errors.managerId?.message}
                  >
                    <MenuItem value="1">Manager 1</MenuItem>
                    <MenuItem value="2">Manager 2</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {project ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
