import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import { Leaderboard } from '@/interfaces/Leaderboard';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LeaderboardContent: React.FC<{ leaderboard: { name: string; selections: number }[]; isLoading: boolean }> = ({ leaderboard, isLoading }) => {
  const [isAuthenticated] = useState(false);
  const [userLeaderboard, setUserLeaderboard] = useState<{ name: string; selections: number }[]>([]);
  const { data: userLeaderboardData } = useQuery(
    'userLeaderboard',
    () => axios.get<Leaderboard[]>('/api/user-leaderboard').then(res => res.data) as Promise<Leaderboard[]>,
    { enabled: isAuthenticated }
  );
  
  useEffect(() => {
    if (userLeaderboardData && Array.isArray(userLeaderboardData)) {
      setUserLeaderboard(userLeaderboardData);
    }
  }, [userLeaderboardData]);

  if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Selections</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLeaderboard.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="text-right">{user.selections}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
};

export default LeaderboardContent;