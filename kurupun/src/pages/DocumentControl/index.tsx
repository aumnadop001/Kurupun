import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { toast } from 'react-hot-toast';
import { fetchItems, deleteItem } from '../../apis/service/documentControl';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../../components/ConfirmDialog';

interface ItemType {
  id: number;
  item_id: string;
  name: string;
  description: number;
  unit: string;
  storage_location: string;
  order_criteria: string;
  reorder_point: string;
  safety_stock: string;
  notes: string;
  created_at: string;
}

interface ItemDataType {
  count: number;
  results: ItemType[];
  next: string | null;
  previous: string | null;
}

const DocumentControl: React.FC = () => {
  const [data, setData] = useState<ItemDataType>({ count: 0, results: [], next: null, previous: null });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteItem(deleteId);
      setData({ ...data, results: data.results.filter(item => item.id !== deleteId) });
      toast.success('ลบข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchItems({ page: page + 1, page_size: rowsPerPage });
        setData(response);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    loadData();
  }, [page, rowsPerPage]);

  const handleEdit = (id: number) => {
    if (isAuthenticated) {
      navigate(`/document-control/${id}`);
    } else {
      navigate('/login', { state: { from: `/document-control/${id}` } });
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleCreate = () => {
    if (isAuthenticated) {
      navigate("/document-control/create");
    } else {
      navigate('/login', { state: { from: '/document-control/create' } });
    }
  };

  const handleExportExcel = (id: number) => {
    window.open(`${import.meta.env.VITE_API_URL}/api/document-control/items/${id}/export-excel/`, '_blank');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          จัดการครุภัณฑ์ (Document Control)
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
          >
            เพิ่มครุภัณฑ์
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>รหัสครุภัณฑ์</TableCell>
                  <TableCell>ชื่อครุภัณฑ์</TableCell>
                  <TableCell>หน่วย</TableCell>
                  <TableCell>สถานที่จัดเก็บ</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.item_id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.storage_location}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(item.id)}
                        sx={{ mr: 1 }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleExportExcel(item.id)}
                        sx={{ mr: 1 }}
                      >
                        Excel
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(item.id)}
                      >
                        ลบ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={data.count}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="ยืนยันการลบ"
        message="คุณต้องการลบข้อมูลนี้หรือไม่?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </Container>
  );
};

export default DocumentControl;
