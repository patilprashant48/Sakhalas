import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { splitApi } from '../../api/split.api';
import { groupApi } from '../../api/group.api';
import type { UserBalances, SettlementFormData } from '../../types/split.types';
import type { Group } from '../../types/group.types';
import { formatCurrency } from '../../utils/formatters';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSnackbar } from 'notistack';

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'upi', 'card', 'wallet', 'other'] as const;

export const BalancesDashboard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [balances, setBalances] = useState<UserBalances | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [settleData, setSettleData] = useState<SettlementFormData>({
    toUser: '',
    amount: 0,
    method: 'cash',
  });

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, [selectedGroup]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await splitApi.getBalances(selectedGroup || undefined);
      setBalances(data);
    } catch {
      enqueueSnackbar('Failed to load balances', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await groupApi.getAll();
      setGroups(data);
    } catch {
      enqueueSnackbar('Failed to load groups', { variant: 'error' });
    }
  };

  const handleSettle = async () => {
    try {
      await splitApi.createSettlement(settleData);
      enqueueSnackbar('Settlement recorded successfully', { variant: 'success' });
      setSettleDialogOpen(false);
      setSettleData({ toUser: '', amount: 0, method: 'cash' });
      fetchData();
    } catch {
      enqueueSnackbar('Failed to record settlement', { variant: 'error' });
    }
  };

  const openSettleDialog = (toUserId: string, amount: number) => {
    setSettleData({
      toUser: toUserId,
      amount,
      method: 'cash',
      groupId: selectedGroup || undefined,
    });
    setSettleDialogOpen(true);
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
        <Typography variant="h4">Balances</Typography>
        <TextField
          select
          label="Filter by Group"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          sx={{ minWidth: 200 }}
          size="small"
        >
          <MenuItem value="">All Groups</MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Net Balance Card */}
      <Paper sx={{ p: 3, mb: 3, background: balances && balances.netBalance >= 0 ? 
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 48, mr: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Net Balance</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(balances?.netBalance || 0)}
            </Typography>
            <Typography variant="body2">
              {balances && balances.netBalance >= 0 ? 'You are owed overall' : 'You owe overall'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* You Owe */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">You Owe</Typography>
              </Box>
              
              {balances && balances.youOwe.length > 0 ? (
                <List>
                  {balances.youOwe.map((debt) => (
                    <ListItem
                      key={debt.toUserId}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openSettleDialog(debt.toUserId, debt.amount)}
                        >
                          Settle Up
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={debt.toUserId}
                        secondary={
                          <Chip
                            label={formatCurrency(debt.amount)}
                            color="error"
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="success">You don't owe anyone!</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* You Are Owed */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">You Are Owed</Typography>
              </Box>
              
              {balances && balances.youAreOwed.length > 0 ? (
                <List>
                  {balances.youAreOwed.map((credit) => (
                    <ListItem key={credit.fromUserId}>
                      <ListItemText
                        primary={credit.fromUserId}
                        secondary={
                          <Chip
                            label={formatCurrency(credit.amount)}
                            color="success"
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No one owes you!</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settle Up Dialog */}
      {settleDialogOpen && (
        <Dialog 
          open={settleDialogOpen} 
          onClose={() => setSettleDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
        <DialogTitle>Record Settlement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={settleData.amount}
                onChange={(e) => setSettleData({ ...settleData, amount: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Payment Method"
                fullWidth
                value={settleData.method}
                onChange={(e) => setSettleData({ ...settleData, method: e.target.value as typeof settleData.method })}
              >
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method.replace('_', ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Transaction Reference (Optional)"
                fullWidth
                value={settleData.transactionRef || ''}
                onChange={(e) => setSettleData({ ...settleData, transactionRef: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                fullWidth
                multiline
                rows={2}
                value={settleData.notes || ''}
                onChange={(e) => setSettleData({ ...settleData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSettle} variant="contained">
            Record Settlement
          </Button>
        </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};
