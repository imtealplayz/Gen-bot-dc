import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bot, Activity, Terminal, RefreshCw, Server } from "lucide-react";
import { api } from "@shared/routes";
import { format } from "date-fns";
import { BotLog } from "@shared/schema";

interface BotStatus {
  online: boolean;
  tag: string | null;
  guilds: number;
}

export default function Dashboard() {
  const { data: status, refetch: refetchStatus, isFetching: isFetchingStatus } = useQuery<BotStatus>({
    queryKey: [api.bot.status.path],
  });

  const { data: logs, refetch: refetchLogs, isFetching: isFetchingLogs } = useQuery<BotLog[]>({
    queryKey: [api.bot.logs.path],
    refetchInterval: 5000,
  });

  const handleRefresh = () => {
    refetchStatus();
    refetchLogs();
  };

  const handleReconnect = async () => {
    try {
      await fetch('/api/bot/reconnect', { method: 'POST' });
      handleRefresh();
    } catch (error) {
      console.error('Failed to reconnect');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discord Bot Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your bot instance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReconnect}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reconnect
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isFetchingStatus || isFetchingLogs}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${(isFetchingStatus || isFetchingLogs) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className={`w-4 h-4 ${status?.online ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {status?.online ? 'Online' : 'Offline'}
              </div>
              <Badge variant={status?.online ? 'default' : 'destructive'} className="h-5">
                {status?.online ? 'Live' : 'Stopped'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identity</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {status?.tag || 'Unknown'}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Guilds</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.guilds ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col h-[500px]">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <CardTitle>Activity Logs</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono">Real-time</Badge>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {logs?.map((log: any) => (
                <div key={log.id} className="flex gap-4 text-sm font-mono border-b border-muted pb-2 last:border-0">
                  <span className="text-muted-foreground whitespace-nowrap">
                    [{format(new Date(log.timestamp), 'HH:mm:ss')}]
                  </span>
                  <span className="flex-1 break-all">{log.message}</span>
                </div>
              ))}
              {(!logs || logs.length === 0) && (
                <div className="text-center py-12 text-muted-foreground italic">
                  No activity logs recorded yet...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
