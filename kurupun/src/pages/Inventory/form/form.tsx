import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { fetchInventoryById, createInventory, updateInventory } from '../../../apis/service/inventories';

interface InventoryFormData {
  document_registry: number | string;
  order_criteria: string;
  reorder_point: string;
  safety_stock: string;
  related_equipment: string;
  remark: string;
  doc_date_left: string;
  evidence_left: string;
  unit_left: string;
  qty_left: number | string;
  pending_receive_1: number | string;
  pending_receive_2: number | string;
  pending_receive_3: number | string;
  pending_receive_4: number | string;
  doc_date_right: string;
  received_qty: number | string;
  price_per_unit: string;
  evidence_right: string;
  demand_initial: number | string;
  demand_replace: number | string;
  issued_qty: number | string;
  total_borrowed: number | string;
  stock_balance: number | string;
  signature: string;
  class_id?: string;
  des_id?: string;
  des_name?: string;
  gpsc_id?: string;
  keyword?: string;
}

const InventoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<InventoryFormData>({
    document_registry: '',
    order_criteria: '',
    reorder_point: '',
    safety_stock: '',
    related_equipment: '',
    remark: '',
    doc_date_left: '',
    evidence_left: '',
    unit_left: '',
    qty_left: '',
    pending_receive_1: '',
    pending_receive_2: '',
    pending_receive_3: '',
    pending_receive_4: '',
    doc_date_right: '',
    received_qty: '',
    price_per_unit: '',
    evidence_right: '',
    demand_initial: '',
    demand_replace: '',
    issued_qty: '',
    total_borrowed: '',
    stock_balance: '',
    signature: '',
    class_id: '',
    des_id: '',
    des_name: '',
    gpsc_id: '',
    keyword: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isEditMode && id) {
      loadInventoryData(id);
    }
  }, [isAuthenticated, isEditMode, id, navigate]);

  const loadInventoryData = async (inventoryId: string) => {
    try {
      setLoading(true);
      const data = await fetchInventoryById(inventoryId);
      setFormData({
        document_registry: data.document_registry || '',
        order_criteria: data.order_criteria || '',
        reorder_point: data.reorder_point || '',
        safety_stock: data.safety_stock || '',
        related_equipment: data.related_equipment || '',
        remark: data.remark || '',
        doc_date_left: data.doc_date_left || '',
        evidence_left: data.evidence_left || '',
        unit_left: data.unit_left || '',
        qty_left: data.qty_left || '',
        pending_receive_1: data.pending_receive_1 || '',
        pending_receive_2: data.pending_receive_2 || '',
        pending_receive_3: data.pending_receive_3 || '',
        pending_receive_4: data.pending_receive_4 || '',
        doc_date_right: data.doc_date_right || '',
        received_qty: data.received_qty || '',
        price_per_unit: data.price_per_unit || '',
        evidence_right: data.evidence_right || '',
        demand_initial: data.demand_initial || '',
        demand_replace: data.demand_replace || '',
        issued_qty: data.issued_qty || '',
        total_borrowed: data.total_borrowed || '',
        stock_balance: data.stock_balance || '',
        signature: data.signature || '',
        class_id: data.class_id || '',
        des_id: data.des_id || '',
        des_name: data.des_name || '',
        gpsc_id: data.gpsc_id || '',
        keyword: data.keyword || '',
      });
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

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateInventory(id, formData);
        toast.success('แก้ไขข้อมูลสำเร็จ');
      } else {
        await createInventory(formData);
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
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="รหัสประเภทพัสดุ"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="รหัสรายละเอียดพัสดุ"
                name="des_id"
                value={formData.des_id}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="ชื่อรายละเอียดพัสดุ"
                name="des_name"
                value={formData.des_name}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="รหัสพัสดุตาม กพร."
                name="gpsc_id"
                value={formData.gpsc_id}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="คำค้นหา"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                size="small"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

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
