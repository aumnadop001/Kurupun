import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TablePagination,
  Toolbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { fetchInventories, deleteInventory } from '../../apis/service/inventory';
import { Inventory } from '../../types/inventory';

function Inventories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);

  // Get parameters from URL query
  // const documentIdParam = searchParams.get('document_id');
  const searchParam = searchParams.get('search');

  const [searchTerm, setSearchTerm] = useState(searchParam || '');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const [triggerSearch, setTriggerSearch] = useState(0);

  const loadInventories = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
        ordering: '-request_date',
      };

      if (requestTypeFilter) {
        params.request_type = requestTypeFilter;
      }

      // Filter by document_id if provided in URL
      // if (documentIdParam) {
      //   params.document_record = documentIdParam;
      // }

      const response = await fetchInventories(params);
      setInventories(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error loading inventories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update searchTerm when URL parameter changes
  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    loadInventories();
  }, [page, rowsPerPage, requestTypeFilter, triggerSearch]);

  const handleSearch = () => {
    setPage(0);
    loadInventories();
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setRequestTypeFilter('');
    setPage(0);
    // Clear URL parameters
    navigate('/inventory');
    setTriggerSearch(prev => prev + 1);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/inventory/create');
  };

  const handleEdit = (id: number) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handlePaymentIntent = (id: number) => {
    navigate(`/payment-intent/create`);
  }

  const handleDeleteClick = (id: number) => {
    setSelectedInventoryId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedInventoryId) {
      try {
        await deleteInventory(selectedInventoryId);
        loadInventories();
        toast.success('ลบข้อมูลเรียบร้อย');
      } catch (error) {
        console.error('Error deleting inventory:', error);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedInventoryId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedInventoryId(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const getRequestTypeLabel = (type: string) => {
    return type === 'INITIAL' ? 'ขั้นต้น' : 'ทดแทน';
  };

  const getRequestTypeColor = (type: string) => {
    return type === 'INITIAL' ? 'primary' : 'secondary';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ทะเบียนคุมวัสดุ {searchParam && `(กรองตามเอกสาร #${searchParam})`}
      </Typography>

      <Toolbar sx={{ pl: 0, pr: 0, mb: 2 }}>
        <TextField
          placeholder="ค้นหา: หลักฐาน, หน่วย, ลายมือชื่อ..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{ flexGrow: 1, mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
          <InputLabel>ประเภท</InputLabel>
          <Select
            value={requestTypeFilter}
            label="ประเภท"
            onChange={(e) => setRequestTypeFilter(e.target.value)}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="INITIAL">ขั้นต้น</MenuItem>
            <MenuItem value="REPLACEMENT">ทดแทน</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          sx={{ mr: 1 }}
        >
          ค้นหา
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleResetSearch}
          sx={{ mr: 2 }}
        >
          Reset
        </Button>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            เพิ่มข้อมูล
          </Button>
        )}
      </Toolbar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>#</TableCell> */}
                  <TableCell>หมายเลขพัสดุ</TableCell>
                  <TableCell>ชื่อพัสดุ</TableCell>
                  {/* <TableCell>รับเข้า</TableCell> */}
                  {/* <TableCell>จ่ายออก</TableCell> */}
                  {/* <TableCell>รวมยืม</TableCell> */}
                  <TableCell align="center">คำนวนคงคลัง</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  inventories.map((inventory, index) => (
                    <TableRow key={inventory.id} hover>
                      {/* <TableCell>{page * rowsPerPage + index + 1}</TableCell> */}
                      <TableCell>{inventory.document_record_inventory_number}</TableCell>
                      <TableCell>{inventory.first_item}</TableCell>
                      {/* <TableCell>{inventory.received_quantity}</TableCell> */}
                      {/* <TableCell>{inventory.issue_quantity}</TableCell> */}
                      {/* <TableCell>{inventory.total_borrowed}</TableCell> */}
                      <TableCell align='center'>{inventory.stock_balance}</TableCell>
                      <TableCell align="center">
                        {isAuthenticated && (
                          <>
                            {/* <Button variant='contained' startIcon={<EditIcon />} size='small' onClick={() => handlePaymentIntent(inventory.id!)} sx={{ mr: 1 }}>
                              รับเข้า
                            </Button>
                            <Button variant='contained' startIcon={<EditIcon />} size='small' onClick={() => handlePaymentIntent(inventory.id!)} sx={{ mr: 1 }}>
                              จ่ายออก
                            </Button> */}
                            <Button variant='contained' startIcon={<EditIcon />} size='small' onClick={() => handleEdit(inventory.id!)} sx={{ mr: 1 }}>
                              {/* แก้ไข */}
                              ดูรายละเอียด
                            </Button>
                            <Button variant='contained' color='error' startIcon={<DeleteIcon />} size='small' onClick={() => handleDeleteClick(inventory.id!)} >
                              ลบ
                            </Button>
                          </>
                        )}
                        {!isAuthenticated && (
                          <Typography variant="caption" color="text.secondary">
                            ต้อง login เพื่อแก้ไข
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="แสดงต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
            }
          />
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>ยกเลิก</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inventories;
