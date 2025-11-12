import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';

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
import { createDocumentRegistry, updateDocumentRegistry, fetchDocumentRegistryById } from '../../../apis/service/documentRegistry';
const FormDocumentRegistry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const isEditMode = !!id && isAuthenticated;
  const isViewMode = !!id && !isAuthenticated;

  //   {
  //     "registry_number": [
  //         "This field is required."
  //     ],
  //     "registration_date": [
  //         "This field is required."
  //     ],
  //     "document_title": [
  //         "This field is required."
  //     ],
  //     "sender": [
  //         "This field is required."
  //     ],
  //     "first_item": [
  //         "This field is required."
  //     ],
  //     "storage_date": [
  //         "This field is required."
  //     ],
  //     "related_document_number": [
  //         "This field is required."
  //     ],
  //     "withdrawal_set_number": [
  //         "This field is required."
  //     ]
  // }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

            <TextField
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
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
                <TextField
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
                />
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
    </Container>
  );
};

export default FormDocumentRegistry;