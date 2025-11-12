import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router';

interface RegistryItem {
  id: number; // จำเป็นสำหรับ DataGrid
  registry_number: string;
  registration_date: string; // ใช้ string หรือ Date ตาม API
  document_title: string;
  sender: string;
  first_item: string;
  storage_date: string;
  related_document_number: string;
  withdrawal_set_number: string;
  notes?: string;
}

const rows: RegistryItem[] = [
  {
    id: 1,
    registry_number: 'RN001',
    registration_date: '2025-11-12',
    document_title: 'Document A',
    sender: 'John Doe',
    first_item: 'Item 1',
    storage_date: '2025-11-13',
    related_document_number: 'RD001',
    withdrawal_set_number: 'WS001',
    notes: 'Sample note',
  },
  {
    id: 2,
    registry_number: 'RN002',
    registration_date: '2025-11-10',
    document_title: 'Document B',
    sender: 'Jane Smith',
    first_item: 'Item 2',
    storage_date: '2025-11-11',
    related_document_number: 'RD002',
    withdrawal_set_number: 'WS002',
    notes: '',
  },
];



function TableDocument() {
  const navigate = useNavigate();
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ลำดับ',
      width: 80,
      renderCell: (params: GridRenderCellParams) => params.api.getAllRowIds().indexOf(params.id) + 1,
    },
    { field: 'registry_number', headerName: 'ทะเบียนที่', width: 150 },
    { field: 'registration_date', headerName: 'วันที่ลงทะเบียน', width: 150 },
    { field: 'document_title', headerName: 'เอกสาร', width: 200 },
    { field: 'sender', headerName: 'จาก', width: 150 },
    { field: 'first_item', headerName: 'รายการแรกในเอกสาร', width: 200 },
    { field: 'storage_date', headerName: 'วันที่เก็บเข้าแฟ้ม', width: 150 },
    { field: 'related_document_number', headerName: 'เลขที่เอกสารที่เกี่ยวข้อง', width: 180 },
    { field: 'withdrawal_set_number', headerName: 'เลขที่ชุดเบิก', width: 150 },
    { field: 'notes', headerName: 'หมายเหตุ', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate(`/${params.row.id}`)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => alert(`Delete ${params.row.registry_number}`)}
            >
              Delete
            </Button>
          </Stack>
        );
      },
    },
  ];
  return (
    <div>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
      />
    </div>
  )
}

export default TableDocument