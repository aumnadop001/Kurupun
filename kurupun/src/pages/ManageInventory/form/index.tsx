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
  Stack,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import {
  createDescription,
  updateDescription,
  fetchDescriptionById,
  fetchMaster,
  fetchDescriptionsList
} from '../../../apis/service/master';
import { Description, MasterData } from '../../../types/description';

const validationSchema = Yup.object({
  class_id: Yup.string().required('กรุณาเลือกหมวดพัสดุ'),
  type_id: Yup.string().required('กรุณาเลือกประเภทพัสดุ'),
  Des_id: Yup.string().required('กรุณากรอกรหัสรายละเอียด'),
  Des_name: Yup.string().required('กรุณากรอกชื่อรายละเอียด'),
  gpsc_id: Yup.string(),
  keyword: Yup.string(),
});

function ManageInventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [isUserChange, setIsUserChange] = useState(false);
  const [filteredTypes, setFilteredTypes] = useState<any[]>([]);
  const isEditMode = Boolean(id);

  const formik = useFormik({
    initialValues: {
      class_id: '',
      type_id: '',
      Des_id: '',
      Des_name: '',
      gpsc_id: '',
      keyword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload: Partial<Description> = {
          class_id: values.class_id ? parseInt(values.class_id) : undefined,
          type_id: values.type_id ? parseInt(values.type_id) : undefined,
          Des_id: values.Des_id,
          Des_name: values.Des_name,
          gpsc_id: values.gpsc_id ? parseInt(values.gpsc_id) : undefined,
          keyword: values.keyword,
        };

        if (isEditMode) {
          await updateDescription(parseInt(id!), payload);
          toast.success('แก้ไขรายละเอียดพัสดุเรียบร้อย');
        } else {
          await createDescription(payload);
          toast.success('เพิ่มรายละเอียดพัสดุเรียบร้อย');
        }
        navigate('/manage-inventory');
      } catch (error: any) {
        console.error('Error saving description:', error);
        const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });


  const getDesc = async (classId: string, typeId: string) => {
    const res = await fetchDescriptionsList({ search: `${classId}-${typeId}-` });

    // ให้เพิ่ม running number ต่อจากที่มีอยู่แล้ว
    const existingDescriptions = res.results;

    let maxRunningNumber = 0;
    const findCurrent = existingDescriptions.find((desc: any) => {
      return desc.id.toString() === id;
    })

    if (findCurrent) {
      const data = await fetchDescriptionById(parseInt(id!));
      formik.setValues({
        class_id: data.class_id?.toString() || '',
        type_id: data.type_id?.toString() || '',
        Des_id: data.Des_id || '',
        Des_name: data.Des_name || '',
        gpsc_id: data.gpsc_id?.toString() || '',
        keyword: data.keyword || '',
      });
      setIsUserChange(false);
    } else {
      existingDescriptions.forEach((desc: any) => {
        const parts = desc.item_id.split('-');
        const runningNumberStr = parts[2]; // สมมติว่า running number อยู่หลัง - ตัวสุดท้าย
        const runningNumber = parseInt(runningNumberStr, 10);
        if (!isNaN(runningNumber) && runningNumber > maxRunningNumber) {
          maxRunningNumber = runningNumber;
        }
      });

      const nextRunningNumber = (maxRunningNumber + 1).toString().padStart(4, '0');

      // ถ้าไม่ใช่โหมดแก้ไข หรือ Des_id ว่างเปล่า ถึงจะ set ค่าใหม่
      formik.setFieldValue('Des_id', nextRunningNumber);
    }
  }

  useEffect(() => {
    if (
      !isUserChange ||                     // ❌ ไม่ใช่ user action
      !formik.values.class_id ||
      !formik.values.type_id ||
      !masterData
    ) {
      return;
    }
    if (formik.values.class_id && formik.values.type_id) {
      const findSelectedClass = masterData?.pClass?.find(
        (c) => c.id.toString() === formik.values.class_id
      );
      const findSelectedType = masterData?.ptype?.find(
        (t) => t.id.toString() === formik.values.type_id
      );

      const classId = findSelectedClass?.class_id || '';
      const typeId = findSelectedType?.ptype_id || '';
      getDesc(classId, typeId);
      setIsUserChange(false)
    }
  }, [formik.values.class_id, formik.values.type_id, masterData]);

  const loadMasterData = async () => {
    try {
      const response = await fetchMaster();
      setMasterData(response.results);
    } catch (error) {
      console.error('Error loading master data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลหลักได้');
    }
  };

  const loadDescription = async () => {
    if (!id) return;

    setInitialLoading(true);
    try {
      const data = await fetchDescriptionById(parseInt(id));
      formik.setValues({
        class_id: data.class_id?.toString() || '',
        type_id: data.type_id?.toString() || '',
        Des_id: data.Des_id || '',
        Des_name: data.Des_name || '',
        gpsc_id: data.gpsc_id?.toString() || '',
        keyword: data.keyword || '',
      });
    } catch (error) {
      console.error('Error loading description:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
      navigate('/manage-inventory');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      loadDescription();
    }
  }, [id]);

  // Filter types based on selected class
  useEffect(() => {
    if (formik.values.class_id && masterData?.ptype) {
      setFilteredTypes(masterData.ptype);
    } else {
      setFilteredTypes([]);
    }
  }, [formik.values.class_id, masterData]);

  const handleCancel = () => {
    navigate('/manage-inventory');
  };

  if (initialLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? 'แก้ไขรายละเอียดพัสดุ' : 'เพิ่มรายละเอียดพัสดุ'}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* หมวดพัสดุ */}
            <Grid size={{ xs: 12, md: 6 }} >
              <FormControl
                fullWidth
                size='small'
                error={formik.touched.class_id && Boolean(formik.errors.class_id)}
              >
                <InputLabel>หมวดพัสดุ *</InputLabel>
                <Select
                  name="class_id"
                  value={formik.values.class_id}
                  onChange={(e) => {
                    setIsUserChange(true);
                    formik.handleChange(e);
                    formik.setFieldValue('type_id', ''); // Reset type when class changes
                  }}
                  onBlur={formik.handleBlur}
                  label="หมวดพัสดุ *"
                >
                  {masterData?.pClass?.map((item) => (
                    <MenuItem key={item.id} value={item.id.toString()}>
                      {item.class_name} ({item.class_id})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.class_id && formik.errors.class_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {formik.errors.class_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* ประเภทพัสดุ */}
            <Grid size={{ xs: 12, md: 6 }} >
              <FormControl
                fullWidth
                error={formik.touched.type_id && Boolean(formik.errors.type_id)}
                disabled={!formik.values.class_id}
                size='small'

              >
                <InputLabel>ประเภทพัสดุ *</InputLabel>
                <Select
                  name="type_id"
                  value={formik.values.type_id}
                  onChange={(e) => {
                    setIsUserChange(true);
                    formik.handleChange(e);
                  }}
                  onBlur={formik.handleBlur}
                  label="ประเภทพัสดุ *"
                >
                  {filteredTypes.map((item) => (
                    <MenuItem key={item.id} value={item.id.toString()}>
                      {item.ptype_name} ({item.ptype_id})
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.type_id && formik.errors.type_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {formik.errors.type_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {/* รหัส กพร. */}
            <Grid size={{ xs: 12, md: 6 }} >
              <FormControl fullWidth size='small'>
                <InputLabel>รหัสพัสดุตาม กพร.</InputLabel>
                <Select
                  name="gpsc_id"
                  value={formik.values.gpsc_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="รหัสพัสดุตาม กพร."
                >
                  <MenuItem value="">ไม่ระบุ</MenuItem>
                  {masterData?.gpscode?.map((item) => (
                    <MenuItem key={item.id} value={item.id.toString()}>
                      {item.gpsc_name} ({item.gpsc_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* รหัสรายละเอียด */}
            <Grid size={{ xs: 12, md: 6 }} >
              <TextField
                fullWidth
                name="Des_id"
                label="รหัสรายละเอียด"
                value={formik.values.Des_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.Des_id && Boolean(formik.errors.Des_id)}
                helperText={formik.touched.Des_id && formik.errors.Des_id}
                required
              />
            </Grid>



            {/* ชื่อรายละเอียด */}
            <Grid size={{ xs: 12, md: 6 }} >
              <TextField
                fullWidth
                multiline
                rows={3}
                name="Des_name"
                label="ชื่อรายละเอียดพัสดุ"
                value={formik.values.Des_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.Des_name && Boolean(formik.errors.Des_name)}
                helperText={formik.touched.Des_name && formik.errors.Des_name}
                required
              />
            </Grid>

            {/* คำค้นหา */}
            <Grid size={{ xs: 12, md: 6 }} >
              <TextField
                fullWidth
                multiline
                rows={3}
                name="keyword"
                label="คำค้นหา (Keywords)"
                value={formik.values.keyword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText="คำค้นหาเพิ่มเติมสำหรับค้นหาพัสดุรายการนี้"
              />
            </Grid>

            {/* Preview รหัสพัสดุ */}
            {formik.values.class_id && formik.values.type_id && formik.values.Des_id && (
              <Grid size={{ xs: 12 }} >
                <Paper sx={{ p: 2, bgcolor: 'primary.lighter' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    รหัสพัสดุที่จะได้:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {(() => {
                      const selectedClass = masterData?.pClass?.find(
                        (c) => c.id.toString() === formik.values.class_id
                      );
                      const selectedType = masterData?.ptype?.find(
                        (t) => t.id.toString() === formik.values.type_id
                      );
                      return `${selectedClass?.class_id || ''}-${selectedType?.ptype_id || ''}-${formik.values.Des_id}`;
                    })()}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Buttons */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default ManageInventoryForm;