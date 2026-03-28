import ExcelJS from 'exceljs';
import { COMMISSIONS } from './distribution';

export interface StudentForExport {
  name: string;
  email: string;
  dni: string;
  gender: string;
  gender_other: string | null;
  personal_code: string;
  dg1_catedra: string;
  dg1_otra: string | null;
  dg2_catedra: string;
  dg2_otra: string | null;
  morfo1_catedra: string;
  morfo1_otra: string | null;
  morfo2_catedra: string;
  morfo2_otra: string | null;
  tipo1_catedra: string;
  tipo1_otra: string | null;
  tipo2_catedra: string;
  tipo2_otra: string | null;
  is_recursante: number;
  recursante_catedra: string | null;
  score: number;
  commission: string | null;
  affinity_group_id: number | null;
  subgroup_id: number | null;
}

function getCatedraValue(catedra: string, otra: string | null): string {
  if (catedra === 'Otra' && otra) {
    return otra;
  }
  return catedra;
}

function getGenderValue(gender: string, genderOther: string | null): string {
  if (gender === 'otro' && genderOther) {
    return genderOther;
  }
  const genderMap: { [key: string]: string } = {
    'masculino': 'Masculino',
    'femenino': 'Femenino',
    'no_binario': 'No binario',
    'otro': 'Otro',
    'prefiero_no_decir': 'Prefiero no decir'
  };
  return genderMap[gender] || gender;
}

export async function generateExcel(students: StudentForExport[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: All students
  const allSheet = workbook.addWorksheet('Todos los alumnos');

  allSheet.columns = [
    { header: 'Nombre y Apellido', key: 'name', width: 25 },
    { header: 'DNI', key: 'dni', width: 12 },
    { header: 'Género', key: 'gender', width: 18 },
    { header: 'Mail', key: 'email', width: 30 },
    { header: 'Código personal', key: 'code', width: 15 },
    { header: 'Diseño Gráfico 1', key: 'dg1', width: 20 },
    { header: 'Diseño Gráfico 2', key: 'dg2', width: 20 },
    { header: 'Morfología 1', key: 'morfo1', width: 20 },
    { header: 'Morfología 2', key: 'morfo2', width: 20 },
    { header: 'Tipografía 1', key: 'tipo1', width: 20 },
    { header: 'Tipografía 2', key: 'tipo2', width: 20 },
    { header: '¿Recursante DG3?', key: 'recursante', width: 18 },
    { header: 'Cátedra anterior DG3', key: 'recursante_catedra', width: 25 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Comisión asignada', key: 'commission', width: 30 },
    { header: 'Grupo de afinidad', key: 'group', width: 18 },
    { header: 'Subgrupo', key: 'subgroup', width: 12 },
  ];

  // Style header row
  allSheet.getRow(1).font = { bold: true };
  allSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data
  students.forEach(student => {
    allSheet.addRow({
      name: student.name,
      dni: student.dni,
      gender: getGenderValue(student.gender, student.gender_other),
      email: student.email,
      code: student.personal_code,
      dg1: getCatedraValue(student.dg1_catedra, student.dg1_otra),
      dg2: getCatedraValue(student.dg2_catedra, student.dg2_otra),
      morfo1: getCatedraValue(student.morfo1_catedra, student.morfo1_otra),
      morfo2: getCatedraValue(student.morfo2_catedra, student.morfo2_otra),
      tipo1: getCatedraValue(student.tipo1_catedra, student.tipo1_otra),
      tipo2: getCatedraValue(student.tipo2_catedra, student.tipo2_otra),
      recursante: student.is_recursante ? 'Sí' : 'No',
      recursante_catedra: student.recursante_catedra || '',
      score: student.score,
      commission: student.commission || '',
      group: student.affinity_group_id || '',
      subgroup: student.subgroup_id || '',
    });
  });

  // If commissions have been assigned, create sheets for each commission
  const hasCommissions = students.some(s => s.commission);

  if (hasCommissions) {
    COMMISSIONS.forEach(commission => {
      const commissionStudents = students.filter(
        s => s.commission === commission.id
      );

      if (commissionStudents.length > 0) {
        const sheet = workbook.addWorksheet(commission.name);

        sheet.columns = allSheet.columns;

        // Style header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };

        // Add data
        commissionStudents.forEach(student => {
          sheet.addRow({
            name: student.name,
            dni: student.dni,
            gender: getGenderValue(student.gender, student.gender_other),
            email: student.email,
            code: student.personal_code,
            dg1: getCatedraValue(student.dg1_catedra, student.dg1_otra),
            dg2: getCatedraValue(student.dg2_catedra, student.dg2_otra),
            morfo1: getCatedraValue(student.morfo1_catedra, student.morfo1_otra),
            morfo2: getCatedraValue(student.morfo2_catedra, student.morfo2_otra),
            tipo1: getCatedraValue(student.tipo1_catedra, student.tipo1_otra),
            tipo2: getCatedraValue(student.tipo2_catedra, student.tipo2_otra),
            recursante: student.is_recursante ? 'Sí' : 'No',
            recursante_catedra: student.recursante_catedra || '',
            score: student.score,
            commission: student.commission || '',
            group: student.affinity_group_id || '',
            subgroup: student.subgroup_id || '',
          });
        });
      }
    });
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
