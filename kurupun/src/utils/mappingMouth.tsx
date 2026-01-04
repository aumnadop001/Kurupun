export const mappingMonthToThai = (month: string) => {
  const monthMap: { [key: string]: string } = {
    '01': 'มกราคม',
    '02': 'กุมภาพันธ์',
    '03': 'มีนาคม',
    '04': 'เมษายน',
    '05': 'พฤษภาคม',
    '06': 'มิถุนายน',
    '07': 'กรกฎาคม',
    '08': 'สิงหาคม',
    '09': 'กันยายน',
    '10': 'ตุลาคม',
    '11': 'พฤศจิกายน',
    '12': 'ธันวาคม',
  };
  return monthMap[month] || month;
}
import moment from 'moment-timezone';

export const formatDateToThai = (dateString: string) => {
  if (!dateString) return '';
  const date = moment(dateString);
  const day = date.date();
  const month = mappingMonthToThai(date.format('MM'));
  const year = date.year() + 543; // Convert to Buddhist Era
  return `${day} ${month} ${year}`;
}