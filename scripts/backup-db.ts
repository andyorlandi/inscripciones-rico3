import { prisma } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', timestamp);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`📦 Creando backup en: ${backupDir}`);

  const students = await prisma.student.findMany();
  const appState = await prisma.appState.findMany();
  const affinityGroups = await prisma.affinityGroup.findMany();
  const subgroups = await prisma.subgroup.findMany();

  fs.writeFileSync(path.join(backupDir, 'students.json'), JSON.stringify(students, null, 2));
  fs.writeFileSync(path.join(backupDir, 'appState.json'), JSON.stringify(appState, null, 2));
  fs.writeFileSync(path.join(backupDir, 'affinityGroups.json'), JSON.stringify(affinityGroups, null, 2));
  fs.writeFileSync(path.join(backupDir, 'subgroups.json'), JSON.stringify(subgroups, null, 2));

  console.log(`✅ Backup completado: ${students.length} estudiantes`);
  await prisma.$disconnect();
}

backup().catch((error) => {
  console.error('❌ Error en backup:', error);
  prisma.$disconnect();
  process.exit(1);
});
