import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 2 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="30%" height={48} sx={{ mb: 4 }} />
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={40} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CardSkeleton />
        </Grid>
        <Grid item xs={12} md={6}>
          <CardSkeleton />
        </Grid>
      </Grid>
    </Box>
  );
}

export function FormSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Skeleton variant="rectangular" width={100} height={42} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={100} height={42} sx={{ borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
}
