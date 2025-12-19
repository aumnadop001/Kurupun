import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { fetchDocumentRecords, deleteDocumentRecord } from '../../apis/service/documents';
import { DocumentRecord } from '../../types/document';
import { environment } from '../../environments';
const { API_HOST } = environment;

function Documents() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetchDocumentRecords({
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
        ordering: '-registration_date',
      });

      setDocuments(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    loadDocuments();
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/documents/create');
  };

  const handleEdit = (id: number) => {
    navigate(`/documents/edit/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedDocumentId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDocumentId) {
      try {
        await deleteDocumentRecord(selectedDocumentId);
        loadDocuments();
        toast.success('ลบเอกสารเรียบร้อย');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('เกิดข้อผิดพลาดในการลบเอกสาร');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedDocumentId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDocumentId(null);
  };

  const handleExport = (id: number) => {
    window.open(`/api/documents/document-records/${id}/export-excel/`, '_blank');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ทะเบียนเอกสาร
      </Typography>

      <Toolbar sx={{ pl: 0, pr: 0, mb: 2 }}>
        <TextField
          placeholder="ค้นหา: ทะเบียนที่, ประเภทเอกสาร, ผู้ส่ง, ผู้รับ, รายการ, หมายเลขพัสดุ, ที่เก็บ..."
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
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          sx={{ mr: 2 }}
        >
          ค้นหา
        </Button>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            เพิ่มเอกสาร
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
                  <TableCell>ทะเบียนที่</TableCell>
                  <TableCell>วันที่ลงทะเบียน</TableCell>
                  <TableCell>ประเภทเอกสาร</TableCell>
                  <TableCell>จาก</TableCell>
                  <TableCell>ถึง</TableCell>
                  <TableCell>หมายเลขพัสดุ</TableCell>
                  <TableCell>ที่เก็บ</TableCell>
                  <TableCell align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  documents?.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>{doc.registration_number}</TableCell>
                      <TableCell>{formatDate(doc.registration_date)}</TableCell>
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell>{doc.sender}</TableCell>
                      <TableCell>{doc.recipient}</TableCell>
                      <TableCell>{doc.inventory_number || '-'}</TableCell>
                      <TableCell>{doc.storage_location || '-'}</TableCell>
                      <TableCell align="center">
                        <Button variant='contained' size='small' onClick={() => navigate(`/inventory?document_id=${doc.id}&search=${doc.registration_number}`)} sx={{ mr: 1 }}>
                          แสดงข้อมูลพัสดุ {doc.inventories_count ? `(${doc.inventories_count})` : ''}
                        </Button>
                        {isAuthenticated && (
                          <>
                            <Button variant='contained' size='small' startIcon={<EditIcon />} onClick={() => handleEdit(doc.id!)}>
                              แก้ไข
                            </Button>
                            <Button variant='contained' size='small' color='error' startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(doc.id!)} sx={{ mx: 1 }}>
                              ลบ
                            </Button>
                            <a href={`${API_HOST}/api/documents/document-records/${doc.id}/export-excel/`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                              <Button variant='contained' size='small' color='success' startIcon={<DownloadIcon />}>
                                ดาวน์โหลด
                              </Button>
                            </a>
                          </>
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
            คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?
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

export default Documents;
