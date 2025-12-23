import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import {
  createDocumentRecord,
  updateDocumentRecord,
  fetchDocumentRecordById,
  getNextRegisterNo,
  getTotalStockBalance,
} from '../../../apis/service/documents';
import { DocumentRecordFormValues } from '../../../types/document';
import { fetchDescriptionsList } from '../../../apis/service/master';

const validationSchema = Yup.object({
  registerNo: Yup.string(),
  registration_number: Yup.string().required('กรุณากรอกทะเบียนที่'),
  registration_date: Yup.string().required('กรุณาเลือกวันที่ลงทะเบียน'),
  document_type: Yup.string().required('กรุณากรอกประเภทเอกสาร'),
  sender: Yup.string().required('กรุณากรอกผู้ส่ง'),
  recipient: Yup.string().required('กรุณากรอกผู้รับ'),
  first_item: Yup.string().required('กรุณากรอกรายการแรก'),
  unit_of_measure: Yup.string().required('กรุณากรอกหน่วยนับ'),
  file_storage_date: Yup.string().required('กรุณาเลือกวันที่เก็บเข้าแฟ้ม'),
});

function DocumentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [descriptionInputValue, setDescriptionInputValue] = useState('');
  const [selectedDescription, setSelectedDescription] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  const [totalStockBalance, setTotalStockBalance] = useState<number>(0);
  const isEditMode = Boolean(id);
  const { results } = useSelector((state: any) => state.master.masters);
  // {
  // count: 6384
  // next: "http://localhost:8000/api/descriptions/?page=2"
  // previous: null
  // results: [
  //   {
  //     "id": 1,
  //     "item_id": "2305-001-0001",
  //     "Des_name": "ยานพาหนะใช้บนพื้นดิน",
  //     "class_name": "ยานพาหนะใช้บนพื้นดิน",
  //     "type_name": "ศูนย์ข่าว"
  // }
  // ]
  // }
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Generate registerNo based on registration date
  const generateRegisterNo = async (date: string) => {
    if (!date) return;

    try {
      const registerNo = await getNextRegisterNo(date);
      formik.setFieldValue('registerNo', registerNo);
    } catch (error) {
      console.error('Error generating register number:', error);
      // Fallback: generate locally if API fails
      const yearAD = parseInt(date.split('-')[0]); // ปี ค.ศ.
      const yearBE = yearAD + 543; // แปลงเป็นปี พ.ศ.
      const year = yearBE.toString().slice(-2); // เอาแค่ 2 หลักสุดท้ายของปี พ.ศ. เช่น 2568 -> 68
      formik.setFieldValue('registerNo', `0001-${year}`);
    }
  };

  // Format item_id with dashes (XXXX-XXX-XXXX)
  const formatItemId = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format: XXXX-XXX-XXXX
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
    }
  };

  // Search descriptions from API with debounce (2 seconds)
  const searchDescriptions = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setDescriptions([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await fetchDescriptionsList({ search: searchTerm });
      if (res && res.results) {
        setDescriptions(res.results);
      }
    } catch (error) {
      console.error('Error searching descriptions:', error);
      setDescriptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search handler
  const handleDescriptionSearch = (searchTerm: string) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      searchDescriptions(searchTerm);
    }, 2000); // 2 seconds

    setSearchTimeout(timeout);
  };

  const formik = useFormik<DocumentRecordFormValues>({
    initialValues: {
      registerNo: '',
      registration_number: '',
      registration_date: '',
      document_type: '',
      sender: '',
      recipient: '',
      first_item: '',
      inventory_number: '',
      unit_of_measure: '',
      file_storage_date: '',
      related_document_number: '',
      remark: '',
      related_equipment: '',
      inventory_alternate_numbers: '',
      days_to_order: '',
      quantity_to_order: '',
      reorder_point_days: '',
      reorder_point_quantity: '',
      safety_stock_days: '',
      safety_stock_quantity: '',
      storage_location: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // แปลง string เป็น array สำหรับ JSON fields
        const payload = {
          ...values,
          related_equipment: values.related_equipment
            ? values.related_equipment.split(',').map((item) => item.trim())
            : null,
          inventory_alternate_numbers: values.inventory_alternate_numbers
            ? values.inventory_alternate_numbers.split(',').map((item) => item.trim())
            : null,
          days_to_order: values.days_to_order ? parseInt(values.days_to_order) : null,
          quantity_to_order: values.quantity_to_order ? parseInt(values.quantity_to_order) : null,
          reorder_point_days: values.reorder_point_days
            ? parseInt(values.reorder_point_days)
            : null,
          reorder_point_quantity: values.reorder_point_quantity
            ? parseInt(values.reorder_point_quantity)
            : null,
          safety_stock_days: values.safety_stock_days
            ? parseInt(values.safety_stock_days)
            : null,
          safety_stock_quantity: values.safety_stock_quantity
            ? parseInt(values.safety_stock_quantity)
            : null,
        };

        if (isEditMode) {
          await updateDocumentRecord(parseInt(id!), payload);
          toast.success('อัปเดตข้อมูลเรียบร้อย');
        } else {
          await createDocumentRecord(payload);
          toast.success('บันทึกข้อมูลเรียบร้อย');
        }
        navigate('/documents');
      } catch (error) {
        console.error('Error saving document:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEditMode) {
      loadDocumentData();
    } else {
      // Generate default registerNo with today's date for new records
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      generateRegisterNo(today);
    }
  }, [id]);

  const loadDocumentData = async () => {
    setInitialLoading(true);
    try {
      const data = await fetchDocumentRecordById(parseInt(id!));

      // ค้นหา description จาก registration_number โดยเรียก API
      if (data.registration_number) {
        try {
          const res = await fetchDescriptionsList({ search: data.registration_number });
          if (res && res.results && res.results.length > 0) {
            const found = res.results.find((desc: any) => desc.item_id === data.registration_number);
            if (found) {
              setSelectedDescription(found);
              setDescriptions([found]); // Set descriptions for autocomplete
              setDescriptionInputValue(found.Des_name || ''); // Set input value
            } else {
              // ถ้าไม่เจอใน API ให้ใช้ค่าจาก database
              setSelectedDescription(null);
              setDescriptionInputValue(data.first_item || '');
            }
          } else {
            // ถ้าไม่เจอใน API ให้ใช้ค่าจาก database
            setSelectedDescription(null);
            setDescriptionInputValue(data.first_item || '');
          }
        } catch (error) {
          console.error('Error fetching description:', error);
          setSelectedDescription(null);
          setDescriptionInputValue(data.first_item || '');
        }
      } else {
        // ถ้าไม่มี registration_number ให้ใช้ค่าจาก first_item
        setSelectedDescription(null);
        setDescriptionInputValue(data.first_item || '');
      }

      formik.setValues({
        registerNo: data.registerNo || '',
        registration_number: data.registration_number || '',
        registration_date: data.registration_date || '',
        document_type: data.document_type || '',
        sender: data.sender || '',
        recipient: data.recipient || '',
        first_item: data.first_item || '',
        inventory_number: data.inventory_number || '',
        unit_of_measure: data.unit_of_measure || '',
        file_storage_date: data.file_storage_date || '',
        related_document_number: data.related_document_number || '',
        remark: data.remark || '',
        related_equipment: Array.isArray(data.related_equipment)
          ? data.related_equipment.join(', ')
          : '',
        inventory_alternate_numbers: Array.isArray(data.inventory_alternate_numbers)
          ? data.inventory_alternate_numbers.join(', ')
          : '',
        days_to_order: data.days_to_order?.toString() || '',
        quantity_to_order: data.quantity_to_order?.toString() || '',
        reorder_point_days: data.reorder_point_days?.toString() || '',
        reorder_point_quantity: data.reorder_point_quantity?.toString() || '',
        safety_stock_days: data.safety_stock_days?.toString() || '',
        safety_stock_quantity: data.safety_stock_quantity?.toString() || '',
        storage_location: data.storage_location || '',
      });

      // ดึงคงคลังรวมจาก Inventory
      try {
        const stockResponse = await getTotalStockBalance(parseInt(id!));
        setTotalStockBalance(stockResponse.total_stock_balance || 0);
      } catch (error) {
        console.error('Error fetching total stock balance:', error);
        setTotalStockBalance(0);
      }
    } catch (error) {
      console.error('Error loading document data:', error);
      // alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      toast.error('หมดอายุการใช้งาน กรุณาเข้าสู่ระบบใหม่');
      navigate('/login');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/documents');
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
        {isEditMode ? 'แก้ไขทะเบียนเอกสาร' : 'เพิ่มทะเบียนเอกสาร'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>
            ข้อมูลหลัก
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="registerNo"
                name="registerNo"
                label="ทะเบียนที่ *"
                placeholder="0001-68"
                value={formik.values.registerNo}
                helperText="สร้างอัตโนมัติจากวันที่ลงทะเบียน"
                onChange={(e) => formik.setFieldValue('registerNo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              // InputProps={{
              //   readOnly: true,
              // }}
              // sx={{
              //   '& .MuiInputBase-input': {
              //     backgroundColor: '#f5f5f5',
              //   },
              // }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="registration_number"
                name="registration_number"
                label="รหัสทะเบียน (Item ID) *"
                placeholder="2305-001-0001"
                value={formik.values.registration_number}
                onChange={(e) => {
                  const formatted = formatItemId(e.target.value);
                  formik.setFieldValue('registration_number', formatted);

                  // ค้นหา description ที่ตรงกับ item_id
                  const found = descriptions.find((desc: any) => desc.item_id === formatted);
                  if (found) {
                    setSelectedDescription(found);
                    formik.setFieldValue('first_item', found.Des_name || '');
                  } else {
                    setSelectedDescription(null);
                  }
                }}
                error={formik.touched.registration_number && Boolean(formik.errors.registration_number)}
                helperText={
                  (formik.touched.registration_number && formik.errors.registration_number) ||
                  "รูปแบบ: XXXX-XXX-XXXX (จะใส่ - ให้อัตโนมัติ)"
                }
                inputProps={{
                  maxLength: 13 // 4+3+4 + 2 dashes
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                freeSolo
                fullWidth
                options={descriptions}
                loading={searchLoading}
                getOptionLabel={(option) => {
                  // Handle both object and string types
                  if (typeof option === 'string') return option;
                  return option.Des_name || '';
                }}
                value={selectedDescription}
                inputValue={descriptionInputValue}
                onInputChange={(_, newInputValue) => {
                  setDescriptionInputValue(newInputValue);
                  handleDescriptionSearch(newInputValue);
                  // Update first_item field with typed value
                  formik.setFieldValue('first_item', newInputValue);
                }}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'string') {
                    // User typed a custom value
                    setSelectedDescription(null);
                    formik.setFieldValue('first_item', newValue);
                  } else if (newValue) {
                    // User selected from dropdown
                    setSelectedDescription(newValue);
                    formik.setFieldValue('registration_number', newValue.item_id || '');
                    formik.setFieldValue('first_item', newValue.Des_name || '');
                  } else {
                    setSelectedDescription(null);
                  }
                }}
                filterOptions={(options) => options}
                noOptionsText={
                  searchLoading
                    ? "กำลังค้นหา..."
                    : descriptionInputValue.length < 2
                      ? "กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร หรือพิมพ์เองได้"
                      : "ไม่พบข้อมูล (สามารถพิมพ์เองได้)"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="คำอธิบาย (Description)"
                    placeholder="ค้นหา เลือก หรือพิมพ์เอง"
                    helperText={
                      selectedDescription
                        ? `หมวด: ${selectedDescription.class_name || '-'}`
                        : "พิมพ์ค้นหา (รอ 2 วิหลังพิมพ์เสร็จ) หรือพิมพ์คำอธิบายเอง"
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={`${option.item_id}-${option.Des_name}`}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {option.item_id} - {option.Des_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.class_name} • {option.type_name}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="registration_date"
                name="registration_date"
                label="วันที่ลงทะเบียน *"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.registration_date}
                onChange={(e) => {
                  formik.handleChange(e);
                  // Generate registerNo when date changes (only for new records)
                  if (!isEditMode) {
                    generateRegisterNo(e.target.value);
                  }
                }}
                error={
                  formik.touched.registration_date && Boolean(formik.errors.registration_date)
                }
                helperText={formik.touched.registration_date && formik.errors.registration_date}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={results?.invoiceType || []}
                getOptionLabel={(option) => option.invioc_name || ''}
                value={results?.invoiceType?.find((type: any) => type.invioc_name === formik.values.document_type) || null}
                onChange={(_, newValue) => {
                  formik.setFieldValue('document_type', newValue?.invioc_name || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="ประเภทเอกสาร *"
                    error={formik.touched.document_type && Boolean(formik.errors.document_type)}
                    helperText={formik.touched.document_type && formik.errors.document_type}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="file_storage_date"
                name="file_storage_date"
                label="วันที่เก็บเข้าแฟ้ม *"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.file_storage_date}
                onChange={formik.handleChange}
                error={
                  formik.touched.file_storage_date && Boolean(formik.errors.file_storage_date)
                }
                helperText={formik.touched.file_storage_date && formik.errors.file_storage_date}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={results?.dept || []}
                getOptionLabel={(option) => option.dept_name || ''}
                value={results?.dept?.find((dept: any) => dept.dept_name === formik.values.sender) || null}
                onChange={(_, newValue) => {
                  formik.setFieldValue('sender', newValue?.dept_name || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="จาก *"
                    error={formik.touched.sender && Boolean(formik.errors.sender)}
                    helperText={formik.touched.sender && formik.errors.sender}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="recipient"
                name="recipient"
                label="ถึง *"
                value={formik.values.recipient}
                onChange={formik.handleChange}
                error={formik.touched.recipient && Boolean(formik.errors.recipient)}
                helperText={formik.touched.recipient && formik.errors.recipient}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="first_item"
                name="first_item"
                label="รายการแรก *"
                value={formik.values.first_item}
                onChange={formik.handleChange}
                error={formik.touched.first_item && Boolean(formik.errors.first_item)}
                helperText={formik.touched.first_item && formik.errors.first_item}
              />
            </Grid>
            {isEditMode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="คงคลังรวมทั้งหมด"
                  type="number"
                  value={totalStockBalance}
                  helperText="ยอดคงคลังรวมจากรายการ Inventory ทั้งหมด"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            ข้อมูลพัสดุ
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="inventory_number"
                name="inventory_number"
                label="หมายเลขพัสดุ"
                value={formik.values.inventory_number}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="unit_of_measure"
                name="unit_of_measure"
                label="หน่วยนับ *"
                value={formik.values.unit_of_measure}
                onChange={formik.handleChange}
                error={formik.touched.unit_of_measure && Boolean(formik.errors.unit_of_measure)}
                helperText={formik.touched.unit_of_measure && formik.errors.unit_of_measure}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="storage_location"
                name="storage_location"
                label="ที่เก็บ"
                value={formik.values.storage_location}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="related_document_number"
                name="related_document_number"
                label="เลขที่เอกสารที่เกี่ยวข้อง"
                value={formik.values.related_document_number}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="inventory_alternate_numbers"
                name="inventory_alternate_numbers"
                label="หมายเลขพัสดุแทนกันได้ (คั่นด้วยเครื่องหมายจุลภาค)"
                value={formik.values.inventory_alternate_numbers}
                onChange={formik.handleChange}
                helperText="ตัวอย่าง: A001, A002, A003"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="related_equipment"
                name="related_equipment"
                label="ครุภัณฑ์ที่เกี่ยวข้อง (คั่นด้วยเครื่องหมายจุลภาค)"
                value={formik.values.related_equipment}
                onChange={formik.handleChange}
                helperText="ตัวอย่าง: คอมพิวเตอร์, เครื่องพิมพ์"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            เกณฑ์การสั่ง
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="days_to_order"
                name="days_to_order"
                label="เกณฑ์สั่ง (วัน)"
                type="number"
                value={formik.values.days_to_order}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="quantity_to_order"
                name="quantity_to_order"
                label="เกณฑ์สั่ง (จำนวน)"
                type="number"
                value={formik.values.quantity_to_order}
                onChange={formik.handleChange}
              />
            </Grid>
            <Divider />
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="reorder_point_days"
                name="reorder_point_days"
                label="จุดสั่งเพิ่มเติม (วัน)"
                type="number"
                value={formik.values.reorder_point_days}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="reorder_point_quantity"
                name="reorder_point_quantity"
                label="จุดสั่งเพิ่มเติม (จำนวน)"
                type="number"
                value={formik.values.reorder_point_quantity}
                onChange={formik.handleChange}
              />
            </Grid>
            <Divider />
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="safety_stock_days"
                name="safety_stock_days"
                label="เกณฑ์ปลอดภัย (วัน)"
                type="number"
                value={formik.values.safety_stock_days}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="safety_stock_quantity"
                name="safety_stock_quantity"
                label="เกณฑ์ปลอดภัย (จำนวน)"
                type="number"
                value={formik.values.safety_stock_quantity}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            หมายเหตุ
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }} >
              <TextField
                fullWidth
                id="remark"
                name="remark"
                label="หมายเหตุ"
                multiline
                rows={4}
                value={formik.values.remark}
                onChange={formik.handleChange}
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

export default DocumentForm;
