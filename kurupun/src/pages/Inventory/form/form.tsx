import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import { AddformModal } from '../../../components/InventoryModal';
import { formatDateToThai } from '../../../utils/mappingMouth';
import {
  createInventory,
  updateInventory,
  fetchInventoryById,
  addInventoryTransaction,
  getInventoryTransactions,
  clearInventoryTransactions,
} from '../../../apis/service/inventory';
import { fetchDocumentRecords, getTotalStockBalance, partialUpdateDocumentRecord } from '../../../apis/service/documents';
import { InventoryFormValues } from '../../../types/inventory';
import { DocumentRecord } from '../../../types/document';

interface InventoryRow {
  id: number;
  date: string;
  evidence: string;
  unitPrice: number;
  type: string;
  quantity: number;
  totalBorrowed?: number;
}
const getRequestTypeLabel = (type: string) => {
  return type === 'INITIAL' ? 'ขั้นต้น' : 'ทดแทน';
};
const receiveColumns: GridColDef[] = [
  { field: 'id', headerName: 'ลำดับ', flex: 0.5 },
  { field: 'date', headerName: 'วันที่', flex: 1, valueFormatter: (params: any) => formatDateToThai(params) },
  { field: 'evidence', headerName: 'หลักฐาน', flex: 1.5 },
  { field: 'unitPrice', headerName: 'ราคาต่อหน่วย', type: 'number', flex: 1 },
  {
    field: 'type', headerName: 'ประเภท', flex: 1, renderCell: (params) => (
      <span>{getRequestTypeLabel(params.value as string)}</span>
    )
  },
  { field: 'quantity', headerName: 'จำนวนที่รับ', type: 'number', flex: 1 },
];

const spendColumns: GridColDef[] = [
  { field: 'id', headerName: 'ลำดับ', flex: 0.5 },
  { field: 'date', headerName: 'วันที่', flex: 1 , valueFormatter: (params: any) => formatDateToThai(params)},
  { field: 'evidence', headerName: 'หลักฐาน', flex: 1.5 },
  { field: 'unitPrice', headerName: 'ราคาต่อหน่วย', type: 'number', flex: 1 },
  {
    field: 'type', headerName: 'ประเภท', flex: 1, renderCell: (params) => (
      <span>{getRequestTypeLabel(params.value as string)}</span>
    )
  },
  { field: 'quantity', headerName: 'จ่าย', type: 'number', flex: 0.8 },
  { field: 'totalBorrowed', headerName: 'รวมยืม', type: 'number', flex: 0.8 },
];

const validationSchema = Yup.object({});


