import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { fetchItemById, createItem, updateItem } from '../../../apis/service/documentControl';
import { callGet } from '../../../apis/call-api';

interface ItemFormData {
  description: number | string;
  unit: string;
  storage_location: string;
  order_criteria_day: number | string;
  order_criteria_quantity: number | string;
  additional_order_point_day: number | string;
  additional_order_point_quantity: number | string;
  safety_criteria_day: number | string;
  safety_criteria_quantity: number | string;
  pending_received_1: string;
  pending_received_2: string;
  pending_received_3: string;
  pending_received_4: string;
  notes: string;
  alternatives: number[];
  equipments: { equipment_name: string; equipment_code: string }[];
  pending_transactions: {
    transaction_type: string;
    date: string;
    document_no: string;
    unit: string;
    quantity: number | string;
  }[];
  stock_transactions: {
    date: string;
    receive_quantity: number | string;
    unit_price: number | string;
    receive_document_no: string;
    initial_demand: number | string;
    replacement_demand: number | string;
    issue_quantity: number | string;
    total_borrowed: number | string;
    stock_balance: number | string;
    signature: string;
    notes: string;
  }[];
}

interface DescriptionOption {
  id: number;
  Des_name: string;
  Des_id: string;
  class_id: string;
}

const ItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<ItemFormData>({
    description: '',
    unit: '',
    storage_location: '',
    order_criteria_day: '',
    order_criteria_quantity: '',
    additional_order_point_day: '',
    additional_order_point_quantity: '',
    safety_criteria_day: '',
    safety_criteria_quantity: '',
    pending_received_1: '',
    pending_received_2: '',
    pending_received_3: '',
    pending_received_4: '',
    notes: '',
    alternatives: [],
    equipments: [],
    pending_transactions: [],
    stock_transactions: [],
  });

  const [descriptions, setDescriptions] = useState<DescriptionOption[]>([]);
  const [items, setItems] = useState<DescriptionOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadDescriptions();
    loadItems();

    if (isEditMode && id) {
      loadItemData(id);
    }
  }, [isAuthenticated, isEditMode, id, navigate]);

  const loadDescriptions = async () => {
    try {
      const response = await callGet("/api/descriptions/", { page_size: 1000 });
      setDescriptions(response.results || []);
    } catch (error) {
      console.error("Error loading descriptions:", error);
      toast.error("ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้");
    }
  };

  const loadItems = async () => {
    try {
      const response = await callGet("/api/document-control/items/", { page_size: 1000 });
      setItems(response.results || []);
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const loadItemData = async (itemId: string) => {
    try {
      setLoading(true);
      const data = await fetchItemById(itemId);
      setFormData({
        description: data.description || '',
        unit: data.unit || '',
        storage_location: data.storage_location || '',
        order_criteria_day: data.order_criteria_day || '',
        order_criteria_quantity: data.order_criteria_quantity || '',
        additional_order_point_day: data.additional_order_point_day || '',
        additional_order_point_quantity: data.additional_order_point_quantity || '',
        safety_criteria_day: data.safety_criteria_day || '',
        safety_criteria_quantity: data.safety_criteria_quantity || '',
        pending_received_1: data.pending_received_1 || '',
        pending_received_2: data.pending_received_2 || '',
        pending_received_3: data.pending_received_3 || '',
        pending_received_4: data.pending_received_4 || '',
        notes: data.notes || '',
        alternatives: data.alternatives?.map((alt: any) => alt.alternative_item) || [],
        equipments: data.related_equipments?.map((eq: any) => ({
          equipment_name: eq.equipment_name,
          equipment_code: eq.equipment_code || ''
        })) || [],
        pending_transactions: data.pending_transactions?.map((pt: any) => ({
          transaction_type: pt.transaction_type,
          date: pt.date,
          document_no: pt.document_no,
          unit: pt.unit,
          quantity: pt.quantity
        })) || [],
        stock_transactions: data.transactions?.map((st: any) => ({
          date: st.date,
          receive_quantity: st.receive_quantity,
          unit_price: st.unit_price,
          receive_document_no: st.receive_document_no || '',
          initial_demand: st.initial_demand,
          replacement_demand: st.replacement_demand,
          issue_quantity: st.issue_quantity,
          total_borrowed: st.total_borrowed,
          stock_balance: st.stock_balance || 0,
          signature: st.signature || '',
          notes: st.notes || ''
        })) || [],
      });
    } catch (error) {
      console.error("Error loading item data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAlternativesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      alternatives: typeof value === 'string' ? value.split(',').map(Number) : value as any
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipments: [...prev.equipments, { equipment_name: '', equipment_code: '' }]
    }));
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipments: prev.equipments.filter((_, i) => i !== index)
    }));
  };

  const handleEquipmentChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      equipments: prev.equipments.map((eq, i) => 
        i === index ? { ...eq, [field]: value } : eq
      )
    }));
  };

  const addPendingTransaction = () => {
    setFormData(prev => ({
      ...prev,
      pending_transactions: [...prev.pending_transactions, {
        transaction_type: 'receive',
        date: new Date().toISOString().split('T')[0],
        document_no: '',
        unit: formData.unit || '',
        quantity: ''
      }]
    }));
  };

  const removePendingTransaction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pending_transactions: prev.pending_transactions.filter((_, i) => i !== index)
    }));
  };

  const handlePendingTransactionChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      pending_transactions: prev.pending_transactions.map((pt, i) => 
        i === index ? { ...pt, [field]: value } : pt
      )
    }));
  };

  const addStockTransaction = () => {
    const previousBalance = formData.stock_transactions.length > 0 
      ? Number(formData.stock_transactions[formData.stock_transactions.length - 1].stock_balance) || 0
      : 0;
    
    setFormData(prev => ({
      ...prev,
      stock_transactions: [...prev.stock_transactions, {
        date: new Date().toISOString().split('T')[0],
        receive_quantity: '' as string | number,
        unit_price: '' as string | number,
        receive_document_no: '',
        initial_demand: '' as string | number,
        replacement_demand: '' as string | number,
        issue_quantity: '' as string | number,
        total_borrowed: '' as string | number,
        stock_balance: previousBalance as string | number,
        signature: '',
        notes: ''
      }]
    }));
  };

  const removeStockTransaction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stock_transactions: prev.stock_transactions.filter((_, i) => i !== index)
    }));
  };

  const handleStockTransactionChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedTransactions = [...prev.stock_transactions];
      updatedTransactions[index] = { ...updatedTransactions[index], [field]: value };
      
      // Calculate stock_balance when receive_quantity or issue_quantity changes
      if (field === 'receive_quantity' || field === 'issue_quantity') {
        const previousBalance = index > 0 
          ? Number(updatedTransactions[index - 1].stock_balance) || 0
          : 0;
        
        const receiveQty = Number(updatedTransactions[index].receive_quantity) || 0;
        const issueQty = Number(updatedTransactions[index].issue_quantity) || 0;
        
        updatedTransactions[index].stock_balance = previousBalance + receiveQty - issueQty;
        
        // Recalculate all subsequent transactions
        for (let i = index + 1; i < updatedTransactions.length; i++) {
          const prevBalance = Number(updatedTransactions[i - 1].stock_balance) || 0;
          const recv = Number(updatedTransactions[i].receive_quantity) || 0;
          const issue = Number(updatedTransactions[i].issue_quantity) || 0;
          updatedTransactions[i].stock_balance = prevBalance + recv - issue;
        }
      }
      
      return {
        ...prev,
        stock_transactions: updatedTransactions
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description) {
      toast.error("กรุณาเลือกรายการครุภัณฑ์");
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        description: Number(formData.description),
        unit: formData.unit,
        storage_location: formData.storage_location,
        order_criteria_day: Number(formData.order_criteria_day) || 0,
        order_criteria_quantity: Number(formData.order_criteria_quantity) || 0,
        additional_order_point_day: Number(formData.additional_order_point_day) || 0,
        additional_order_point_quantity: Number(formData.additional_order_point_quantity) || 0,
        safety_criteria_day: Number(formData.safety_criteria_day) || 0,
        safety_criteria_quantity: Number(formData.safety_criteria_quantity) || 0,
        pending_received_1: formData.pending_received_1,
        pending_received_2: formData.pending_received_2,
        pending_received_3: formData.pending_received_3,
        pending_received_4: formData.pending_received_4,
        notes: formData.notes,
        alternatives: formData.alternatives,
        equipments: formData.equipments,
        pending_transactions: formData.pending_transactions.map(pt => ({
          transaction_type: pt.transaction_type,
          date: pt.date,
          document_no: pt.document_no,
          unit: pt.unit,
          quantity: Number(pt.quantity) || 0
        })),
        stock_transactions: formData.stock_transactions.map(st => ({
          date: st.date,
          receive_quantity: Number(st.receive_quantity) || 0,
          unit_price: Number(st.unit_price) || 0,
          receive_document_no: st.receive_document_no,
          initial_demand: Number(st.initial_demand) || 0,
          replacement_demand: Number(st.replacement_demand) || 0,
          issue_quantity: Number(st.issue_quantity) || 0,
          total_borrowed: Number(st.total_borrowed) || 0,
          stock_balance: Number(st.stock_balance) || 0,
          signature: st.signature,
          notes: st.notes
        })),
      };

      if (isEditMode && id) {
        await updateItem(id, submitData);
        toast.success("อัพเดทข้อมูลสำเร็จ");
      } else {
        await createItem(submitData);
        toast.success("บันทึกข้อมูลสำเร็จ");
      }
      
      navigate('/document-control');
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage = error?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/document-control');
  };

  if (loading && isEditMode) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'แก้ไขข้อมูลครุภัณฑ์' : 'เพิ่มครุภัณฑ์ใหม่'}
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  fullWidth
                  options={descriptions}
                  getOptionLabel={(option) => `${option.Des_id} - ${option.Des_name}`}
                  filterOptions={(options, state) =>
                    options.filter(o => (`${o.Des_id} - ${o.Des_name}`).toLowerCase().includes(state.inputValue.toLowerCase()))
                  }
                  value={descriptions.find((desc) => desc.id === formData.description) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      description: newValue ? newValue.id : ''
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="รายการครุภัณฑ์"
                      required
                      size="small"
                      placeholder="ค้นหารายการครุภัณฑ์..."
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText="ไม่พบข้อมูล"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="หน่วย"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="สถานที่จัดเก็บ"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  เกณฑ์การสั่ง
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="วัน"
                  name="order_criteria_day"
                  type="number"
                  value={formData.order_criteria_day}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="จำนวน"
                  name="order_criteria_quantity"
                  type="number"
                  value={formData.order_criteria_quantity}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  จุดสั่งเพิ่มเติม
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="วัน"
                  name="additional_order_point_day"
                  type="number"
                  value={formData.additional_order_point_day}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="จำนวน"
                  name="additional_order_point_quantity"
                  type="number"
                  value={formData.additional_order_point_quantity}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  เกณฑ์ปลอดภัย
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="วัน"
                  name="safety_criteria_day"
                  type="number"
                  value={formData.safety_criteria_day}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="จำนวน"
                  name="safety_criteria_quantity"
                  type="number"
                  value={formData.safety_criteria_quantity}
                  onChange={handleInputChange}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  รับค้าง
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="รับค้าง 1"
                  name="pending_received_1"
                  value={formData.pending_received_1}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="รับค้าง 2"
                  name="pending_received_2"
                  value={formData.pending_received_2}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="รับค้าง 3"
                  name="pending_received_3"
                  value={formData.pending_received_3}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="รับค้าง 4"
                  name="pending_received_4"
                  value={formData.pending_received_4}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  พัสดุแทนกันได้
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="เลือกพัสดุแทนกันได้"
                  value={formData.alternatives}
                  onChange={handleAlternativesChange}
                  size="small"
                  SelectProps={{
                    multiple: true,
                  }}
                >
                  {items.filter(item => item.id !== Number(id)).map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.Des_id} - {item.Des_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    ครุภัณฑ์ที่เกี่ยวข้อง
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addEquipment}
                  >
                    + เพิ่มครุภัณฑ์
                  </Button>
                </Box>
                {formData.equipments.map((equipment, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          fullWidth
                          label="ชื่อครุภัณฑ์"
                          value={equipment.equipment_name}
                          onChange={(e) => handleEquipmentChange(index, 'equipment_name', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          fullWidth
                          label="รหัสครุภัณฑ์"
                          value={equipment.equipment_code}
                          onChange={(e) => handleEquipmentChange(index, 'equipment_code', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeEquipment(index)}
                        >
                          ลบ
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    รายการค้าง (Pending Transactions)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addPendingTransaction}
                  >
                    + เพิ่มรายการค้าง
                  </Button>
                </Box>
                {formData.pending_transactions.map((pt, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          select
                          fullWidth
                          label="ประเภท"
                          value={pt.transaction_type}
                          onChange={(e) => handlePendingTransactionChange(index, 'transaction_type', e.target.value)}
                          size="small"
                        >
                          <MenuItem value="receive">ค้างรับ</MenuItem>
                          <MenuItem value="issue">ค้างจ่าย</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          label="วันที่"
                          type="date"
                          value={pt.date}
                          onChange={(e) => handlePendingTransactionChange(index, 'date', e.target.value)}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="หลักฐาน"
                          value={pt.document_no}
                          onChange={(e) => handlePendingTransactionChange(index, 'document_no', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="หน่วย"
                          value={pt.unit}
                          onChange={(e) => handlePendingTransactionChange(index, 'unit', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          label="จำนวน"
                          type="number"
                          value={pt.quantity}
                          onChange={(e) => handlePendingTransactionChange(index, 'quantity', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removePendingTransaction(index)}
                        >
                          ลบรายการค้าง
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    รายการรับ-จ่าย (Stock Transactions)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addStockTransaction}
                  >
                    + เพิ่มรายการรับ-จ่าย
                  </Button>
                </Box>
                {formData.stock_transactions.map((st, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                          รายการที่ {index + 1}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="วันที่"
                          type="date"
                          value={st.date}
                          onChange={(e) => handleStockTransactionChange(index, 'date', e.target.value)}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="รับ (จำนวน)"
                          type="number"
                          value={st.receive_quantity}
                          onChange={(e) => handleStockTransactionChange(index, 'receive_quantity', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="ราคาต่อหน่วย"
                          type="number"
                          value={st.unit_price}
                          onChange={(e) => handleStockTransactionChange(index, 'unit_price', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="หลักฐานรับ"
                          value={st.receive_document_no}
                          onChange={(e) => handleStockTransactionChange(index, 'receive_document_no', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="ความต้องการขั้นต้น"
                          type="number"
                          value={st.initial_demand}
                          onChange={(e) => handleStockTransactionChange(index, 'initial_demand', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="ความต้องการทดแทน"
                          type="number"
                          value={st.replacement_demand}
                          onChange={(e) => handleStockTransactionChange(index, 'replacement_demand', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          label="จ่าย (จำนวน)"
                          type="number"
                          value={st.issue_quantity}
                          onChange={(e) => handleStockTransactionChange(index, 'issue_quantity', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          label="คงคลัง"
                          type="number"
                          value={st.stock_balance}
                          size="small"
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            '& .MuiInputBase-input': {
                              backgroundColor: '#f5f5f5',
                              fontWeight: 'bold',
                              color: Number(st.stock_balance) < 0 ? 'error.main' : 'success.main'
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          label="รวมยืม"
                          type="number"
                          value={st.total_borrowed}
                          onChange={(e) => handleStockTransactionChange(index, 'total_borrowed', e.target.value)}
                          size="small"
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          label="ลายมือชื่อ/ผู้รับผิดชอบ"
                          value={st.signature}
                          onChange={(e) => handleStockTransactionChange(index, 'signature', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="หมายเหตุรายการ"
                          value={st.notes}
                          onChange={(e) => handleStockTransactionChange(index, 'notes', e.target.value)}
                          size="small"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeStockTransaction(index)}
                        >
                          ลบรายการรับ-จ่าย
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="หมายเหตุ"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ItemForm;
