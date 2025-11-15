import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
// use responsive grid cards instead of wide table to avoid horizontal scroll
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';

import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { createInventoryRecord, fetchInventoryRecordById, updateInventoryRecord } from '../../../apis/service/inventory';
import { fetchDocumentRegistries } from '../../../apis/service/documentRegistry';

interface DocumentRegistry {
  id: number;
  registry_number: string;
  document_title: string;
  registration_date: string;
}

interface InventoryRecordFormData {
  id?: string; // temporary id for tracking
  order_criteria: string;
  reorder_point: string;
  safety_stock: string;
  related_equipment: string;
  remark: string;
  doc_date_left: string;
  evidence_left: string;
  unit_left: string;
  qty_left: string;
  pending_receive_1: string;
  pending_receive_2: string;
  pending_receive_3: string;
  pending_receive_4: string;
  doc_date_right: string;
  received_qty: string;
  price_per_unit: string;
  evidence_right: string;
  demand_initial: string;
  demand_replace: string;
  issued_qty: string;
  total_borrowed: string;
  stock_balance: string;
  signature: string;
}

const createEmptyRecord = (): InventoryRecordFormData => ({
  id: `temp-${Date.now()}-${Math.random()}`,
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
});

const FormInventoryRecord: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [documentRegistries, setDocumentRegistries] = useState<DocumentRegistry[]>([]);
  const [selectedDocumentRegistry, setSelectedDocumentRegistry] = useState<DocumentRegistry | null>(null);
  const [records, setRecords] = useState<InventoryRecordFormData[]>([createEmptyRecord()]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch existing inventory record if id is provided
  useEffect(() => {
    if (id) {
      const fetchInventoryData = async () => {
        setLoading(true);
        try {
          const data = await fetchInventoryRecordById(id);
          
          // Convert fetched data to form data format
          const formData: InventoryRecordFormData = {
            id: data.id,
            order_criteria: data.order_criteria || '',
            reorder_point: data.reorder_point || '',
            safety_stock: data.safety_stock || '',
            related_equipment: data.related_equipment || '',
            remark: data.remark || '',
            doc_date_left: data.doc_date_left || '',
            evidence_left: data.evidence_left || '',
            unit_left: data.unit_left || '',
            qty_left: data.qty_left?.toString() || '',
            pending_receive_1: data.pending_receive_1?.toString() || '',
            pending_receive_2: data.pending_receive_2?.toString() || '',
            pending_receive_3: data.pending_receive_3?.toString() || '',
            pending_receive_4: data.pending_receive_4?.toString() || '',
            doc_date_right: data.doc_date_right || '',
            received_qty: data.received_qty?.toString() || '',
            price_per_unit: data.price_per_unit?.toString() || '',
            evidence_right: data.evidence_right || '',
            demand_initial: data.demand_initial?.toString() || '',
            demand_replace: data.demand_replace?.toString() || '',
            issued_qty: data.issued_qty?.toString() || '',
            total_borrowed: data.total_borrowed?.toString() || '',
            stock_balance: data.stock_balance?.toString() || '',
            signature: data.signature || '',
          };
          
          setRecords([formData]);
          setIsEditMode(true);
          
          // Set document registry ID for fetching later
          if (data.document_registry) {
            searchParams.set('document_registry', data.document_registry.toString());
          }
        } catch (error) {
          console.error('Error fetching inventory record:', error);
          toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
          setLoading(false);
        }
      };
      
      fetchInventoryData();
    }
  }, [id]);

  // Fetch document registries for dropdown
  useEffect(() => {
    const fetchRegistries = async () => {
      try {
        const response = await fetchDocumentRegistries({ page_size: 1000 });
        setDocumentRegistries(response.results || []);
        
        // Check if document_registry is passed via query parameter or from fetched data
        const documentRegistryId = searchParams.get('document_registry');
        if (documentRegistryId && response.results) {
          const preSelectedDoc = response.results.find(
            (doc: DocumentRegistry) => doc.id === parseInt(documentRegistryId)
          );
          if (preSelectedDoc) {
            setSelectedDocumentRegistry(preSelectedDoc);
          }
        }
      } catch (error) {
        console.error("Error fetching document registries:", error);
        toast.error('ไม่สามารถโหลดรายการทะเบียนเอกสารได้');
      }
    };
    fetchRegistries();
  }, [searchParams]);

  const handleDocumentRegistryChange = (_event: any, value: DocumentRegistry | null) => {
    setSelectedDocumentRegistry(value);
  };

  const handleRecordChange = (recordId: string, field: keyof InventoryRecordFormData, value: string) => {
    setRecords(prev => prev.map(record => 
      record.id === recordId ? { ...record, [field]: value } : record
    ));
  };

  const handleAddRecord = () => {
    setRecords(prev => [...prev, createEmptyRecord()]);
  };

  const handleRemoveRecord = (recordId: string) => {
    if (records.length === 1) {
      toast.error('ต้องมีอย่างน้อย 1 รายการ');
      return;
    }
    setRecords(prev => prev.filter(record => record.id !== recordId));
  };

  const handleSubmit = async (e: React.FormEvent, saveAndContinue = false) => {
    e.preventDefault();

    if (!selectedDocumentRegistry) {
      toast.error('กรุณาเลือกทะเบียนเอกสาร');
      return;
    }

    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อนทำการบันทึก');
      navigate('/login');
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      // If in edit mode (has numeric id), update the single record
      if (isEditMode && id) {
        const record = records[0];
        try {
          const submitData = {
            document_registry: selectedDocumentRegistry.id,
            order_criteria: record.order_criteria || null,
            reorder_point: record.reorder_point || null,
            safety_stock: record.safety_stock || null,
            related_equipment: record.related_equipment || null,
            remark: record.remark || null,
            doc_date_left: record.doc_date_left || null,
            evidence_left: record.evidence_left || null,
            unit_left: record.unit_left || null,
            qty_left: record.qty_left ? parseInt(record.qty_left) : null,
            pending_receive_1: record.pending_receive_1 ? parseInt(record.pending_receive_1) : null,
            pending_receive_2: record.pending_receive_2 ? parseInt(record.pending_receive_2) : null,
            pending_receive_3: record.pending_receive_3 ? parseInt(record.pending_receive_3) : null,
            pending_receive_4: record.pending_receive_4 ? parseInt(record.pending_receive_4) : null,
            doc_date_right: record.doc_date_right || null,
            received_qty: record.received_qty ? parseInt(record.received_qty) : null,
            price_per_unit: record.price_per_unit ? parseFloat(record.price_per_unit) : null,
            evidence_right: record.evidence_right || null,
            demand_initial: record.demand_initial ? parseInt(record.demand_initial) : null,
            demand_replace: record.demand_replace ? parseInt(record.demand_replace) : null,
            issued_qty: record.issued_qty ? parseInt(record.issued_qty) : null,
            total_borrowed: record.total_borrowed ? parseInt(record.total_borrowed) : null,
            stock_balance: record.stock_balance ? parseInt(record.stock_balance) : null,
            signature: record.signature || null,
          };

          await updateInventoryRecord(id, submitData);
          toast.success('บันทึกข้อมูลสำเร็จ');
          
          // Navigate back to document registry or list
          if (selectedDocumentRegistry?.id) {
            navigate(`/document-registries/${selectedDocumentRegistry.id}`);
          } else {
            navigate('/inventory-records');
          }
        } catch (error) {
          console.error('Error updating inventory record:', error);
          toast.error('ไม่สามารถบันทึกข้อมูลได้');
        }
      } else {
        // Create mode - handle multiple records
        for (const record of records) {
          try {
            const submitData = {
              document_registry: selectedDocumentRegistry.id,
              order_criteria: record.order_criteria || null,
              reorder_point: record.reorder_point || null,
              safety_stock: record.safety_stock || null,
              related_equipment: record.related_equipment || null,
              remark: record.remark || null,
              doc_date_left: record.doc_date_left || null,
              evidence_left: record.evidence_left || null,
              unit_left: record.unit_left || null,
              qty_left: record.qty_left ? parseInt(record.qty_left) : null,
              pending_receive_1: record.pending_receive_1 ? parseInt(record.pending_receive_1) : null,
              pending_receive_2: record.pending_receive_2 ? parseInt(record.pending_receive_2) : null,
              pending_receive_3: record.pending_receive_3 ? parseInt(record.pending_receive_3) : null,
              pending_receive_4: record.pending_receive_4 ? parseInt(record.pending_receive_4) : null,
              doc_date_right: record.doc_date_right || null,
              received_qty: record.received_qty ? parseInt(record.received_qty) : null,
              price_per_unit: record.price_per_unit ? parseFloat(record.price_per_unit) : null,
              evidence_right: record.evidence_right || null,
              demand_initial: record.demand_initial ? parseInt(record.demand_initial) : null,
              demand_replace: record.demand_replace ? parseInt(record.demand_replace) : null,
              issued_qty: record.issued_qty ? parseInt(record.issued_qty) : null,
              total_borrowed: record.total_borrowed ? parseInt(record.total_borrowed) : null,
              stock_balance: record.stock_balance ? parseInt(record.stock_balance) : null,
              signature: record.signature || null,
            };

            await createInventoryRecord(submitData);
            successCount++;
          } catch (error) {
            console.error('Error saving inventory record:', error);
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`บันทึกสำเร็จ ${successCount} รายการ${errorCount > 0 ? ` (ล้มเหลว ${errorCount} รายการ)` : ''}`);
          
          if (saveAndContinue) {
            // Reset form for new entries but keep the selected document registry
            setRecords([createEmptyRecord()]);
          } else {
            // Navigate back to document registry
            if (selectedDocumentRegistry?.id) {
              navigate(`/document-registries/${selectedDocumentRegistry.id}`);
            } else {
              navigate('/inventory-records');
            }
          }
        } else {
          toast.error('ไม่สามารถบันทึกข้อมูลได้');
        }
      }
    } catch (error) {
      console.error('Error saving inventory records:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCancel = () => {
    if (selectedDocumentRegistry?.id) {
      navigate(`/document-registries/${selectedDocumentRegistry.id}`);
    } else {
      navigate('/inventory-records');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'แก้ไขบันทึกรายการพัสดุ' : 'เพิ่มบันทึกรายการพัสดุ'}
          </Typography>
        </Box>

        {!isAuthenticated && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            กรุณาเข้าสู่ระบบเพื่อ{isEditMode ? 'แก้ไข' : 'เพิ่ม'}บันทึกรายการพัสดุ
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Stack spacing={3}>
              {/* รายการ (Document Registry) */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>รายการ (ทะเบียนเอกสาร) *</Typography>
                <Autocomplete
                  value={selectedDocumentRegistry}
                  onChange={handleDocumentRegistryChange}
                  options={documentRegistries}
                  getOptionLabel={(option) => `${option.registry_number} - ${option.document_title}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="เลือกทะเบียนเอกสาร"
                      required
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={isEditMode}
                />
              </Box>

              <Divider />

              {/* Table for multiple records */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">รายการพัสดุ</Typography>
                  {!isEditMode && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddRecord}
                    >
                      เพิ่มแถว
                    </Button>
                  )}
                </Box>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', alignItems: 'start' }}>
                {records.map((record, index) => (
                  <Paper key={record.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">รายการ {index + 1}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveRecord(record.id!)}
                        disabled={records.length === 1 || isEditMode}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Stack spacing={1}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <TextField
                          size="small"
                          label="เกณฑ์สั่ง"
                          value={record.order_criteria}
                          onChange={(e) => handleRecordChange(record.id!, 'order_criteria', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="จุดสั่งเพิ่มเติม"
                          value={record.reorder_point}
                          onChange={(e) => handleRecordChange(record.id!, 'reorder_point', e.target.value)}
                          fullWidth
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <TextField
                          size="small"
                          label="เกณฑ์ปลอดภัย"
                          value={record.safety_stock}
                          onChange={(e) => handleRecordChange(record.id!, 'safety_stock', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="หน่วย"
                          value={record.unit_left}
                          onChange={(e) => handleRecordChange(record.id!, 'unit_left', e.target.value)}
                          fullWidth
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <TextField
                          size="small"
                          label="จำนวน"
                          type="number"
                          value={record.qty_left}
                          onChange={(e) => handleRecordChange(record.id!, 'qty_left', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="รับ"
                          type="number"
                          value={record.received_qty}
                          onChange={(e) => handleRecordChange(record.id!, 'received_qty', e.target.value)}
                          fullWidth
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <TextField
                          size="small"
                          label="ราคาต่อหน่วย"
                          type="number"
                          inputProps={{ step: '0.01' }}
                          value={record.price_per_unit}
                          onChange={(e) => handleRecordChange(record.id!, 'price_per_unit', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="จ่าย"
                          type="number"
                          value={record.issued_qty}
                          onChange={(e) => handleRecordChange(record.id!, 'issued_qty', e.target.value)}
                          fullWidth
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <TextField
                          size="small"
                          label="คงคลัง"
                          type="number"
                          value={record.stock_balance}
                          onChange={(e) => handleRecordChange(record.id!, 'stock_balance', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          size="small"
                          label="หลักฐาน"
                          value={record.evidence_right}
                          onChange={(e) => handleRecordChange(record.id!, 'evidence_right', e.target.value)}
                          fullWidth
                        />
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                size="large"
              >
                ยกเลิก
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {!isEditMode && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    disabled={!isAuthenticated}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    บันทึกและเพิ่มอีก
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!isAuthenticated}
                >
                  {isEditMode ? 'บันทึกและกลับ' : `บันทึกและกลับ (${records.length} รายการ)`}
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
        )}
      </Paper>
    </Container>
  );
};

export default FormInventoryRecord;
