import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Link } from 'react-router';
import { fetchDocumentRegistries } from '../../apis/service/documentRegistry';
import { useAuth } from '../../hooks/useAuth';
import moment from 'moment-timezone'

// ตั้งค่า timezone และภาษา
moment.tz.setDefault('Asia/Bangkok')
moment.locale('th')
interface DocumentRegistryData {
  id: number;
  registry_number: string;
  registration_date: string;
  document_title: string;
  sender: string;
  first_item: string;
  storage_date: string;
  related_document_number: string;
  withdrawal_set_number: string;
}

const mappingMonthToThai = (month: string) => {
  const monthMap: { [key: string]: string } = {
    '01': 'มกราคม',
    '02': 'กุมภาพันธ์',
    '03': 'มีนาคม',
    '04': 'เมษายน',
    '05': 'พฤษภาคม',
    '06': 'มิถุนายน',
    '07': 'กรกฎาคม',
    '08': 'สิงหาคม',
    '09': 'กันยายน',
    '10': 'ตุลาคม',
    '11': 'พฤศจิกายน',
    '12': 'ธันวาคม',
  };
  return monthMap[month] || month;
}

const DocumentRegistry: React.FC = () => {
  const [data, setData] = useState<DocumentRegistryData[]>([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDocumentRegistries();
        setData(response.results);
      } catch (error) {
        console.error("Error fetching document registries:", error);
      }
    }
    loadData();
  }, [])

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
        // await deleteDocumentRegistry(id);
        setData(data.filter(item => item.id !== id));
        // toast.success('ลบข้อมูลสำเร็จ');
      } catch (error) {
        console.error('Error deleting document registry:', error);
        // toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAuthenticated ? 9 : 8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีข้อมูล
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
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
      </TableContainer>
    </Container>
  );
};

export default DocumentRegistry;
