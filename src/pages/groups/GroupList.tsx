import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { groupApi } from '../../api/group.api';
import type { Group, GroupFormData, GroupType } from '../../types/group.types';
import { useSnackbar } from 'notistack';

const GROUP_TYPES: { value: GroupType; label: string }[] = [
  { value: 'trip', label: 'Trip' },
  { value: 'roommates', label: 'Roommates' },
  { value: 'event', label: 'Event' },
  { value: 'project', label: 'Project' },
  { value: 'household', label: 'Household' },
  { value: 'other', label: 'Other' },
];

export const GroupList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newMemberName, setNewMemberName] = useState('');
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    type: 'other',
    members: [],
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getAll();
      setGroups(data);
    } catch {
      enqueueSnackbar('Failed to load groups', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await groupApi.create(formData);
      enqueueSnackbar('Group created successfully', { variant: 'success' });
      setFormOpen(false);
      setFormData({ name: '', description: '', type: 'other', members: [] });
      fetchGroups();
    } catch {
      enqueueSnackbar('Failed to create group', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this group?')) return;
    
    try {
      await groupApi.deactivate(id);
      enqueueSnackbar('Group deactivated', { variant: 'success' });
      fetchGroups();
    } catch {
      enqueueSnackbar('Failed to deactivate group', { variant: 'error' });
    }
  };

  const openAddMemberDialog = (groupId: string) => {
    setSelectedGroupId(groupId);
    setNewMemberName('');
    setAddMemberOpen(true);
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      enqueueSnackbar('Please enter member name', { variant: 'warning' });
      return;
    }

    try {
      await groupApi.addMember(selectedGroupId, newMemberName);
      enqueueSnackbar('Member added successfully', { variant: 'success' });
      setAddMemberOpen(false);
      setNewMemberName('');
      fetchGroups();
    } catch (error: any) {
      console.error('Failed to add member:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to add member';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const getGroupTypeColor = (type: GroupType) => {
    const colors: Record<GroupType, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'> = {
      trip: 'primary',
      roommates: 'secondary',
      event: 'success',
      project: 'info',
      household: 'warning',
      other: 'default' as 'info',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Groups</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          New Group
        </Button>
      </Box>

      {groups.length === 0 ? (
        <Alert severity="info">
          No groups yet. Create a group to start tracking shared expenses!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} md={6} lg={4} key={group.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GroupIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">{group.name}</Typography>
                    </Box>
                    <Chip
                      label={GROUP_TYPES.find(t => t.value === group.type)?.label}
                      color={getGroupTypeColor(group.type)}
                      size="small"
                    />
                  </Box>
                  
                  {group.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {group.members.length + (group.guestMembers?.length || 0)} member{(group.members.length + (group.guestMembers?.length || 0)) !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {group.members.slice(0, 3).map((member) => (
                      <ListItem key={member.id}>
                        <ListItemText
                          primary={member.name}
                          secondary={member.email}
                        />
                      </ListItem>
                    ))}
                    {group.guestMembers?.map((guestName) => (
                      <ListItem key={guestName}>
                        <ListItemText
                          primary={guestName}
                          secondary="Guest member"
                        />
                      </ListItem>
                    ))}
                    {(group.members.length + (group.guestMembers?.length || 0)) > 3 && (
                      <ListItem key={`${group.id}-more`}>
                        <ListItemText
                          secondary={`+${(group.members.length + (group.guestMembers?.length || 0)) - 3} more`}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<PersonAddIcon />}
                    onClick={() => openAddMemberDialog(group.id)}
                  >
                    Add Member
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(group.id)}
                    sx={{ ml: 'auto' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Group Dialog */}
      {formOpen && (
        <Dialog
          open={formOpen}
          onClose={() => setFormOpen(false)}
          maxWidth="sm"
          fullWidth
        >
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Group Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Group Type"
                fullWidth
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as GroupType })}
              >
                {GROUP_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                You'll be automatically added as a member. You can add more members after creating the group.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name}>
            Create Group
          </Button>
        </DialogActions>
        </Dialog>
      )}

      {/* Add Member Dialog */}
      {addMemberOpen && (
        <Dialog
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          maxWidth="sm"
          fullWidth
        >
        <DialogTitle>Add Member to Group</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Member Name"
                fullWidth
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Enter member's name"
                helperText="Enter the full name of the member you want to add"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Add members by name. They don't need an account to be added to the group.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={!newMemberName.trim()}>
            Add Member
          </Button>
        </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};
