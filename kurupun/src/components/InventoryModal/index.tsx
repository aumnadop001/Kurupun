import { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import { Formik } from 'formik';
import * as Yup from 'yup';
interface AddformModalProps {
  open: boolean;
  handleClose: () => void;
  mode: 'receive' | 'spend';
  onSave: (data: any) => void;
  data: any;
  editData?: any;
  isEdit?: boolean;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const AddformModal = ({ open, handleClose, mode, onSave, data, editData, isEdit }: AddformModalProps) => {
  const title = isEdit
    ? (mode === 'receive' ? 'แก้ไขรับวัสดุเข้าคลัง' : 'แก้ไขจ่ายวัสดุออกจากคลัง')
    : (mode === 'receive' ? 'รับวัสดุเข้าคลัง' : 'จ่ายวัสดุออกจากคลัง');

  const validationSchema = Yup.object().shape({
    date: Yup.string().required('กรุณากรอกวันที่'),
    unitPrice: Yup.number().typeError('ราคาต่อหน่วยต้องเป็นตัวเลข').required('กรุณากรอกราคาต่อหน่วย'),
    type: Yup.string().required('กรุณาเลือกประเภท'),
    quantity: Yup.number().typeError('จำนวนต้องเป็นตัวเลข').required('กรุณากรอกจำนวน').min(1, 'จำนวนต้องมากกว่า 0'),
  });

  const getInitialValues = () => {
    if (isEdit && editData) {
      return {
        date: editData.date || '',
        evidence: editData.evidence || '',
        unitPrice: editData.unitPrice?.toString() || '',
        type: editData.type || '',
        quantity: editData.quantity?.toString() || '',
        totalBorrowed: editData.totalBorrowed?.toString() || '',
      };
    }
    return {
      date: '',
      evidence: data?.request_evidence || '',
      unitPrice: '',
      type: '',
      quantity: '',
      totalBorrowed: '',
    };
  };

  const handleSubmit = (values: any, { resetForm }: any) => {
    const submitData = {
      date: values.date,
      evidence: values.evidence,
      unitPrice: parseFloat(values.unitPrice) || 0,
      type: values.type,
      quantity: parseInt(values.quantity) || 0,
      totalBorrowed: mode === 'spend' ? parseInt(values.totalBorrowed) || 0 : undefined,
    };
    onSave(submitData);
    resetForm();
  };

  const handleModalClose = () => {
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2" mb={3}>
          {title}
        </Typography>

        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit }) => (
            <form onSubmit={formikSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="วันที่"
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.date && Boolean(errors.date)}
                    helperText={touched.date && errors.date as string}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="หลักฐาน"
                    name="evidence"
                    value={values.evidence}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.evidence && Boolean(errors.evidence)}
                    helperText={touched.evidence && errors.evidence as string}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="ราคาต่อหน่วย"
                    name="unitPrice"
                    type="number"
                    value={values.unitPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.unitPrice && Boolean(errors.unitPrice)}
                    helperText={touched.unitPrice && errors.unitPrice as string}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="ประเภท"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.type && Boolean(errors.type)}
                    helperText={touched.type && errors.type as string}
                  >
                    <MenuItem value="INITIAL">ขั้นต้น</MenuItem>
                    <MenuItem value="REPLACEMENT">ทดแทน</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={mode === 'receive' ? 'จำนวนที่รับ' : 'จำนวนที่จ่าย'}
                    name="quantity"
                    type="number"
                    value={values.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.quantity && Boolean(errors.quantity)}
                    helperText={touched.quantity && errors.quantity as string}
                  />
                </Grid>
                {mode === 'spend' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="รวมยืม"
                      name="totalBorrowed"
                      type="number"
                      value={values.totalBorrowed}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.totalBorrowed && Boolean(errors.totalBorrowed)}
                      helperText={touched.totalBorrowed && errors.totalBorrowed as string}
                    />
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleModalClose}>
                  ยกเลิก
                </Button>
                <Button variant="contained" type="submit">
                  บันทึก
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};
