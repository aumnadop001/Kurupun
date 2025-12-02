import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';

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
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

import { fetchInventory, deleteInventory } from '../../apis/service/inventories';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment-timezone';
import { Select } from '@mui/material';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

// ตั้งค่า timezone และภาษา
moment.tz.setDefault('Asia/Bangkok');
moment.locale('th');

interface InventoryRecordType {
  id: number;
  document_registry: number;
  document_registry_display?: string;
  order_criteria: string;
  reorder_point: string;
  safety_stock: string;
  related_equipment: string;
  remark: string;
  doc_date_left: string;
  evidence_left: string;
  unit_left: string;
  qty_left: number;
  pending_receive_1: number;
  pending_receive_2: number;
  pending_receive_3: number;
  pending_receive_4: number;
  doc_date_right: string;
  received_qty: number;
  price_per_unit: string;
  evidence_right: string;
  demand_initial: number;
  demand_replace: number;
  issued_qty: number;
  total_borrowed: number;
  stock_balance: number;
  signature: string;
  created_at: string;
  class_id?: string;
  des_id?: string;
  des_name?: string;
  gpsc_id?: string;
  keyword?: string;
}

interface InventoryRecordDataType {
  count: number;
  results: InventoryRecordType[];
  next: string | null;
  previous: string | null;
}

const Inventory: React.FC = () => {
  const [data, setData] = useState<InventoryRecordDataType>({ count: 0, results: [], next: null, previous: null });
  const [searchBy, setSearchBy] = useState<string>('document_registry');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteInventory(deleteId);
      setData({ ...data, results: data.results.filter(item => item.id !== deleteId) });
      toast.success('ลบข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Error deleting inventory record:', error);
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
        const response = await fetchInventory({ page: page + 1, page_size: rowsPerPage });
        setData(response);
      } catch (error) {
        console.error("Error fetching inventory records:", error);
      }
    };
    loadData();
  }, [page, rowsPerPage]);

  const handleEdit = (id: number) => {
    if (isAuthenticated) {
      navigate(`/inventory/${id}`);
    } else {
      navigate('/login', { state: { from: `/inventory/${id}` } });
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
      navigate("/inventory/create");
    } else {
      navigate('/login', { state: { from: '/inventory/create' } });
    }
  };

  const handleSearch = async (searchBy: string, searchValue: string) => {
    const response = await fetchInventory({ page: page + 1, page_size: rowsPerPage, [searchBy]: searchValue });
    setData(response);
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          บัญชีคุมพัสดุ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            {isAuthenticated ? 'เพิ่มบัญชีคุมพัสดุ' : 'เข้าสู่ระบบเพื่อเพิ่มบัญชีคุมพัสดุ'}
          </Button>
        </Box>
      </Box>
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchValue = formData.get('searchValue') as string;
        handleSearch(searchBy, searchValue);
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
          <Typography>ค้นหาโดย</Typography>
          <Select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="document_registry">รายการ (ทะเบียนเอกสาร)</MenuItem>
            <MenuItem value="unit_left">หน่วย</MenuItem>
            <MenuItem value="evidence_left">หลักฐานซ้าย</MenuItem>
            <MenuItem value="evidence_right">หลักฐานขวา</MenuItem>
          </Select>
          <Button type='submit' variant="contained" color="primary">ค้นหา</Button>
        </Box>
      </form>
      <TableContainer component={Paper} sx={{ height: 'calc(100vh - 300px)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="inventory record table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                #
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                รหัสประเภทพัสดุ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                รหัสรายละเอียดพัสดุ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                ชื่อรายละเอียดพัสดุ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                รหัสพัสดุตาม กพร.
              </TableCell>
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                คำค้นหา
              </TableCell>
              {isAuthenticated && (
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  จัดการ
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.count === 0 ? (
              <TableRow>
                <TableCell colSpan={isAuthenticated ? 9 : 8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีข้อมูล
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.results.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover
                >
                  <TableCell align="center">
                    <Link to={`/inventory/${row.id}`} style={{ textDecoration: 'none', color: 'inherit', textDecorationLine: 'underline' }}>
                      {index + 1 + page * rowsPerPage}
                    </Link>
                  </TableCell>
                  <TableCell align="center">{row.class_id || '-'}</TableCell>
                  <TableCell align="center">{row.des_id || '-'}</TableCell>
                  <TableCell align="center">{row.des_name || '-'}</TableCell>
                  <TableCell align="center">{row.gpsc_id || '-'}</TableCell>
                  <TableCell align="left" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Tooltip title={row.keyword || '-'} arrow>
                      <span>{row.keyword || '-'}</span>
                    </Tooltip>
                  </TableCell>
                  {isAuthenticated && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleEdit(row.id)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(row.id)}
                        >
                          ลบ
                        </Button>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'ทั้งหมด', value: -1 }]}
          component="div"
          count={data.count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="แถวต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
          }
        />
      </TableContainer>
      <ConfirmDialog
        open={confirmOpen}
        title="ยืนยันการลบ"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </Container>
  );
};

export default Inventory;
