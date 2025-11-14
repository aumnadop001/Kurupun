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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { fetchInventoryRecords, deleteInventoryRecord } from '../../apis/service/inventory';
import { fetchDocumentRegistries } from '../../apis/service/documentRegistry';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment-timezone';
import { Select } from '@mui/material';
import { toast } from 'react-hot-toast';
import { mappingMonthToThai } from '../../utils/mappingMouth';
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
}

interface InventoryRecordDataType {
  count: number;
  results: InventoryRecordType[];
  next: string | null;
  previous: string | null;
}

interface DocumentRegistry {
  id: number;
  registry_number: string;
  document_title: string;
}

const InventoryRecord: React.FC = () => {
  const [data, setData] = useState<InventoryRecordDataType>({ count: 0, results: [], next: null, previous: null });
  const [documentRegistries, setDocumentRegistries] = useState<DocumentRegistry[]>([]);
  const [searchBy, setSearchBy] = useState<string>('document_registry');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Load document registries for mapping
  useEffect(() => {
    const loadDocumentRegistries = async () => {
      try {
        const response = await fetchDocumentRegistries({ page_size: 1000 });
        setDocumentRegistries(response.results || []);
      } catch (error) {
        console.error("Error fetching document registries:", error);
      }
    };
    loadDocumentRegistries();
  }, []);

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteInventoryRecord(deleteId);
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
        const response = await fetchInventoryRecords({ page: page + 1, page_size: rowsPerPage });
        setData(response);
      } catch (error) {
        console.error("Error fetching inventory records:", error);
      }
    };
    loadData();
  }, [page, rowsPerPage]);

  const handleEdit = (id: number) => {
    if (isAuthenticated) {
      navigate(`/inventory-records/${id}`);
    } else {
      navigate('/login', { state: { from: `/inventory-records/${id}` } });
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
      navigate("/inventory-records/create");
    } else {
      navigate('/login', { state: { from: '/inventory-records/create' } });
    }
  };

  const handleSearch = async (searchBy: string, searchValue: string) => {
    const response = await fetchInventoryRecords({ page: page + 1, page_size: rowsPerPage, [searchBy]: searchValue });
    setData(response);
  };

  const getDocumentRegistryDisplay = (documentRegistryId: number) => {
    const doc = documentRegistries.find(d => d.id === documentRegistryId);
    return doc ? `${doc.registry_number} - ${doc.document_title}` : documentRegistryId.toString();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          บันทึกรายการพัสดุ
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          {isAuthenticated ? 'เพิ่มบันทึกรายการพัสดุ' : 'เข้าสู่ระบบเพื่อเพิ่มบันทึก'}
        </Button>
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
          <Autocomplete
            disablePortal
            options={Array.from(new Set(
              data.results
                .map((option) => {
                  if (searchBy === 'document_registry') {
                    return getDocumentRegistryDisplay(option.document_registry);
                  }
                  const value = option[searchBy as keyof typeof option];
                  return value ? String(value) : '';
                })
                .filter((value) => value !== '')
            ))}
            sx={{ width: 300 }}
            size="small"
            renderInput={(params) => <TextField {...params} name="searchValue" />}
          />
          <Button type='submit' variant="contained" color="primary">ค้นหา</Button>
        </Box>
      </form>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="inventory record table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                ID
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                รายการ (ทะเบียนเอกสาร)
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                หน่วย
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                จำนวน
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                รับ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                จ่าย
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                คงคลัง
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                วันที่สร้าง
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
              data.results.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover
                >
                  <TableCell align="center">
                    <Link to={`/inventory-records/${row.id}`} style={{ textDecoration: 'none', color: 'inherit', textDecorationLine: 'underline' }}>
                      {row.id}
                    </Link>
                  </TableCell>
                  <TableCell>{getDocumentRegistryDisplay(row.document_registry)}</TableCell>
                  <TableCell align="center">{row.unit_left || '-'}</TableCell>
                  <TableCell align="center">{row.qty_left || 0}</TableCell>
                  <TableCell align="center">{row.received_qty || 0}</TableCell>
                  <TableCell align="center">{row.issued_qty || 0}</TableCell>
                  <TableCell align="center">{row.stock_balance || 0}</TableCell>
                  <TableCell align="center">{(() => {
                    const date = moment(row.created_at).locale('th');
                    const buddhistYear = date.year() + 543;
                    const month = mappingMonthToThai(date.format('MM'));
                    return date.format(`DD`) + ' ' + month + ' ' + buddhistYear;
                  })()}</TableCell>
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

export default InventoryRecord;
