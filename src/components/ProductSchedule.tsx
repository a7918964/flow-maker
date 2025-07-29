import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, ArrowUpDown, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ProductRequest {
  id: string;
  sortOrder: number;
  fileName: string;
  storeFrontCode: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED";
}

// Generate more mock data for demonstration
const generateMockData = (prefix: string, startId: number, count: number): ProductRequest[] => {
  const statuses: Array<"PENDING" | "PROCESSING" | "COMPLETED"> = ["PENDING", "PROCESSING", "COMPLETED"];
  const data: ProductRequest[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const status = statuses[i % 3];
    // PENDING items get higher sort orders (later in queue)
    let sortOrder = id;
    if (status === "PENDING") {
      sortOrder = id + 50; // Put PENDING items later
    }
    
    data.push({
      id: `${prefix}${id}`,
      sortOrder,
      fileName: `exportSku_seller_${2200000000000 + id * 12345}_shop_${400000000 + id * 7890}`,
      storeFrontCode: `H${(888000 + id).toString().padStart(7, '0')}`,
      status
    });
  }
  
  return data.sort((a, b) => a.sortOrder - b.sortOrder);
};

const nightInitialData = generateMockData("n", 1, 45);
const dayInitialData = generateMockData("d", 100, 45);

const ITEMS_PER_PAGE = 20;

