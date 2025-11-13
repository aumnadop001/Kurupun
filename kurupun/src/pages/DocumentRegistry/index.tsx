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

import { fetchDocumentRegistries, deleteDocumentRegistry } from '../../apis/service/documentRegistry';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment-timezone'
import { Select } from '@mui/material';
import { toast } from 'react-hot-toast';
import { mappingMonthToThai } from '../../utils/mappingMouth';
import { DocumentRegistryDataType } from '../../types/DocumentRegistry';

// ตั้งค่า timezone และภาษา
moment.tz.setDefault('Asia/Bangkok')
moment.locale('th')




const DocumentRegistry: React.FC = () => {
  const [data, setData] = useState<DocumentRegistryDataType>({ count: 0, results: [], next: null, previous: null });
  const [searchBy, setSearchBy] = useState<string>('registry_number');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        const response = await fetchDocumentRegistries({ page: page + 1, page_size: rowsPerPage });
        setData(response);
      } catch (error) {
        console.error("Error fetching document registries:", error);
      }
    }
    loadData();
  }, [page, rowsPerPage]);

  const handleEdit = (id: number) => {
    if (isAuthenticated) {
      navigate(`/document-registries/${id}`);
    } else {
      navigate('/login', { state: { from: `/document-registries/${id}` } });
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (window.confirm('คุณต้องการลบทะเบียนเอกสารนี้ใช่หรือไม่?')) {
      try {
        // TODO: Delete API call
        await deleteDocumentRegistry(id);
        setData({ ...data, results: data.results.filter(item => item.id !== id) });
        toast.success('ลบข้อมูลสำเร็จ');
      } catch (error) {
        console.error('Error deleting document registry:', error);
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleCreate = () => {
    if (isAuthenticated) {
      navigate("/document-registries/create");
    } else {
      navigate('/login', { state: { from: '/document-registries/create' } });
    }
  };

  const handleSearch = async (searchBy: string, searchValue: string) => {
    const response = await fetchDocumentRegistries({ page: page + 1, page_size: rowsPerPage, [searchBy]: searchValue });
    setData(response);
  }
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ทะเบียนเอกสาร
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          {isAuthenticated ? 'เพิ่มทะเบียนเอกสาร' : 'เข้าสู่ระบบเพื่อเพิ่มทะเบียน'}
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
            <option value="registry_number">ทะเบียนที่</option>
            <option value="document_title">เอกสาร</option>
            <option value="sender">จาก</option>
          </Select>
          <Autocomplete
            disablePortal
            options={data.results.map((option) => option[searchBy as keyof typeof option] as string)}
            sx={{ width: 300 }}
            size="small"
            renderInput={(params) => <TextField {...params} name="searchValue" />}
          />
          <Button type='submit' variant="contained" color="primary">ค้นหา</Button>
        </Box>
      </form>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="document registry table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                ทะเบียนที่
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                วันที่ลงทะเบียน
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                เอกสาร
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                จาก
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                รายการแรกในเอกสาร
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                วันที่เก็บเข้าแฟ้ม
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                เลขที่เอกสารที่เกี่ยวข้อง
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                เลขที่ชุดเบิก
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
                    <Link to={`/document-registries/${row.id}`} style={{ textDecoration: 'none', color: 'inherit', textDecorationLine: 'underline' }}>
                      {row.registry_number}
                    </Link>
                  </TableCell>
                  <TableCell align="center">{(() => {
                    const date = moment(row.registration_date).locale('th')
                    const buddhistYear = date.year() + 543
                    const month = mappingMonthToThai(date.format('MM'))
                    return date.format(`DD`) + ' ' + month + ' ' + buddhistYear
                  })()}</TableCell>
                  <TableCell>{row.document_title}</TableCell>
                  <TableCell>{row.sender}</TableCell>
                  <TableCell>{row.first_item}</TableCell>
                  <TableCell align="center">{row.storage_date}</TableCell>
                  <TableCell align="center">{row.related_document_number}</TableCell>
                  <TableCell align="center">{row.withdrawal_set_number}</TableCell>
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
    </Container>
  );
};

export default DocumentRegistry;
