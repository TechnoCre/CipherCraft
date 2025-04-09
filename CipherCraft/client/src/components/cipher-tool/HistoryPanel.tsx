import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Clock, 
  Database, 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  Trash2, 
  Key, 
  FileText, 
  Clock3
} from "lucide-react";
import { type CipherHistory } from "@shared/schema";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPanel() {
  const [limit, setLimit] = useState(10);
  const [selectedHistory, setSelectedHistory] = useState<CipherHistory | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: historyItems, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/cipher-history'],
    queryFn: getQueryFn<CipherHistory[]>({ on401: "returnNull" }),
    refetchOnWindowFocus: false,
  });
  
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/cipher-history', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cipher-history'] });
      toast({
        title: "History cleared",
        description: "All history records have been successfully removed.",
      });
      setShowClearDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear history records. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to clear history:", error);
    }
  });

  const handleLoadMore = () => {
    setLimit(prevLimit => prevLimit + 10);
  };
  
  const handleViewDetails = (item: CipherHistory) => {
    setSelectedHistory(item);
  };
  
  const handleClearHistory = () => {
    setShowClearDialog(true);
  };
  
  const executeClearHistory = () => {
    clearHistoryMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Cipher History
          </CardTitle>
          <CardDescription>Loading history records...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Cipher History
          </CardTitle>
          <CardDescription className="text-destructive">
            Failed to load history records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Cipher History
        </CardTitle>
        <CardDescription>
          Recent encryption and decryption operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!historyItems || historyItems.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No history records found</p>
            <p className="text-sm mt-2">
              Your encryption and decryption operations will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearHistory} 
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </div>
            
            <Tabs defaultValue="table">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="cards">Card View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation</TableHead>
                        <TableHead>Algorithm</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Key Size</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyItems.map((item) => (
                        <TableRow 
                          key={item.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewDetails(item)}
                        >
                          <TableCell>
                            <Badge variant={item.operation === 'encrypt' ? 'default' : 'secondary'}>
                              {item.operation}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs uppercase">
                            {item.algorithm}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.mode}
                          </TableCell>
                          <TableCell>{item.keySize}</TableCell>
                          <TableCell>{item.processingTime}ms</TableCell>
                          <TableCell>
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {historyItems.length >= limit && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleLoadMore} variant="outline">
                      Load More
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cards" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleViewDetails(item)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Badge variant={item.operation === 'encrypt' ? 'default' : 'secondary'}>
                            {item.operation}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Algorithm:</span>
                            <div className="font-mono text-xs uppercase">{item.algorithm}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mode:</span>
                            <div className="font-mono text-xs">{item.mode}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Key Size:</span>
                            <div>{item.keySize}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Processing:</span>
                            <div>{item.processingTime}ms</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Input Length:</span>
                            <div>{item.inputLength} chars</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Output Length:</span>
                            <div>{item.outputLength} chars</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {historyItems.length >= limit && (
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleLoadMore} variant="outline">
                      Load More
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      {/* Detail View Dialog */}
      <Dialog open={selectedHistory !== null} onOpenChange={(open) => !open && setSelectedHistory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Badge className="mr-2 text-sm" variant={selectedHistory?.operation === 'encrypt' ? 'default' : 'secondary'}>
                {selectedHistory?.operation}
              </Badge>
              {selectedHistory?.operation === 'encrypt' ? 'Encryption' : 'Decryption'} Details
            </DialogTitle>
            <DialogDescription>
              Operation performed on {selectedHistory && new Date(selectedHistory.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Algorithm
                  </h4>
                  <div className="font-mono text-sm p-2 bg-muted rounded-md">
                    {selectedHistory.algorithm.toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    Key Size
                  </h4>
                  <div className="font-mono text-sm p-2 bg-muted rounded-md">
                    {selectedHistory.keySize}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Mode</h4>
                  <div className="font-mono text-sm p-2 bg-muted rounded-md">
                    {selectedHistory.mode}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center">
                    <Clock3 className="mr-2 h-4 w-4" />
                    Processing Time
                  </h4>
                  <div className="text-sm p-2 bg-muted rounded-md">
                    {selectedHistory.processingTime} milliseconds
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedHistory.operation === 'encrypt' ? 'Input Text' : 'Encrypted Text'}
                </h4>
                <div className="text-sm p-2 bg-muted rounded-md max-h-24 overflow-auto break-all">
                  {selectedHistory.inputText || 
                    <span className="text-muted-foreground italic">Input text not stored</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Length: {selectedHistory.inputLength} characters
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedHistory.operation === 'encrypt' ? 'Encrypted Text' : 'Decrypted Text'}
                </h4>
                <div className="text-sm p-2 bg-muted rounded-md max-h-24 overflow-auto break-all">
                  {selectedHistory.outputText || 
                    <span className="text-muted-foreground italic">Output text not stored</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Length: {selectedHistory.outputLength} characters
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Clear History Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Clear All History?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all cipher history records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeClearHistory}
              disabled={clearHistoryMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearHistoryMutation.isPending ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Clearing...</>
              ) : (
                <>Clear</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}