export function ProductSchedule() {
  const [nightData, setNightData] = useState<ProductRequest[]>(nightInitialData);
  const [dayData, setDayData] = useState<ProductRequest[]>(dayInitialData);
  const [editingItem, setEditingItem] = useState<ProductRequest | null>(null);
  const [targetSortOrder, setTargetSortOrder] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStoreFront, setSelectedStoreFront] = useState<string>("all");
  const { toast } = useToast();

  const getCurrentData = (tab: string) => {
    return tab === "night" ? nightData : dayData;
  };

  const setCurrentData = (tab: string, data: ProductRequest[]) => {
    if (tab === "night") {
      setNightData(data);
    } else {
      setDayData(data);
    }
  };

  const getFilteredData = (data: ProductRequest[], status: string) => {
    let filtered = data.filter(item => item.status === status);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeFrontCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${item.sortOrder} - ${item.storeFrontCode}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply store front filter
    if (selectedStoreFront !== "all") {
      filtered = filtered.filter(item => item.storeFrontCode === selectedStoreFront);
    }
    
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getUniqueStoreFronts = (data: ProductRequest[]) => {
    const uniqueCodes = [...new Set(data.map(item => item.storeFrontCode))].sort();
    return uniqueCodes;
  };

  const handleDelete = (tab: string, id: string) => {
    const currentData = getCurrentData(tab);
    const newData = currentData.filter(item => item.id !== id);
    setCurrentData(tab, newData);
    toast({
      title: "刪除成功",
      description: "項目已成功刪除"
    });
  };

  const handleSwapOrder = (tab: string, id: string, targetOrder: number) => {
    const currentData = getCurrentData(tab);
    const itemIndex = currentData.findIndex(item => item.id === id);
    const targetIndex = currentData.findIndex(item => item.sortOrder === targetOrder);
    
    if (itemIndex === -1 || targetIndex === -1 || itemIndex === targetIndex) return;

    const newData = [...currentData];
    const temp = newData[itemIndex].sortOrder;
    newData[itemIndex].sortOrder = newData[targetIndex].sortOrder;
    newData[targetIndex].sortOrder = temp;
    
    setCurrentData(tab, newData);
    toast({
      title: "排序已更新",
      description: `已與順序 ${targetOrder} 交換位置`
    });
  };

  const handleEdit = (tab: string, targetTab: string) => {
    if (!editingItem) return;

    const sourceData = getCurrentData(tab);
    const targetData = getCurrentData(targetTab);
    
    // Remove from source
    const newSourceData = sourceData.filter(item => item.id !== editingItem.id);
    
    // Add to target at the end
    const maxOrder = Math.max(...targetData.map(item => item.sortOrder), 0);
    const newTargetData = [...targetData, { ...editingItem, sortOrder: maxOrder + 1 }];
    
    setCurrentData(tab, newSourceData);
    setCurrentData(targetTab, newTargetData);
    setEditingItem(null);
    
    toast({
      title: "編輯成功",
      description: `已移動到${targetTab === "night" ? "晚上" : "白天"}排程`
    });
  };

  const renderStatusTable = (tab: string, status: string) => {
    const data = getCurrentData(tab);
    const filteredData = getFilteredData(data, status);
    const allStoreFronts = getUniqueStoreFronts(data);
    
    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜尋檔案名稱或店舖代碼..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>
          <Select value={selectedStoreFront} onValueChange={(value) => {
            setSelectedStoreFront(value);
            setCurrentPage(1); // Reset to first page on filter
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="選擇店舖代碼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有店舖</SelectItem>
              {allStoreFronts.map(code => (
                <SelectItem key={code} value={code}>{code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedStoreFront("all");
              setCurrentPage(1);
            }}
          >
            清除篩選
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, filteredData.length)} / 共 {filteredData.length} 筆資料
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">序號</TableHead>
                <TableHead>檔案名稱</TableHead>
                <TableHead>Storefront Store Code</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sortOrder}</TableCell>
                  <TableCell className="font-mono text-sm">{item.fileName}</TableCell>
                  <TableCell>{item.sortOrder} - {item.storeFrontCode}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.status === "PENDING" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="交換順序">
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>交換順序</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">選擇要交換的順序編號:</label>
                                  <Select value={targetSortOrder.toString()} onValueChange={(value) => setTargetSortOrder(Number(value))}>
                                    <SelectTrigger className="w-full mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {data.filter(d => d.id !== item.id && d.status === "PENDING").map(d => (
                                        <SelectItem key={d.id} value={d.sortOrder.toString()}>
                                          {d.sortOrder} - {d.storeFrontCode}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button 
                                  onClick={() => handleSwapOrder(tab, item.id, targetSortOrder)}
                                  className="w-full"
                                >
                                  確認交換
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                title="編輯"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>編輯排程</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  將此項目移動到其他排程，會自動加到目標排程的最後一筆
                                </p>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => handleEdit(tab, "night")}
                                    disabled={tab === "night"}
                                    className="flex-1"
                                  >
                                    移動到晚上排程
                                  </Button>
                                  <Button 
                                    onClick={() => handleEdit(tab, "day")}
                                    disabled={tab === "day"}
                                    className="flex-1"
                                  >
                                    移動到白天排程
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            title="刪除"
                            onClick={() => handleDelete(tab, item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每頁顯示</span>
              <Select value={ITEMS_PER_PAGE.toString()} disabled>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">筆</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </Button>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">跳至</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">頁</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Schedule Product Management</h1>
        <p className="text-muted-foreground">管理產品處理請求的排程</p>
      </div>

      <Tabs defaultValue="night" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="night">Nighttime (20:00~07:00)</TabsTrigger>
          <TabsTrigger value="day">Daytime (07:00~20:00)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="night" className="mt-6">
          <Tabs defaultValue="PENDING" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
              <TabsTrigger value="COMPLETED">Complete</TabsTrigger>
            </TabsList>
            
            <TabsContent value="PENDING" className="mt-6">
              {renderStatusTable("night", "PENDING")}
            </TabsContent>
            
            <TabsContent value="PROCESSING" className="mt-6">
              {renderStatusTable("night", "PROCESSING")}
            </TabsContent>
            
            <TabsContent value="COMPLETED" className="mt-6">
              {renderStatusTable("night", "COMPLETED")}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="day" className="mt-6">
          <Tabs defaultValue="PENDING" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="PROCESSING">Processing</TabsTrigger>
              <TabsTrigger value="COMPLETED">Complete</TabsTrigger>
            </TabsList>
            
            <TabsContent value="PENDING" className="mt-6">
              {renderStatusTable("day", "PENDING")}
            </TabsContent>
            
            <TabsContent value="PROCESSING" className="mt-6">
              {renderStatusTable("day", "PROCESSING")}
            </TabsContent>
            
            <TabsContent value="COMPLETED" className="mt-6">
              {renderStatusTable("day", "COMPLETED")}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}