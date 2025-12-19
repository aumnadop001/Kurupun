from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.utils import get_column_letter
from django.http import HttpResponse
from .models import DocumentRecord
from urllib.parse import quote

def export_document_record_to_excel(document_record):
    """
    Export DocumentRecord และ Inventories ไปเป็นไฟล์ Excel
    ตามโครงสร้างของ HTML template
    """
    wb = Workbook()
    ws = wb.active
    ws.title = f"ทะเบียนคุม_{document_record.registration_number}"

    # Define styles
    header_font = Font(name="Calibri", size=11, bold=True)
    normal_font = Font(name="Calibri", size=11)
    center_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    left_alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    thin_border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )

    gray_fill = PatternFill(start_color="D3D3D3", end_color="D3D3D3", fill_type="solid")

    # Set column widths
    column_widths = {
        "A": 17,
        "B": 18,
        "C": 19,
        "D": 27,
        "E": 35,
        "F": 33,
        "G": 33,
        "H": 33,
        "I": 15,
        "J": 17,
        "K": 10,
        "L": 20,
        "M": 29,
        "N": 29,
        "O": 16,
        "P": 16,
        "Q": 13,
        "R": 17,
    }
    for col, width in column_widths.items():
        ws.column_dimensions[col].width = width

    # Row 1-2: Header section
    # Row 1
    ws.merge_cells("A1:A2")
    ws["A1"] = "ว.ด.ป."
    ws["A1"].font = header_font
    ws["A1"].fill = gray_fill
    ws["A1"].alignment = center_alignment
    ws["A1"].border = thin_border

    ws.merge_cells("B1:B2")
    ws["B1"] = (
        document_record.registration_date.strftime("%d/%m/%Y")
        if document_record.registration_date
        else ""
    )
    ws["B1"].font = header_font
    ws["B1"].fill = gray_fill
    ws["B1"].alignment = center_alignment
    ws["B1"].border = thin_border

    ws.merge_cells("C1:D1")
    ws["C1"] = "หมายเลขพัสดุ"
    ws["C1"].font = header_font
    ws["C1"].fill = gray_fill
    ws["C1"].alignment = center_alignment
    ws["C1"].border = thin_border

    ws.merge_cells("E1:H1")
    ws["E1"] = document_record.inventory_number or ""
    ws["E1"].font = header_font
    ws["E1"].fill = gray_fill
    ws["E1"].alignment = center_alignment
    ws["E1"].border = thin_border

    ws.merge_cells("I1:N2")
    ws["I1"] = "รายการ"
    ws["I1"].font = header_font
    ws["I1"].fill = gray_fill
    ws["I1"].alignment = center_alignment
    ws["I1"].border = thin_border

    ws.merge_cells("O1:O2")
    ws["O1"] = "หน่วยนับ"
    ws["O1"].font = header_font
    ws["O1"].fill = gray_fill
    ws["O1"].alignment = center_alignment
    ws["O1"].border = thin_border

    ws.merge_cells("P1:P2")
    ws["P1"] = document_record.unit_of_measure or ""
    ws["P1"].font = header_font
    ws["P1"].fill = gray_fill
    ws["P1"].alignment = center_alignment
    ws["P1"].border = thin_border

    ws.merge_cells("Q1:R2")
    ws["Q1"] = f"ที่เก็บ {document_record.storage_location or ''}"
    ws["Q1"].font = header_font
    ws["Q1"].fill = gray_fill
    ws["Q1"].alignment = center_alignment
    ws["Q1"].border = thin_border

    # Row 2
    ws["C2"] = "วัน"
    ws["C2"].font = header_font
    ws["C2"].fill = gray_fill
    ws["C2"].alignment = center_alignment
    ws["C2"].border = thin_border

    ws["D2"] = "จำนวน"
    ws["D2"].font = header_font
    ws["D2"].fill = gray_fill
    ws["D2"].alignment = center_alignment
    ws["D2"].border = thin_border

    ws.merge_cells("E2:H2")
    ws["E2"] = "หมายเลขพัสดุแทนกันได้"
    ws["E2"].font = header_font
    ws["E2"].fill = gray_fill
    ws["E2"].alignment = center_alignment
    ws["E2"].border = thin_border

    # Row 3-5: Criteria section
    ws.merge_cells("A3:B3")
    ws["A3"] = "เกณฑ์สั่ง"
    ws["A3"].font = header_font
    ws["A3"].fill = gray_fill
    ws["A3"].alignment = center_alignment
    ws["A3"].border = thin_border

    ws["C3"] = document_record.days_to_order or ""
    ws["C3"].border = thin_border
    ws["C3"].alignment = center_alignment

    ws["D3"] = document_record.quantity_to_order or ""
    ws["D3"].border = thin_border
    ws["D3"].alignment = center_alignment

    ws.merge_cells("E3:H5")
    alternate_numbers = document_record.inventory_alternate_numbers
    if isinstance(alternate_numbers, list):
        ws["E3"] = ", ".join(alternate_numbers)
    elif alternate_numbers:
        ws["E3"] = str(alternate_numbers)
    ws["E3"].border = thin_border
    ws["E3"].alignment = left_alignment

    ws.merge_cells("I3:N5")
    equipment = document_record.related_equipment
    equipment_text = "ครุภัณฑ์ที่เกี่ยวข้อง: "
    if isinstance(equipment, list):
        equipment_text += ", ".join(equipment)
    elif equipment:
        equipment_text += str(equipment)
    ws["I3"] = equipment_text
    ws["I3"].font = header_font
    ws["I3"].fill = gray_fill
    ws["I3"].border = thin_border
    ws["I3"].alignment = left_alignment

    ws.merge_cells("O3:R5")
    ws["O3"] = f"หมายเหตุ: {document_record.remark or ''}"
    ws["O3"].font = header_font
    ws["O3"].fill = gray_fill
    ws["O3"].border = thin_border
    ws["O3"].alignment = left_alignment

    # Row 4
    ws.merge_cells("A4:B4")
    ws["A4"] = "จุดสั่งเพิ่มเติม"
    ws["A4"].font = header_font
    ws["A4"].fill = gray_fill
    ws["A4"].alignment = center_alignment
    ws["A4"].border = thin_border

    ws["C4"] = document_record.reorder_point_days or ""
    ws["C4"].border = thin_border
    ws["C4"].alignment = center_alignment

    ws["D4"] = document_record.reorder_point_quantity or ""
    ws["D4"].border = thin_border
    ws["D4"].alignment = center_alignment

    # Row 5
    ws.merge_cells("A5:B5")
    ws["A5"] = "เกณฑ์ปลอดภัย"
    ws["A5"].font = header_font
    ws["A5"].fill = gray_fill
    ws["A5"].alignment = center_alignment
    ws["A5"].border = thin_border

    ws["C5"] = document_record.safety_stock_days or ""
    ws["C5"].border = thin_border
    ws["C5"].alignment = center_alignment

    ws["D5"] = document_record.safety_stock_quantity or ""
    ws["D5"].border = thin_border
    ws["D5"].alignment = center_alignment

    # Row 6: Section headers
    ws.merge_cells("A6:H6")
    ws["A6"] = "ค้างรับ และ ค้างจ่าย"
    ws["A6"].font = header_font
    ws["A6"].fill = gray_fill
    ws["A6"].alignment = center_alignment
    ws["A6"].border = thin_border

    ws.merge_cells("I6:R6")
    ws["I6"] = "ความต้องการรับและจ่าย"
    ws["I6"].font = header_font
    ws["I6"].fill = gray_fill
    ws["I6"].alignment = center_alignment
    ws["I6"].border = thin_border

    # Row 7-8: Column headers
    headers_row7 = [
        ("A7:A8", "ว.ด.ป."),
        ("B7:B8", "หลักฐาน"),
        ("C7:C8", "หน่วย"),
        ("D7:D8", "จำนวน"),
        ("E7:E8", "รับ\nค้าง"),
        ("F7:F8", "รับ\nค้าง"),
        ("G7:G8", "รับ\nค้าง"),
        ("H7:H8", "รับ\nค้าง"),
        ("I7:I8", "ว.ด.ป."),
        ("J7:J8", "รับ"),
        ("K7:K8", "ราคาต่อหน่วย"),
        ("L7:L8", "หลักฐาน"),
        ("O7:O8", "จ่าย"),
        ("P7:P8", "รวมยืม"),
        ("Q7:Q8", "คงคลัง"),
        ("R7:R8", "ลายมือชื่อ"),
    ]

    for cell_range, text in headers_row7:
        if ":" in cell_range:
            ws.merge_cells(cell_range)
            cell = cell_range.split(":")[0]
        else:
            cell = cell_range
        ws[cell] = text
        ws[cell].font = header_font
        ws[cell].fill = gray_fill
        ws[cell].alignment = center_alignment
        ws[cell].border = thin_border

    ws.merge_cells("M7:N7")
    ws["M7"] = "ความต้องการ"
    ws["M7"].font = header_font
    ws["M7"].fill = gray_fill
    ws["M7"].alignment = center_alignment
    ws["M7"].border = thin_border

    # Row 8: Sub-headers
    ws["M8"] = "ขั้นต้น"
    ws["M8"].font = header_font
    ws["M8"].fill = gray_fill
    ws["M8"].alignment = center_alignment
    ws["M8"].border = thin_border

    ws["N8"] = "ทดแทน"
    ws["N8"].font = header_font
    ws["N8"].fill = gray_fill
    ws["N8"].alignment = center_alignment
    ws["N8"].border = thin_border

    # Row 9+: Data rows (Inventories)
    inventories = document_record.inventories.all().order_by("request_date")

    current_row = 9
    for inventory in inventories:
        # Pending section
        ws[f"A{current_row}"] = (
            inventory.pending_date.strftime("%d/%m/%Y")
            if inventory.pending_date
            else ""
        )
        ws[f"B{current_row}"] = inventory.pending_evidence or ""
        ws[f"C{current_row}"] = inventory.pending_unit or ""
        ws[f"D{current_row}"] = inventory.pending_quantity or ""

        # Pending receive/balance columns (4 sets)
        pending_1 = (
            f"{inventory.pending_receive1 or ''}/{inventory.pending_balance1 or ''}"
        )
        ws[f"E{current_row}"] = (
            pending_1
            if inventory.pending_receive1 or inventory.pending_balance1
            else ""
        )

        pending_2 = (
            f"{inventory.pending_receive2 or ''}/{inventory.pending_balance2 or ''}"
        )
        ws[f"F{current_row}"] = (
            pending_2
            if inventory.pending_receive2 or inventory.pending_balance2
            else ""
        )

        pending_3 = (
            f"{inventory.pending_receive3 or ''}/{inventory.pending_balance3 or ''}"
        )
        ws[f"G{current_row}"] = (
            pending_3
            if inventory.pending_receive3 or inventory.pending_balance3
            else ""
        )

        pending_4 = (
            f"{inventory.pending_receive4 or ''}/{inventory.pending_balance4 or ''}"
        )
        ws[f"H{current_row}"] = (
            pending_4
            if inventory.pending_receive4 or inventory.pending_balance4
            else ""
        )

        # Request section
        ws[f"I{current_row}"] = (
            inventory.request_date.strftime("%d/%m/%Y")
            if inventory.request_date
            else ""
        )
        ws[f"J{current_row}"] = inventory.received_quantity or ""
        ws[f"K{current_row}"] = (
            float(inventory.unit_price) if inventory.unit_price else ""
        )
        ws[f"L{current_row}"] = inventory.request_evidence or ""

        # Request type checkboxes
        ws[f"M{current_row}"] = "✓" if inventory.request_type == "INITIAL" else ""
        ws[f"N{current_row}"] = "✓" if inventory.request_type == "REPLACEMENT" else ""

        ws[f"O{current_row}"] = inventory.issue_quantity or ""
        ws[f"P{current_row}"] = inventory.total_borrowed or ""
        ws[f"Q{current_row}"] = inventory.stock_balance or ""
        ws[f"R{current_row}"] = inventory.request_signature or ""

        # Apply styles to all cells in the row
        for col in range(1, 19):  # A to R
            cell = ws.cell(row=current_row, column=col)
            cell.font = normal_font
            cell.alignment = center_alignment
            cell.border = thin_border

        current_row += 1

    # Set row heights
    for row in range(1, current_row):
        ws.row_dimensions[row].height = 19

    return wb


def generate_excel_response(document_record):
    wb = export_document_record_to_excel(document_record)

    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    filename = f"ทะเบียนคุมวัสดุ_{document_record.registration_number}.xlsx"
    quoted_filename = quote(filename)

    response["Content-Disposition"] = f"attachment; filename*=UTF-8''{quoted_filename}"

    wb.save(response)
    return response
