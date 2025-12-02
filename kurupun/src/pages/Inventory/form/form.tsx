import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { fetchInventoryById, createInventory, updateInventory } from '../../../apis/service/inventories';
import { fetchMaster, fetchDescriptionsList } from '../../../apis/service/master';
interface InventoryFormData {
  Des_id: number | string;
  Des_name: string;
  class_id: string;
  class_name: string;
  type_id: string;
  type_name: string;
  gpsc_id: string | null;
  gpsc_name: string | null;
  keyword: string | null;
  item_id: string;
}

interface DescriptionDetail {
  id: number;
  class_id: string;
  class_name: string;
  type_id: string;
  type_name: string;
  Des_id: string;
  Des_name: string;
  gpsc_id: string | null;
  gpsc_name: string | null;
  keyword: string | null;
  item_id: string;
}

interface PClass {
  id: number;
  class_id: string;
  class_name: string;
}

interface PType {
  id: number;
  ptype_id: string;
  ptype_name: string;
  class_id: number;
  class_name: string;
}

interface Description {
  id: number;
  Des_id: string;
  Des_name: string;
  class_id: string;
  class_name: string;
  type_id: string;
  type_name: string;
  gpsc_id: string | null;
  gpsc_name: string | null;
  keyword: string | null;
  item_id: string;
}

interface GpsCode {
  id: number;
  gpsc_id: string;
  gpsc_name: string;
}

const InventoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<InventoryFormData>({
    Des_id: '',
    Des_name: '',
    class_id: '',
    class_name: '',
    type_id: '',
    type_name: '',
    gpsc_id: null,
    gpsc_name: null,
    keyword: null,
    item_id: '',
  });

  const [descriptionDetail, setDescriptionDetail] = useState<DescriptionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Master data states
  const [classes, setClasses] = useState<PClass[]>([]);
  const [types, setTypes] = useState<PType[]>([]);
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [gpsCodes, setGpsCodes] = useState<GpsCode[]>([]);

  // Selected values
  const [selectedClass, setSelectedClass] = useState<PClass | null>(null);
  const [selectedType, setSelectedType] = useState<PType | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<Description | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadMasterData();

    if (isEditMode && id) {
      loadInventoryData(id);
    }
  }, [isAuthenticated, isEditMode, id, navigate]);

  // Load master data
  const loadMasterData = async () => {
    try {
      const masterData = await fetchMaster();
      if (masterData.results) {
        setClasses(masterData.results.pClass || []);
        setGpsCodes(masterData.results.gpscode || []);
      }
    } catch (error: any) {
      console.error('Error loading master data:', error.message);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหลัก');
    }
  };

  // Load types when class changes
  useEffect(() => {
    if (selectedClass) {
      loadTypes(selectedClass.id);
    } else {
      setTypes([]);
      setSelectedType(null);
    }
  }, [selectedClass]);

  // Load descriptions when type changes
  useEffect(() => {
    if (selectedType) {
      loadDescriptions(selectedType.id);
    } else {
      setDescriptions([]);
      setSelectedDescription(null);
    }
  }, [selectedType]);

  const loadTypes = async (classId: number) => {
    try {
      const masterData = await fetchMaster();
      if (masterData.results && masterData.results.ptype) {
        const filteredTypes = masterData.results.ptype.filter(
          (type: PType) => type.class_id === classId
        );
        setTypes(filteredTypes);
      }
    } catch (error) {
      console.error('Error loading types:', error);
    }
  };

  const loadDescriptions = async (typeId: number) => {
    try {
      const response = await fetchDescriptionsList({ type_id: typeId });
      if (response.results) {
        setDescriptions(response.results);
      }
    } catch (error) {
      console.error('Error loading descriptions:', error);
    }
  };

  const loadInventoryData = async (inventoryId: string) => {
    try {
      setLoading(true);
      const data = await fetchInventoryById(inventoryId);
      console.log('data ->', data);

      // Set description detail from nested serializer
      setFormData(data);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && !selectedDescription) {
      toast.error('กรุณาเลือกรายละเอียดพัสดุ');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        description: isEditMode ? formData : selectedDescription?.id,
      };

      if (isEditMode && id) {
        await updateInventory(id, submitData);
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        await createInventory(submitData);
        toast.success('เพิ่มข้อมูลสำเร็จ');
      }

      navigate('/inventory');
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'แก้ไขบัญชีคุมพัสดุ' : 'เพิ่มบัญชีคุมพัสดุ'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Row 1 */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="รหัสรายละเอียด"
                  name="Des_id"
                  value={formData.Des_id}
                  onChange={handleChange}

                />
              </Box>

              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="ชื่อรายละเอียด"
                  name="Des_name"
                  value={formData.Des_name}
                  onChange={handleChange}

                />
              </Box>
            </Box>

            {/* Row 2 */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="รหัสหมวดหมู่"
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}

                />
              </Box>

              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="ชื่อหมวดหมู่"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}

                />
              </Box>
            </Box>

            {/* Row 3 */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="รหัสประเภท"
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleChange}

                />
              </Box>

              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="ชื่อประเภท"
                  name="type_name"
                  value={formData.type_name}
                  onChange={handleChange}

                />
              </Box>
            </Box>

            {/* Row 4 */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="รหัส GPSC"
                  name="gpsc_id"
                  value={formData.gpsc_id || ''}
                  onChange={handleChange}

                />
              </Box>

              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="ชื่อ GPSC"
                  name="gpsc_name"
                  value={formData.gpsc_name || ''}
                  onChange={handleChange}

                />
              </Box>
            </Box>

            {/* Row 5 */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="คำค้นหา"
                  name="keyword"
                  value={formData.keyword || ''}
                  onChange={handleChange}

                />
              </Box>

              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
                  fullWidth
                  label="รหัสรายการ"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Box>
            </Box>
          </Box>

          {/* ปุ่มควบคุม */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default InventoryForm;
