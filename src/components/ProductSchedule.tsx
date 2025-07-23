import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowUp, ArrowDown, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductRequest {
  id: string;
  sortOrder: number;
  fileName: string;
  storeFrontCode: string;
  storeName: string;
  status: "Scheduled" | "Complete";
}

const initialData: ProductRequest[] = [
  {
    id: "1",
    sortOrder: 1,
    fileName: "exportSku_seller_2209783642954_shop_403163977",
    storeFrontCode: "H0888001",
    storeName: "大街市",
    status: "Scheduled"
  },
  {
    id: "2", 
    sortOrder: 2,
    fileName: "exportSku_seller_2213277026438_shop_393131059",
    storeFrontCode: "H0888002",
    storeName: "時代廣場",
    status: "Scheduled"
  },
  {
    id: "3",
    sortOrder: 3,
    fileName: "exportSku_seller_2287654321987_shop_441289763",
    storeFrontCode: "H0888003", 
    storeName: "銅鑼灣商場",
    status: "Complete"
  },
  {
    id: "4",
    sortOrder: 4,
    fileName: "exportSku_seller_2298765432198_shop_512847396",
    storeFrontCode: "H0888004",
    storeName: "旺角中心",
    status: "Scheduled"
  },
  {
    id: "5",
    sortOrder: 5,
    fileName: "exportSku_seller_2345678901234_shop_678912345",
    storeFrontCode: "H0888005",
    storeName: "尖沙咀廣場",
    status: "Complete"
  }
];

export function ProductSchedule() {
  const [nightData, setNightData] = useState<ProductRequest[]>(initialData);
  const [dayData, setDayData] = useState<ProductRequest[]>(initialData);
  const [statusFilter, setStatusFilter] = useState<string>("Scheduled");
  const [searchTerm, setSearchTerm] = useState("");
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
        item.storeFrontCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleReorder = (tab: string, id: string, direction: "up" | "down") => {
    const currentData = getCurrentData(tab);
    const index = currentData.findIndex(item => item.id === id);
    if (index === -1) return;

    const newData = [...currentData];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newData.length) {
      // Swap items
      [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
      
      // Update sort orders
      newData[index].sortOrder = index + 1;
      newData[targetIndex].sortOrder = targetIndex + 1;
      
      setCurrentData(tab, newData);
      toast({
        title: "排序已更新",
        description: "項目順序已成功調整"
      });
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge 
      variant={status === "Scheduled" ? "default" : "secondary"}
      className={status === "Scheduled" ? "bg-status-scheduled text-white" : "bg-status-complete text-white"}
    >
      {status}
    </Badge>
  );

  const renderTable = (tab: string) => {
    const data = getCurrentData(tab);
    const filteredData = getFilteredData(data);

    return (
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋檔案名稱、店舖代碼或店舖名稱..."
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
              <SelectItem value="Scheduled">僅顯示 Scheduled</SelectItem>
              <SelectItem value="Complete">僅顯示 Complete</SelectItem>
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
                <TableHead>店舖名稱</TableHead>
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
                  <TableCell>{item.storeName}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(tab, item.id, "up")}
                        disabled={item.sortOrder === 1}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(tab, item.id, "down")}
                        disabled={item.sortOrder === data.length}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tab, item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
          <TabsTrigger value="night">晚上排程</TabsTrigger>
          <TabsTrigger value="day">白天排程</TabsTrigger>
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