import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

import {
  createInventory,
  updateInventory,
  fetchInventoryById,
} from '../../../apis/service/inventory';
import { fetchDocumentRecords, getTotalStockBalance } from '../../../apis/service/documents';
import { InventoryFormValues } from '../../../types/inventory';
import { DocumentRecord } from '../../../types/document';

const validationSchema = Yup.object({});


function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [documentRecords, setDocumentRecords] = useState<DocumentRecord[]>([]);
  const [previousStockBalance, setPreviousStockBalance] = useState<number>(0);
  const isEditMode = Boolean(id);

  const formik = useFormik<InventoryFormValues>({
    initialValues: {
      document_record: '',
      pending_date: '',
      pending_evidence: '',
      pending_unit: '',
      pending_quantity: '',
      pending_receive1: '',
      pending_balance1: '',
      pending_receive2: '',
      pending_balance2: '',
      pending_receive3: '',
      pending_balance3: '',
      pending_receive4: '',
      pending_balance4: '',
      pending_signature: '',
      request_date: '',
      received_quantity: '',
      unit_price: '',
      request_evidence: '',
      request_type: '',
      issue_quantity: '',
      total_borrowed: '',
      stock_balance: '',
      request_signature: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          document_record: values.document_record ? parseInt(values.document_record) : null,
          pending_date: values.pending_date || null,
          pending_evidence: values.pending_evidence || '',
          pending_unit: values.pending_unit || '',
          pending_quantity: values.pending_quantity ? parseInt(values.pending_quantity) : null,
          pending_receive1: values.pending_receive1 ? parseInt(values.pending_receive1) : null,
          pending_balance1: values.pending_balance1 ? parseInt(values.pending_balance1) : null,
          pending_receive2: values.pending_receive2 ? parseInt(values.pending_receive2) : null,
          pending_balance2: values.pending_balance2 ? parseInt(values.pending_balance2) : null,
          pending_receive3: values.pending_receive3 ? parseInt(values.pending_receive3) : null,
          pending_balance3: values.pending_balance3 ? parseInt(values.pending_balance3) : null,
          pending_receive4: values.pending_receive4 ? parseInt(values.pending_receive4) : null,
          pending_balance4: values.pending_balance4 ? parseInt(values.pending_balance4) : null,
          pending_signature: values.pending_signature || '',
          request_date: values.request_date || null,
          received_quantity: values.received_quantity ? parseInt(values.received_quantity) : 0,
          unit_price: values.unit_price ? parseFloat(values.unit_price) : 0,
          request_evidence: values.request_evidence || '',
          request_type: values.request_type || 'INITIAL',
          issue_quantity: values.issue_quantity ? parseInt(values.issue_quantity) : 0,
          total_borrowed: values.total_borrowed ? parseInt(values.total_borrowed) : 0,
          previous_stock_balance: previousStockBalance,
          stock_balance: values.stock_balance ? parseInt(values.stock_balance) : 0,
          request_signature: values.request_signature || '',
        };

        if (isEditMode) {
          await updateInventory(parseInt(id!), payload);
          toast.success('อัปเดตข้อมูลเรียบร้อย');
        } else {
          await createInventory(payload);
          toast.success('บันทึกข้อมูลเรียบร้อย');
        }
        navigate('/inventories');
      } catch (error) {
        console.error('Error saving inventory:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    loadDocumentRecords();
    if (isEditMode) {
      loadInventoryData();
    }
  }, [id]);

  // Load total stock balance from document record when it changes
  useEffect(() => {
    const loadStockBalance = async () => {
      if (formik.values.document_record && !isEditMode) {
        try {
          // ไม่ต้องส่ง parameter เพราะต้องการคงคลังล่าสุดทั้งหมด
          const response = await getTotalStockBalance(
            parseInt(formik.values.document_record)
          );
          setPreviousStockBalance(response.total_stock_balance || 0);
        } catch (error) {
          console.error('Error loading total stock balance:', error);
          setPreviousStockBalance(0);
        }
      } else if (!formik.values.document_record) {
        setPreviousStockBalance(0);
      }
    };
    loadStockBalance();
  }, [formik.values.document_record, isEditMode]);

  // Auto-calculate stock balance
  useEffect(() => {
    const received = parseFloat(formik.values.received_quantity) || 0;
    const issued = parseFloat(formik.values.issue_quantity) || 0;
    const borrowed = parseFloat(formik.values.total_borrowed) || 0;
    const newBalance = previousStockBalance + received - issued - borrowed;

    // Only update if the calculated value is different
    if (newBalance.toString() !== formik.values.stock_balance) {
      formik.setFieldValue('stock_balance', newBalance.toString());
    }
  }, [formik.values.received_quantity, formik.values.issue_quantity, formik.values.total_borrowed, previousStockBalance]);

  const loadDocumentRecords = async () => {
    try {
      const response = await fetchDocumentRecords({ page_size: 1000 });
      setDocumentRecords(response.results);
    } catch (error) {
      console.error('Error loading document records:', error);
    }
  };

  const loadInventoryData = async () => {
    setInitialLoading(true);
    try {
      const data = await fetchInventoryById(parseInt(id!));
      formik.setValues({
        document_record: data.document_record?.toString() || '',
        pending_date: data.pending_date || '',
        pending_evidence: data.pending_evidence || '',
        pending_unit: data.pending_unit || '',
        pending_quantity: data.pending_quantity?.toString() || '',
        pending_receive1: data.pending_receive1?.toString() || '',
        pending_balance1: data.pending_balance1?.toString() || '',
        pending_receive2: data.pending_receive2?.toString() || '',
        pending_balance2: data.pending_balance2?.toString() || '',
        pending_receive3: data.pending_receive3?.toString() || '',
        pending_balance3: data.pending_balance3?.toString() || '',
        pending_receive4: data.pending_receive4?.toString() || '',
        pending_balance4: data.pending_balance4?.toString() || '',
        pending_signature: data.pending_signature || '',
        request_date: data.request_date || '',
        received_quantity: data.received_quantity?.toString() || '',
        unit_price: data.unit_price?.toString() || '',
        request_evidence: data.request_evidence || '',
        request_type: data.request_type || '',
        issue_quantity: data.issue_quantity?.toString() || '',
        total_borrowed: data.total_borrowed?.toString() || '',
        stock_balance: data.stock_balance?.toString() || '',
        request_signature: data.request_signature || '',
      });
    } catch (error) {
      console.error('Error loading inventory data:', error);
      // alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      toast.error('หมดอายุการใช้งาน กรุณาเข้าสู่ระบบใหม่');
      navigate('/login');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventories');
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'แก้ไขทะเบียนคุมวัสดุ' : 'เพิ่มทะเบียนคุมวัสดุ'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>
            เชื่อมโยงกับเอกสาร
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }} >
              <FormControl
                fullWidth
                error={formik.touched.document_record && Boolean(formik.errors.document_record)}
              >
                <FormControl fullWidth size="small">
                  <InputLabel id="document_record-label">
                    ทะเบียนเอกสาร
                  </InputLabel>

                  <Select
                    labelId="document_record-label"
                    id="document_record"
                    name="document_record"
                    value={formik.values.document_record}
                    label="ทะเบียนเอกสาร"
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="">ไม่เชื่อมโยง</MenuItem>
                    {documentRecords.map((doc) => (
                      <MenuItem key={doc.id} value={doc.id}>
                        {doc.registration_number} - {doc.first_item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formik.touched.document_record && formik.errors.document_record && (
                  <FormHelperText>{formik.errors.document_record}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            ค้างรับ และ ค้างจ่าย
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_date"
                name="pending_date"
                label="วันทู่"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.pending_date}
                onChange={formik.handleChange}
                error={formik.touched.pending_date && Boolean(formik.errors.pending_date)}
                helperText={formik.touched.pending_date && formik.errors.pending_date}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_evidence"
                name="pending_evidence"
                label="หลักฐาน"
                value={formik.values.pending_evidence}
                onChange={formik.handleChange}
                error={formik.touched.pending_evidence && Boolean(formik.errors.pending_evidence)}
                helperText={formik.touched.pending_evidence && formik.errors.pending_evidence}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_unit"
                name="pending_unit"
                label="หน่วยนับ"
                value={formik.values.pending_unit}
                onChange={formik.handleChange}
                error={formik.touched.pending_unit && Boolean(formik.errors.pending_unit)}
                helperText={formik.touched.pending_unit && formik.errors.pending_unit}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_quantity"
                name="pending_quantity"
                label="จำนวน"
                type="number"
                value={formik.values.pending_quantity}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            รับ/ค้าง (4 รอบ)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_receive1"
                name="pending_receive1"
                label="รับ 1"
                type="number"
                value={formik.values.pending_receive1}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_balance1"
                name="pending_balance1"
                label="ค้าง 1"
                type="number"
                value={formik.values.pending_balance1}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_receive2"
                name="pending_receive2"
                label="รับ 2"
                type="number"
                value={formik.values.pending_receive2}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_balance2"
                name="pending_balance2"
                label="ค้าง 2"
                type="number"
                value={formik.values.pending_balance2}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_receive3"
                name="pending_receive3"
                label="รับ 3"
                type="number"
                value={formik.values.pending_receive3}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_balance3"
                name="pending_balance3"
                label="ค้าง 3"
                type="number"
                value={formik.values.pending_balance3}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_receive4"
                name="pending_receive4"
                label="รับ 4"
                type="number"
                value={formik.values.pending_receive4}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                id="pending_balance4"
                name="pending_balance4"
                label="ค้าง 4"
                type="number"
                value={formik.values.pending_balance4}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="pending_signature"
                name="pending_signature"
                label="ลายมือชื่อ"
                value={formik.values.pending_signature}
                onChange={formik.handleChange}
                error={formik.touched.pending_signature && Boolean(formik.errors.pending_signature)}
                helperText={formik.touched.pending_signature && formik.errors.pending_signature}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            ความต้องการรับและจ่าย
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                id="request_date"
                name="request_date"
                label="วันที่"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.request_date}
                onChange={formik.handleChange}
                error={formik.touched.request_date && Boolean(formik.errors.request_date)}
                helperText={formik.touched.request_date && formik.errors.request_date}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                id="received_quantity"
                name="received_quantity"
                label="จำนวนที่รับ"
                type="number"
                value={formik.values.received_quantity}
                onChange={formik.handleChange}
                error={formik.touched.received_quantity && Boolean(formik.errors.received_quantity)}
                helperText={formik.touched.received_quantity && formik.errors.received_quantity}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                id="unit_price"
                name="unit_price"
                label="ราคาต่อหน่วย"
                type="number"
                inputProps={{ step: '0.01' }}
                value={formik.values.unit_price}
                onChange={formik.handleChange}
                error={formik.touched.unit_price && Boolean(formik.errors.unit_price)}
                helperText={formik.touched.unit_price && formik.errors.unit_price}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="คงคลังก่อนหน้า"
                type="number"
                value={previousStockBalance}
                helperText="ยอดคงคลังสะสมจากรายการก่อนหน้าทั้งหมด"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="request_evidence"
                name="request_evidence"
                label="หลักฐาน"
                value={formik.values.request_evidence}
                onChange={formik.handleChange}
                error={formik.touched.request_evidence && Boolean(formik.errors.request_evidence)}
                helperText={formik.touched.request_evidence && formik.errors.request_evidence}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                size='small'
                error={formik.touched.request_type && Boolean(formik.errors.request_type)}
              >
                <InputLabel>ประเภท</InputLabel>
                <Select
                  id="request_type"
                  name="request_type"

                  value={formik.values.request_type}
                  label="ประเภท"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="INITIAL">ขั้นต้น</MenuItem>
                  <MenuItem value="REPLACEMENT">ทดแทน</MenuItem>
                </Select>
                {formik.touched.request_type && formik.errors.request_type && (
                  <FormHelperText>{formik.errors.request_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                id="issue_quantity"
                name="issue_quantity"
                label="จ่าย"
                type="number"
                value={formik.values.issue_quantity}
                onChange={formik.handleChange}
                error={formik.touched.issue_quantity && Boolean(formik.errors.issue_quantity)}
                helperText={formik.touched.issue_quantity && formik.errors.issue_quantity}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                id="total_borrowed"
                name="total_borrowed"
                label="รวมยืม"
                type="number"
                value={formik.values.total_borrowed}
                onChange={formik.handleChange}
                error={formik.touched.total_borrowed && Boolean(formik.errors.total_borrowed)}
                helperText={formik.touched.total_borrowed && formik.errors.total_borrowed}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="request_signature"
                name="request_signature"
                label="ลายมือชื่อ"
                value={formik.values.request_signature}
                onChange={formik.handleChange}
                error={formik.touched.request_signature && Boolean(formik.errors.request_signature)}
                helperText={formik.touched.request_signature && formik.errors.request_signature}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default InventoryForm;