function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // ?inventory_number=xxx
  const queryParams = new URLSearchParams(window.location.search);
  const inventoryNumberParam = queryParams.get('inventory_number');
  const [loading, setLoading] = useState(false);
  const [openAddFormModal, setOpenAddFormModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [selectMode, setSelectMode] = useState<'receive' | 'spend'>('receive');
  const [documentRecords, setDocumentRecords] = useState<DocumentRecord[]>([]);
  const [previousStockBalance, setPreviousStockBalance] = useState<number>(0);
  const [receiveRows, setReceiveRows] = useState<InventoryRow[]>([]);
  const [spendRows, setSpendRows] = useState<InventoryRow[]>([]);
  const [calculatedStockBalance, setCalculatedStockBalance] = useState<number>(0);
  const isEditMode = Boolean(id);
  const [currentDocument, setCurrentDocument] = useState<DocumentRecord | null>(null);
  const [editingRow, setEditingRow] = useState<InventoryRow | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const currentDoc = documentRecords.find((doc) => doc.inventory_number === queryParams.get('inventory_number')!);
  const paginationModel = { page: 0, pageSize: 5 };
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
      unit_of_measure: '',
      storage_location: '',
      inventory_alternate_numbers: '',
      related_equipment: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!values.document_record) {
        toast.error('กรุณาเลือกทะเบียนเอกสาร');
        return;
      }

      if (receiveRows.length === 0 && spendRows.length === 0) {
        toast.error('กรุณาเพิ่มรายการรับหรือจ่ายอย่างน้อย 1 รายการ');
        return;
      }

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

        let inventoryId: number;

        if (isEditMode) {
          // Update inventory
          await updateInventory(parseInt(id!), payload);
          inventoryId = parseInt(id!);

          // Update DocumentRecord fields
          if (values.document_record) {
            await partialUpdateDocumentRecord(parseInt(values.document_record), {
              unit_of_measure: values.unit_of_measure || '',
              storage_location: values.storage_location || '',
              inventory_alternate_numbers: values.inventory_alternate_numbers
                ? values.inventory_alternate_numbers.split(',').map((item) => item.trim())
                : null,
              related_equipment: values.related_equipment
                ? values.related_equipment.split(',').map((item) => item.trim())
                : null,
            });
          }

          // ลบ transactions เก่าทั้งหมด
          await clearInventoryTransactions(inventoryId);

          // เพิ่ม transactions ใหม่ทั้งหมด
          for (const row of receiveRows) {
            await addInventoryTransaction(inventoryId, {
              transaction_type: 'RECEIVE',
              transaction_date: row.date,
              evidence: row.evidence,
              unit_price: row.unitPrice,
              type: row.type,
              quantity: row.quantity,
            });
          }

          for (const row of spendRows) {
            await addInventoryTransaction(inventoryId, {
              transaction_type: 'ISSUE',
              transaction_date: row.date,
              evidence: row.evidence,
              unit_price: row.unitPrice,
              type: row.type,
              quantity: row.quantity,
              total_borrowed: row.totalBorrowed || 0,
            });
          }

          toast.success('อัปเดตข้อมูลเรียบร้อย');
        } else {
          // Create new inventory
          const createdInventory = await createInventory(payload);
          inventoryId = createdInventory.id!;

          // Update DocumentRecord fields
          if (values.document_record) {
            await partialUpdateDocumentRecord(parseInt(values.document_record), {
              unit_of_measure: values.unit_of_measure || '',
              storage_location: values.storage_location || '',
              inventory_alternate_numbers: values.inventory_alternate_numbers
                ? values.inventory_alternate_numbers.split(',').map((item) => item.trim())
                : null,
              related_equipment: values.related_equipment
                ? values.related_equipment.split(',').map((item) => item.trim())
                : null,
            });
          }

          // เพิ่มรายการรับทั้งหมด
          for (const row of receiveRows) {
            await addInventoryTransaction(inventoryId, {
              transaction_type: 'RECEIVE',
              transaction_date: row.date,
              evidence: row.evidence,
              unit_price: row.unitPrice,
              type: row.type,
              quantity: row.quantity,
            });
          }

          // เพิ่มรายการจ่ายทั้งหมด
          for (const row of spendRows) {
            await addInventoryTransaction(inventoryId, {
              transaction_type: 'ISSUE',
              transaction_date: row.date,
              evidence: row.evidence,
              unit_price: row.unitPrice,
              type: row.type,
              quantity: row.quantity,
              total_borrowed: row.totalBorrowed || 0,
            });
          }

          toast.success('บันทึกข้อมูลเรียบร้อย');
        }

        navigate('/inventory');
      } catch (error) {
        console.error('Error saving inventory:', error);
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const document = await loadDocumentRecords();
      if (isEditMode) {
        loadInventoryData(document);
      }
    };
    loadData();
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
    const findedDoc = documentRecords.find((doc => doc.id === parseInt(formik.values.document_record)));
    if (findedDoc) {
      setCurrentDocument(findedDoc);
    } else {
      setCurrentDocument(null);
    }
  }, [formik.values.document_record, isEditMode]);


  useEffect(() => {
    if (currentDocument) {
      const format_request_evidence = `${currentDocument.document_type} - ${currentDocument.sender}${currentDocument.related_document_number && `- ${currentDocument.related_document_number}`} - ${currentDocument.registerNo}`;
      formik.setFieldValue('request_evidence', format_request_evidence);
      formik.setFieldValue('unit_of_measure', currentDocument.unit_of_measure || '');
    } else {
      formik.setFieldValue('unit_of_measure', '');
    }
  }, [currentDocument])

  const loadDocumentRecords = async () => {
    try {
      const response = await fetchDocumentRecords({ page_size: 1000 });
      setDocumentRecords(response.results);
      return response.results;
    } catch (error) {
      console.error('Error loading document records:', error);
    }
  };

  const loadInventoryData = async (documentRecords: any) => {
    setInitialLoading(true);
    try {
      const data = await fetchInventoryById(parseInt(id!));

      // โหลด DocumentRecord เพื่อเอาข้อมูลพัสดุ
      const docRecord = documentRecords.find((doc: any) => doc.id === data.document_record);

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
        unit_of_measure: docRecord?.unit_of_measure || '',
        storage_location: docRecord?.storage_location || '',
        inventory_alternate_numbers: Array.isArray(docRecord?.inventory_alternate_numbers)
          ? docRecord.inventory_alternate_numbers.join(', ')
          : '',
        related_equipment: Array.isArray(docRecord?.related_equipment)
          ? docRecord.related_equipment.join(', ')
          : '',
      });

      // โหลด transactions
      const transactions = await getInventoryTransactions(parseInt(id!));

      // แยก transactions เป็น receive และ issue
      const receives = transactions.filter((t: any) => t.transaction_type === 'RECEIVE');
      const issues = transactions.filter((t: any) => t.transaction_type === 'ISSUE');

      setReceiveRows(receives.map((t: any, index: number) => ({
        id: index + 1,
        date: t.transaction_date,
        evidence: t.evidence,
        unitPrice: parseFloat(t.unit_price),
        type: t.type,
        quantity: t.quantity,
      })));

      setSpendRows(issues.map((t: any, index: number) => ({
        id: index + 1,
        date: t.transaction_date,
        evidence: t.evidence,
        unitPrice: parseFloat(t.unit_price),
        type: t.type,
        quantity: t.quantity,
        totalBorrowed: t.total_borrowed || 0,
      })));
    } catch (error) {
      console.error('Error loading inventory data:', error);
      toast.error('หมดอายุการใช้งาน กรุณาเข้าสู่ระบบใหม่');
      navigate('/login');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventories');
  };

  const handleAddFormData = (data: any) => {
    if (isEditingMode && editingRow) {
      // Edit mode
      if (selectMode === 'receive') {
        setReceiveRows(receiveRows.map(row =>
          row.id === editingRow.id
            ? { ...row, ...data }
            : row
        ));
      } else {
        setSpendRows(spendRows.map(row =>
          row.id === editingRow.id
            ? { ...row, ...data }
            : row
        ));
      }
    } else {
      // Add mode
      if (selectMode === 'receive') {
        const newRow: InventoryRow = {
          id: receiveRows.length + 1,
          date: data.date,
          evidence: data.evidence,
          unitPrice: data.unitPrice,
          type: data.type,
          quantity: data.quantity,
        };
        setReceiveRows([...receiveRows, newRow]);
      } else {
        const newRow: any = {
          id: spendRows.length + 1,
          date: data.date,
          evidence: data.evidence,
          unitPrice: data.unitPrice,
          type: data.type,
          quantity: data.quantity,
          totalBorrowed: data.totalBorrowed || 0,
        };
        setSpendRows([...spendRows, newRow]);
      }
    }
    setOpenAddFormModal(false);
    setEditingRow(null);
    setIsEditingMode(false);
  };

  const handleEditReceive = (row: InventoryRow) => {
    setEditingRow(row);
    setIsEditingMode(true);
    setSelectMode('receive');
    setOpenAddFormModal(true);
  };

  const handleDeleteReceive = (id: number) => {
    setReceiveRows(receiveRows.filter(row => row.id !== id));
  };

  const handleEditSpend = (row: InventoryRow) => {
    setEditingRow(row);
    setIsEditingMode(true);
    setSelectMode('spend');
    setOpenAddFormModal(true);
  };

  const handleDeleteSpend = (id: number) => {
    setSpendRows(spendRows.filter(row => row.id !== id));
  };

  useEffect(() => {
    if (inventoryNumberParam) {
      const findedDoc = documentRecords.find(doc => doc.inventory_number === inventoryNumberParam);
      formik.setFieldValue('document_record', findedDoc?.id || '');
      setCurrentDocument(findedDoc || null);
    }
  }, [inventoryNumberParam, documentRecords])

  // คำนวณคงคลังอัตโนมัติจาก receiveRows และ spendRows
  useEffect(() => {
    const totalReceived = receiveRows.reduce((sum: any, row) => sum + (row.quantity || 0), 0);
    const totalIssued = spendRows.reduce((sum: any, row) => sum + (row.quantity || 0), 0);
    const totalBorrowed = spendRows.reduce((sum: any, row) => sum + (row.totalBorrowed || 0), 0);

    const newBalance = previousStockBalance + totalReceived - totalIssued - totalBorrowed;
    setCalculatedStockBalance(newBalance);
    formik.setFieldValue('stock_balance', newBalance.toString());
  }, [receiveRows, spendRows, previousStockBalance]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // สร้าง columns พร้อม actions
  const receiveColumnsWithActions: GridColDef[] = [
    ...receiveColumns,
    {
      field: 'actions',
      headerName: 'จัดการ',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditReceive(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteReceive(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const spendColumnsWithActions: GridColDef[] = [
    ...spendColumns,
    {
      field: 'actions',
      headerName: 'จัดการ',
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditSpend(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteSpend(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'แก้ไขทะเบียนคุมพัสดุ' : 'เพิ่มทะเบียนคุมพัสดุ'}
        </Typography>
        <Box>
          <Button variant='contained' sx={{ width: '150px', mr: 2 }} onClick={() => { setSelectMode('receive'); setOpenAddFormModal(true); }}>รับ</Button>
          <Button variant='contained' sx={{ width: '150px' }} onClick={() => { setSelectMode('spend'); setOpenAddFormModal(true); }}>จ่าย</Button>
        </Box>
      </Box>


      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            เชื่อมโยงกับเอกสาร
            <FormControl
              fullWidth
              error={formik.touched.document_record && Boolean(formik.errors.document_record)}
            >
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="document_record-label">
                  ทะเบียนเอกสาร
                </InputLabel>

                <Select
                  labelId="document_record-label"
                  id="document_record"
                  name="document_record"
                  disabled={inventoryNumberParam ? true : false}
                  value={formik.values.document_record}
                  label="ทะเบียนเอกสาร"
                  sx={{ mt: 1 }}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="">ไม่เชื่อมโยง</MenuItem>
                  {documentRecords.map((doc) => (
                    <MenuItem key={doc.id} value={doc.id}>
                      {doc.registerNo} - {doc.first_item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formik.touched.document_record && formik.errors.document_record && (
                <FormHelperText>{formik.errors.document_record}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" >ชื่อพัสดุ</Typography>
            <TextField
              fullWidth
              size="small"
              sx={{ mt: 1.5 }}
              disabled={inventoryNumberParam ? true : false}
              value={currentDocument ? currentDocument.first_item : ''}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1">หน่วยนับ</Typography>
            <TextField
              fullWidth
              size="small"
              name="unit_of_measure"
              sx={{ mt: 1.5 }}
              value={formik.values.unit_of_measure}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1">คงคลัง</Typography>
            <TextField
              fullWidth
              size="small"
              disabled
              sx={{ mt: 1.5 }}
              value={formik.values.stock_balance ? formik.values.stock_balance : ''}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1">ที่เก็บ</Typography>
            <TextField
              fullWidth
              size="small"
              name="storage_location"
              sx={{ mt: 1.5 }}
              value={formik.values.storage_location}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1">หมายเลขพัสดุแทนกันได้ (คั่นด้วยเครื่องหมายจุลภาค)</Typography>
            <TextField
              fullWidth
              size="small"
              name="inventory_alternate_numbers"
              placeholder="ตัวอย่าง: A001, A002, A003"
              sx={{ mt: 1.5 }}
              value={formik.values.inventory_alternate_numbers}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1">ครุภัณฑ์ที่เกี่ยวข้อง (คั่นด้วยเครื่องหมายจุลภาค)</Typography>
            <TextField
              fullWidth
              size="small"
              name="related_equipment"
              placeholder="ตัวอย่าง: คอมพิวเตอร์, เครื่องพิมพ์"
              sx={{ mt: 1.5 }}
              value={formik.values.related_equipment}
              onChange={formik.handleChange}
            />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        รับเข้า
        <Paper sx={{ height: 400, width: '100%', mt: 2 }}>
          <DataGrid
            rows={receiveRows}
            columns={receiveColumnsWithActions}
            disableRowSelectionOnClick
            disableMultipleRowSelection
            disableColumnFilter
            disableColumnMenu
            disableVirtualization
            disableColumnResize
            disableColumnSelector
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0, height: '100%', width: '100%' }}
          />
        </Paper>
        <Divider sx={{ my: 3 }} />
        จ่ายออก
        <Paper sx={{ height: 400, width: '100%', mt: 2 }}>
          <DataGrid
            rows={spendRows}
            columns={spendColumnsWithActions}
            disableRowSelectionOnClick
            disableMultipleRowSelection
            disableColumnFilter
            disableColumnMenu
            disableVirtualization
            disableColumnResize
            disableColumnSelector
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            sx={{ border: 0, height: '100%', width: '100%' }}
          />
        </Paper>

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
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={() => formik.handleSubmit()}
            disabled={loading || !formik.values.document_record}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </Box>

        {/* <form onSubmit={formik.handleSubmit}>
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
                        {doc.registerNo} - {doc.first_item}
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
          <Divider sx={{ mt: 4, mb: 3 }} />
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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

          <Divider sx={{ mt: 4, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            การรับ
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
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
          </Grid>
          <Divider sx={{ mt: 4, mb: 2 }} />

          <Typography variant="h6" gutterBottom>
            การจ่าย
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
        </form> */}
      </Paper>
      <AddformModal
        open={openAddFormModal}
        handleClose={() => {
          setOpenAddFormModal(false);
          setEditingRow(null);
          setIsEditingMode(false);
        }}
        mode={selectMode}
        data={formik.values}
        editData={editingRow}
        isEdit={isEditingMode}
        onSave={handleAddFormData}
      />
    </Box >
  );
}

export default InventoryForm;
