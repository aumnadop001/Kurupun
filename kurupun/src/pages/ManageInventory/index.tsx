import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { styled, alpha } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TablePagination,
  Toolbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
} from '@mui/material';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  fetchDescriptionsList,
  deleteDescription,
  fetchMaster,
} from '../../apis/service/master';
import { Description, MasterData } from '../../types/description';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

function ManageInventory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [classFilter, setClassFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [gpscFilter, setGpscFilter] = useState<string>('');
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadMasterData = async () => {
    try {
      const response = await fetchMaster();
      setMasterData(response.results);
    } catch (error) {
      console.error('Error loading master data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลหลักได้');
    }
  };

  const loadDescriptions = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
      };

      if (classFilter) params.class_id = classFilter;
      if (typeFilter) params.type_id = typeFilter;
      if (gpscFilter) params.gpsc_id = gpscFilter;

      const response = await fetchDescriptionsList(params);
      setDescriptions(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error loading descriptions:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    loadDescriptions();
  }, [page, rowsPerPage, classFilter, typeFilter, gpscFilter]);

  const handleSearch = () => {
    setPage(0);
    loadDescriptions();
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreate = () => {
    navigate('/manage-inventory/create');
  };

  const handleEdit = (id: number) => {
    handleClose();
    navigate(`/manage-inventory/edit/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    handleClose();
    setSelectedDescriptionId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDescriptionId) {
      try {
        await deleteDescription(selectedDescriptionId);
        loadDescriptions();
        toast.success('ลบรายละเอียดพัสดุเรียบร้อย');
      } catch (error) {
        console.error('Error deleting description:', error);
        toast.error('เกิดข้อผิดพลาดในการลบรายละเอียดพัสดุ');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedDescriptionId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDescriptionId(null);
  };

  const handleClearFilters = () => {
    setClassFilter('');
    setTypeFilter('');
    setGpscFilter('');
    setSearchTerm('');
    setPage(0);
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            จัดการรายละเอียดพัสดุ
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            เพิ่ม
          </Button>
        </Toolbar>

        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>หมวดพัสดุ</InputLabel>
            <Select
              value={classFilter}
              label="หมวดพัสดุ"
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <SelectMenuItem value="">ทั้งหมด</SelectMenuItem>
              {masterData?.pClass?.map((item) => (
                <SelectMenuItem key={item.id} value={item.id.toString()}>
                  {item.class_name}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>ประเภทพัสดุ</InputLabel>
            <Select
              value={typeFilter}
              label="ประเภทพัสดุ"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <SelectMenuItem value="">ทั้งหมด</SelectMenuItem>
              {masterData?.ptype
                ?.filter((item) => !classFilter || item.class_id?.toString() === classFilter)
                .map((item) => (
                  <SelectMenuItem key={item.id} value={item.id.toString()}>
                    {item.ptype_name}
                  </SelectMenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>รหัส กพร.</InputLabel>
            <Select
              value={gpscFilter}
              label="รหัส กพร."
              onChange={(e) => setGpscFilter(e.target.value)}
            >
              <SelectMenuItem value="">ทั้งหมด</SelectMenuItem>
              {masterData?.gpscode?.map((item) => (
                <SelectMenuItem key={item.id} value={item.id.toString()}>
                  {item.gpsc_name}
                </SelectMenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            ค้นหา
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
          >
            ล้างตัวกรอง
          </Button>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>รหัสพัสดุ</TableCell>
                <TableCell>ชื่อรายละเอียด</TableCell>
                <TableCell>หมวดพัสดุ</TableCell>
                <TableCell>ประเภทพัสดุ</TableCell>
                <TableCell>รหัส กพร.</TableCell>
                <TableCell>คำค้นหา</TableCell>
                <TableCell align="center">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : descriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                descriptions.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Chip label={row.item_id} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{row.Des_name}</TableCell>
                    <TableCell>{row.class_name}</TableCell>
                    <TableCell>{row.type_name}</TableCell>
                    <TableCell>{row.gpsc_name || '-'}</TableCell>
                    <TableCell>
                      {row.keyword ? (
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row.keyword}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        id="demo-customized-button"
                        aria-controls={open ? 'demo-customized-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        variant="contained"
                        disableElevation
                        onClick={(e) => handleClick(e, row.id!)}
                        endIcon={<KeyboardArrowDownIcon />}
                      >
                        จัดการ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="แถวต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
          }
        />
      </Paper>

      {/* Action Menu */}
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => selectedId && handleEdit(selectedId)} disableRipple>
          <EditIcon />
          แก้ไข
        </MenuItem>
        <MenuItem onClick={() => selectedId && handleDeleteClick(selectedId)} disableRipple>
          <DeleteIcon />
          ลบ
        </MenuItem>
      </StyledMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ยืนยันการลบ
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            คุณแน่ใจหรือไม่ว่าต้องการลบรายละเอียดพัสดุนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            ยกเลิก
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManageInventory;