import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { createDocumentRegistry, updateDocumentRegistry, fetchDocumentRegistryById, fetchDocumentRegistries } from '../../../apis/service/documentRegistry';
import { fetchInventoryRecords, deleteInventoryRecord } from '../../../apis/service/inventoryRecord';
import moment from 'moment-timezone';
import ConfirmDialog from '../../../components/ConfirmDialog';

interface DocumentRegistryFormData {
  registry_number: string;
  registration_date: string;
  document_title: string;
  sender: string;
  first_item: string;
  storage_date: string;
  related_document_number: string;
  withdrawal_set_number: string;
}

interface InventoryRecordType {
  id: number;
  document_registry: number;
  order_criteria: string;
  unit_left: string;
  qty_left: number;
  received_qty: number;
  issued_qty: number;
  stock_balance: number;
  created_at: string;
}

const FormDocumentRegistry: React.FC = () => {
  const navigate = useNavigate();
  const { masters } = useSelector((state: any) => state.master);
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const isEditMode = !!id && isAuthenticated;
  const isViewMode = !!id && !isAuthenticated;
  const [nextSequenceNumber, setNextSequenceNumber] = useState<number>(1);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecordType[]>([]);
  const [formData, setFormData] = useState<DocumentRegistryFormData>({
    registry_number: '',
    registration_date: '',
    document_title: '',
    sender: '',
    first_item: '',
    storage_date: '',
    related_document_number: '',
    withdrawal_set_number: '',
  });

  // ฟังก์ชันสร้างเลขทะเบียนจากวันที่
  const generateRegistryNumber = (date: string, sequence?: number) => {
    if (!date) return '0000-69';

    const year = new Date(date).getFullYear();
    const buddhistYear = year + 543;
    const yearSuffix = buddhistYear.toString().slice(-2);
    const sequenceStr = (sequence || nextSequenceNumber).toString().padStart(4, '0');

    return `${sequenceStr}-${yearSuffix}`;
  };

  useEffect(() => {
    const fetchLatestRegistry = async () => {
      try {
        const res = await fetchDocumentRegistries();
        const { count, results } = res;

        let latestSequence = 0;

        if (count && results.length > 0) {
          const latestRegistry = results[count - 1];
          const sequencePart = latestRegistry.registry_number.split('-')[0];
          latestSequence = parseInt(sequencePart, 10);
        }

        setNextSequenceNumber(latestSequence + 1);

        // อัพเดทเลขทะเบียนถ้ามีวันที่อยู่แล้ว
        if (formData.registration_date) {
          const newRegistryNumber = generateRegistryNumber(formData.registration_date, latestSequence + 1);
          setFormData(prev => ({
            ...prev,
            registry_number: newRegistryNumber,
          }));
        } else {
          // ถ้ายังไม่มีวันที่ ให้แสดง default
          setFormData(prev => ({
            ...prev,
            registry_number: `${(latestSequence + 1).toString().padStart(4, '0')}-69`,
          }));
        }
      } catch (error) {
        console.error("Error fetching latest registry:", error);
        setNextSequenceNumber(1);
      }
    };

    if (!isEditMode) {
      fetchLatestRegistry();
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      // TODO: Fetch data by id
      const fetchData = async () => {
        try {
          const data = await fetchDocumentRegistryById(id);
          setFormData(data);
        } catch (error) {
          console.error("Error fetching document registry:", error);
          toast.error('ไม่สามารถโหลดข้อมูลได้');
        }
      };
      fetchData();
    }
  }, [id, isEditMode]);

  // Load inventory records if viewing or editing
  useEffect(() => {
    if (id) {
      const fetchInventories = async () => {
        try {
          const response = await fetchInventoryRecords({ document_registry: id, page_size: 100 });
          setInventoryRecords(response.results || []);
        } catch (error) {
          console.error("Error fetching inventory records:", error);
        }
      };
      fetchInventories();
    }
  }, [id]);

  // Reload inventory records when navigating back from inventory form
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        const fetchInventories = async () => {
          try {
            const response = await fetchInventoryRecords({ document_registry: id, page_size: 100 });
            setInventoryRecords(response.results || []);
          } catch (error) {
            console.error("Error fetching inventory records:", error);
          }
        };
        fetchInventories();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    console.log(name, value);
    
    if (name === 'registration_date') {
      const newRegistryNumber = generateRegistryNumber(value);
      setFormData((prev) => ({
        ...prev,
        registration_date: value,
        registry_number: newRegistryNumber,
      }));
    } else if (name === 'registry_number') {
      // อนุญาตให้แก้ไขเลขลำดับได้
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        // TODO: Update API call
        await updateDocumentRegistry(id, formData);
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        // TODO: Create API call
        await createDocumentRegistry(formData);
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving document registry:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleEdit = () => {
    navigate('/login', { state: { from: `/document-registries/${id}` } });
  };

  const handleDeleteInventoryRecord = async (recordId: number) => {
    try {
      await deleteInventoryRecord(recordId);
      toast.success('ลบบันทึกรายการพัสดุสำเร็จ');
      // Refresh inventory records
      if (id) {
        const response = await fetchInventoryRecords({ document_registry: id, page_size: 100 });
        setInventoryRecords(response.results || []);
      }
    } catch (error) {
      console.error('Error deleting inventory record:', error);
      toast.error('เกิดข้อผิดพลาดในการลบบันทึกรายการพัสดุ');
    }
  }

  // Confirm dialog state & handlers for delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);
  const confirmTitle = 'ยืนยันการลบ';
  const [confirmMessage, setConfirmMessage] = useState('คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกรายการพัสดุนี้?');

  const openDeleteConfirm = (recordId: number) => {
    setConfirmTargetId(recordId);
    setConfirmMessage('คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกรายการพัสดุนี้?');
    setConfirmOpen(true);
  };
  console.log('masters ->', masters);

  const handleConfirmDelete = async () => {
    if (confirmTargetId === null) {
      setConfirmOpen(false);
      return;
    }
    await handleDeleteInventoryRecord(confirmTargetId);
    setConfirmOpen(false);
    setConfirmTargetId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setConfirmTargetId(null);
  };

  const handleDownloadExcel = () => {
    if (!id) {
      toast.error('ไม่สามารถดาวน์โหลดได้ กรุณาบันทึกข้อมูลก่อน');
      return;
    }

    // Open download link in new window
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${apiUrl}/api/export-inventory/${id}/`, '_blank');
    toast.success('กำลังดาวน์โหลดไฟล์ Excel...');
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'แก้ไขทะเบียนเอกสาร' : isViewMode ? 'รายละเอียดทะเบียนเอกสาร' : 'เพิ่มทะเบียนเอกสาร'}
          </Typography>
          {isViewMode && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              size="large"
            >
              เข้าสู่ระบบเพื่อแก้ไข
            </Button>
          )}
        </Box>

        {isViewMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            คุณกำลังดูข้อมูลในโหมดอ่านอย่างเดียว กรุณาเข้าสู่ระบบเพื่อแก้ไขข้อมูล
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  required={!isViewMode}
                  label="ทะเบียนที่"
                  name="registry_number"
                  value={formData.registry_number}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  required={!isViewMode}
                  label="วันที่ลงทะเบียน"
                  name="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                />
              </Box>
            </Box>

            {/* <TextField
              fullWidth
              required={!isViewMode}
              label="เอกสาร"
              name="document_title"
              value={formData.document_title}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={isViewMode}
              InputProps={{
                readOnly: isViewMode,
              }}
            /> */}
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label"
                sx={{
                  top: '-20%',
                  '&.MuiInputLabel-shrink': {
                    top: 10,
                    left: '14px',
                    transform: 'translateY(-100%)',
                    width: '200px',
                  }
                }}
              >เอกสาร
              </InputLabel>
              <Select
                name="document_title"
                fullWidth
                size='small'
                required={!isViewMode}
                disabled={isViewMode}
                value={formData.document_title}
                label="เอกสาร"
                onChange={handleChange}
              >
                {masters?.invoiceType?.map((option: any) => (
                  <MenuItem key={option.id} value={option.invioc_name}>
                    {option.invioc_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <FormControl fullWidth>
                  <InputLabel sx={{
                    top: '-20%',
                    '&.MuiInputLabel-shrink': {
                      top: 10,
                      left: '14px',
                      transform: 'translateY(-100%)',
                      width: '200px',
                    }
                  }}>จาก</InputLabel>
                  <Select
                    name="sender"
                    fullWidth
                    size='small'
                    required={!isViewMode}
                    disabled={isViewMode}
                    value={formData.sender}
                    label="จาก"
                    onChange={handleChange}
                  >
                    {masters?.dept?.map((option: any) => (
                      <MenuItem key={option.id} value={option.dept_name}>
                        {option.dept_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* <TextField
                  fullWidth
                  required={!isViewMode}
                  label="จาก"
                  name="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                /> */}
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  required={!isViewMode}
                  label="รายการแรกในเอกสาร"
                  name="first_item"
                  value={formData.first_item}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  required={!isViewMode}
                  label="วันที่เก็บเข้าแฟ้ม"
                  name="storage_date"
                  type="date"
                  value={formData.storage_date}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="เลขที่เอกสารที่เกี่ยวข้อง"
                  name="related_document_number"
                  value={formData.related_document_number}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="เลขที่ชุดเบิก"
                  name="withdrawal_set_number"
                  value={formData.withdrawal_set_number}
                  onChange={handleChange}
                  disabled={isViewMode}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                />
              </Box>
            </Box>

            {!isViewMode && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  size="large"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มทะเบียน'}
                </Button>
              </Box>
            )}

            {isViewMode && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  size="large"
                >
                  กลับ
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Inventory Records Section */}
      {id && (
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              บันทึกรายการพัสดุที่เกี่ยวข้อง
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {inventoryRecords.length > 0 && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadExcel}
                >
                  ดาวน์โหลด Excel
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/inventory-records/create?document_registry=${id}`)}
              >
                เพิ่มบันทึกรายการพัสดุ
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {inventoryRecords.length === 0 ? (
            <Alert severity="info">ยังไม่มีบันทึกรายการพัสดุที่เกี่ยวข้อง</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>เกณฑ์สั่ง</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>หน่วย</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>จำนวน</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>รับ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>จ่าย</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>คงคลัง</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>วันที่สร้าง</TableCell>
                    <TableCell align="center" colSpan={2} sx={{ fontWeight: 'bold' }}>จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryRecords.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell align="center">
                        <Link
                          to={`/inventory-records/${record.id}`}
                          style={{ textDecoration: 'underline', color: 'inherit' }}
                        >
                          {record.id}
                        </Link>
                      </TableCell>
                      <TableCell>{record.order_criteria || '-'}</TableCell>
                      <TableCell align="center">{record.unit_left || '-'}</TableCell>
                      <TableCell align="center">{record.qty_left || 0}</TableCell>
                      <TableCell align="center">{record.received_qty || 0}</TableCell>
                      <TableCell align="center">{record.issued_qty || 0}</TableCell>
                      <TableCell align="center">{record.stock_balance || 0}</TableCell>
                      <TableCell align="center">
                        {moment(record.created_at).format('DD/MM/YYYY HH:mm')}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/inventory-records/${record.id}`)}
                        >
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => openDeleteConfirm(record.id)}
                        >
                          ลบ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
      {/* open,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  confirmColor = 'primary',
  onConfirm,
  onCancel, */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default FormDocumentRegistry;