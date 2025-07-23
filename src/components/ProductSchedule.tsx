import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Filter, Edit2, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ProductRequest {
  id: string;
  sortOrder: number;
  fileName: string;
  storeFrontCode: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED";
}

const nightInitialData: ProductRequest[] = [
  {
    id: "n1",
    sortOrder: 1,
    fileName: "exportSku_seller_2209783642954_shop_403163977",
    storeFrontCode: "H0888001",
    status: "PENDING"
  },
  {
    id: "n2", 
    sortOrder: 2,
    fileName: "exportSku_seller_2213277026438_shop_393131059",
    storeFrontCode: "H0888002",
    status: "PENDING"
  },
  {
    id: "n3",
    sortOrder: 3,
    fileName: "exportSku_seller_2287654321987_shop_441289763",
    storeFrontCode: "H0888003", 
    status: "PROCESSING"
  },
  {
    id: "n4",
    sortOrder: 4,
    fileName: "exportSku_seller_2298765432198_shop_512847396",
    storeFrontCode: "H0888004",
    status: "PENDING"
  },
  {
    id: "n5",
    sortOrder: 5,
    fileName: "exportSku_seller_2345678901234_shop_678912345",
    storeFrontCode: "H0888005",
    status: "COMPLETED"
  }
];

const dayInitialData: ProductRequest[] = [
  {
    id: "d1",
    sortOrder: 1,
    fileName: "exportSku_seller_3209783642954_shop_503163977",
    storeFrontCode: "H0888006",
    status: "PENDING"
  },
  {
    id: "d2", 
    sortOrder: 2,
    fileName: "exportSku_seller_3213277026438_shop_493131059",
    storeFrontCode: "H0888007",
    status: "PROCESSING"
  },
  {
    id: "d3",
    sortOrder: 3,
    fileName: "exportSku_seller_3287654321987_shop_541289763",
    storeFrontCode: "H0888008", 
    status: "PENDING"
  },
  {
    id: "d4",
    sortOrder: 4,
    fileName: "exportSku_seller_3298765432198_shop_612847396",
    storeFrontCode: "H0888009",
    status: "COMPLETED"
  }
];

export function ProductSchedule() {
  const [nightData, setNightData] = useState<ProductRequest[]>(nightInitialData);
  const [dayData, setDayData] = useState<ProductRequest[]>(dayInitialData);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<ProductRequest | null>(null);
  const [targetSortOrder, setTargetSortOrder] = useState<number>(1);
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

  const getFilteredData = (data: ProductRequest[]) => {
    return data
      .filter(item => statusFilter === "All" || item.status === statusFilter)
      .filter(item => 
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeFrontCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
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

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "PENDING": return "bg-orange-500 text-white";
        case "PROCESSING": return "bg-blue-500 text-white";
        case "COMPLETED": return "bg-green-500 text-white";
        default: return "bg-gray-500 text-white";
      }
    };

    return (
      <Badge className={getStatusColor(status)}>
        {status}
      </Badge>
    );
  };

  const renderTable = (tab: string) => {
    const data = getCurrentData(tab);
    const filteredData = getFilteredData(data);
    const canReorder = statusFilter === "PENDING" || statusFilter === "All";

    return (
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋檔案名稱或店舖代碼..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">僅顯示 PENDING</SelectItem>
              <SelectItem value="PROCESSING">僅顯示 PROCESSING</SelectItem>
              <SelectItem value="COMPLETED">僅顯示 COMPLETED</SelectItem>
              <SelectItem value="All">顯示全部</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">排序編號</TableHead>
                <TableHead>檔案名稱</TableHead>
                <TableHead>店舖代碼</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sortOrder}</TableCell>
                  <TableCell className="font-mono text-sm">{item.fileName}</TableCell>
                  <TableCell>{item.storeFrontCode}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.status === "PENDING" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
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
                                          {d.sortOrder} - {d.fileName.slice(0, 30)}...
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
        
        <div className="text-sm text-muted-foreground">
          共 {filteredData.length} 筆資料
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Schedule Product</h1>
        <p className="text-muted-foreground">管理產品處理請求的排程</p>
      </div>

      <Tabs defaultValue="night" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="night">晚上排程(20:00~07:00)</TabsTrigger>
          <TabsTrigger value="day">白天排程(07:00~20:00)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="night" className="mt-6">
          {renderTable("night")}
        </TabsContent>
        
        <TabsContent value="day" className="mt-6">
          {renderTable("day")}
        </TabsContent>
      </Tabs>
    </div>
  );
}