/**
 * Test script for distribution algorithm
 * Run with: npx tsx test-distribution.ts
 */

import { distributeStudents, getCommissionStats, Student } from './lib/distribution';

// Generate test data with affinity groups
function generateTestData(): Student[] {
  const students: Student[] = [];
  let id = 1;

  // GRUPO 1: 5 personas (2 subgrupos: 3+2)
  // Subgrupo 1A: 3 personas
  students.push(
    { id: id++, name: 'Juan Pérez', email: 'juan@mail.com', score: 8.5, is_recursante: false, gender: 'masculino', affinity_group_id: 1, subgroup_id: 1 },
    { id: id++, name: 'María García', email: 'maria@mail.com', score: 9.0, is_recursante: false, gender: 'femenino', affinity_group_id: 1, subgroup_id: 1 },
    { id: id++, name: 'Pedro López', email: 'pedro@mail.com', score: 7.8, is_recursante: true, gender: 'masculino', affinity_group_id: 1, subgroup_id: 1 }
  );
  // Subgrupo 1B: 2 personas
  students.push(
    { id: id++, name: 'Ana Martínez', email: 'ana@mail.com', score: 8.2, is_recursante: false, gender: 'femenino', affinity_group_id: 1, subgroup_id: 2 },
    { id: id++, name: 'Carlos Rodríguez', email: 'carlos@mail.com', score: 8.8, is_recursante: false, gender: 'masculino', affinity_group_id: 1, subgroup_id: 2 }
  );

  // GRUPO 2: 4 personas (2 subgrupos: 2+2)
  // Subgrupo 2A: 2 personas
  students.push(
    { id: id++, name: 'Laura Fernández', email: 'laura@mail.com', score: 9.5, is_recursante: false, gender: 'femenino', affinity_group_id: 2, subgroup_id: 3 },
    { id: id++, name: 'Diego Sánchez', email: 'diego@mail.com', score: 8.0, is_recursante: false, gender: 'masculino', affinity_group_id: 2, subgroup_id: 3 }
  );
  // Subgrupo 2B: 2 personas
  students.push(
    { id: id++, name: 'Sofía González', email: 'sofia@mail.com', score: 8.7, is_recursante: true, gender: 'femenino', affinity_group_id: 2, subgroup_id: 4 },
    { id: id++, name: 'Martín Díaz', email: 'martin@mail.com', score: 7.5, is_recursante: false, gender: 'masculino', affinity_group_id: 2, subgroup_id: 4 }
  );

  // GRUPO 3: 6 personas (2 subgrupos: 3+3) - GRUPO GRANDE
  // Subgrupo 3A: 3 personas
  students.push(
    { id: id++, name: 'Lucía Ruiz', email: 'lucia@mail.com', score: 9.2, is_recursante: false, gender: 'femenino', affinity_group_id: 3, subgroup_id: 5 },
    { id: id++, name: 'Andrés Torres', email: 'andres@mail.com', score: 8.4, is_recursante: false, gender: 'masculino', affinity_group_id: 3, subgroup_id: 5 },
    { id: id++, name: 'Valentina Morales', email: 'valentina@mail.com', score: 8.9, is_recursante: false, gender: 'femenino', affinity_group_id: 3, subgroup_id: 5 }
  );
  // Subgrupo 3B: 3 personas
  students.push(
    { id: id++, name: 'Santiago Romero', email: 'santiago@mail.com', score: 7.9, is_recursante: true, gender: 'masculino', affinity_group_id: 3, subgroup_id: 6 },
    { id: id++, name: 'Camila Flores', email: 'camila@mail.com', score: 9.1, is_recursante: false, gender: 'femenino', affinity_group_id: 3, subgroup_id: 6 },
    { id: id++, name: 'Mateo Castro', email: 'mateo@mail.com', score: 8.3, is_recursante: false, gender: 'masculino', affinity_group_id: 3, subgroup_id: 6 }
  );

  // GRUPO 4: 3 personas (1 subgrupo) - GRUPO CHICO
  students.push(
    { id: id++, name: 'Isabella Vargas', email: 'isabella@mail.com', score: 9.3, is_recursante: false, gender: 'femenino', affinity_group_id: 4, subgroup_id: 7 },
    { id: id++, name: 'Nicolás Reyes', email: 'nicolas@mail.com', score: 8.1, is_recursante: false, gender: 'masculino', affinity_group_id: 4, subgroup_id: 7 },
    { id: id++, name: 'Emma Silva', email: 'emma@mail.com', score: 8.6, is_recursante: true, gender: 'femenino', affinity_group_id: 4, subgroup_id: 7 }
  );

  // INDIVIDUALES: 25 estudiantes sin grupo (simulando ~70 estudiantes más para tener ~95 total)
  const nombres = ['Tomás', 'Olivia', 'Lucas', 'Mía', 'Benjamín', 'Victoria', 'Samuel', 'Catalina', 'Daniel', 'Antonella',
    'Gabriel', 'Renata', 'Emanuel', 'Julieta', 'Agustín', 'Martina', 'Joaquín', 'Emilia', 'Matías', 'Bianca',
    'Felipe', 'Delfina', 'Ignacio', 'Jazmín', 'Thiago', 'Constanza', 'Bautista', 'Milagros', 'Lautaro', 'Abril',
    'Facundo', 'Alma', 'Ramiro', 'Clara', 'Ezequiel'];

  const apellidos = ['Vega', 'Molina', 'Ríos', 'Navarro', 'Mendoza', 'Campos', 'Ortiz', 'Herrera', 'Medina', 'Ramírez',
    'Núñez', 'Ramos', 'Benítez', 'Acosta', 'Ponce', 'Rojas', 'Suárez', 'Sosa', 'Vera', 'Paz'];

  for (let i = 0; i < 77; i++) {
    const nombre = nombres[i % nombres.length];
    const apellido = apellidos[i % apellidos.length];
    const genero = Math.random() > 0.45 ? 'femenino' : 'masculino'; // ~45% masculino
    students.push({
      id: id++,
      name: `${nombre} ${apellido} ${i}`,
      email: `${nombre.toLowerCase()}${i}@mail.com`,
      score: Math.round((6 + Math.random() * 4) * 10) / 10, // 6.0 - 10.0
      is_recursante: Math.random() < 0.15, // ~15% recursantes
      gender: genero,
      affinity_group_id: null,
      subgroup_id: null
    });
  }

  return students;
}

// Run the test
console.log('🧪 TESTING DISTRIBUTION ALGORITHM\n');
console.log('=' .repeat(80));

const students = generateTestData();

console.log(`\n📊 DATOS DE ENTRADA:`);
console.log(`   Total estudiantes: ${students.length}`);
console.log(`   Estudiantes en grupos: ${students.filter(s => s.affinity_group_id).length}`);
console.log(`   Estudiantes individuales: ${students.filter(s => !s.affinity_group_id).length}`);

// Count groups
const groups = new Set(students.filter(s => s.affinity_group_id).map(s => s.affinity_group_id));
const subgroups = new Set(students.filter(s => s.subgroup_id).map(s => s.subgroup_id));
console.log(`   Grupos de afinidad: ${groups.size}`);
console.log(`   Subgrupos totales: ${subgroups.size}`);

// Show group details
console.log('\n📋 GRUPOS FORMADOS:');
for (const groupId of Array.from(groups).sort()) {
  const groupMembers = students.filter(s => s.affinity_group_id === groupId);
  const groupSubgroups = new Set(groupMembers.map(s => s.subgroup_id));
  console.log(`   Grupo ${groupId}: ${groupMembers.length} personas en ${groupSubgroups.size} subgrupo(s)`);

  for (const subgroupId of Array.from(groupSubgroups).sort()) {
    const subgroupMembers = groupMembers.filter(s => s.subgroup_id === subgroupId);
    const names = subgroupMembers.map(s => s.name).join(', ');
    console.log(`      └─ Subgrupo ${subgroupId}: ${names}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('🔄 EJECUTANDO DISTRIBUCIÓN...\n');

// Distribute
const commissions = distributeStudents(students);

// Show results
console.log('📈 RESULTADOS:\n');

commissions.forEach((commission, index) => {
  const stats = getCommissionStats(commission);
  console.log(`\n${commission.name}`);
  console.log('─'.repeat(60));
  console.log(`   Estudiantes: ${stats.studentCount}`);
  console.log(`   Score total: ${stats.totalScore} (promedio: ${stats.averageScore})`);
  console.log(`   Recursantes: ${stats.recursantesCount}`);
  console.log(`   Masculinos: ${stats.masculinoCount}`);

  // Check which groups ended up together
  const groupsInCommission = new Map<number, string[]>();
  commission.students.forEach(s => {
    if (s.affinity_group_id) {
      if (!groupsInCommission.has(s.affinity_group_id)) {
        groupsInCommission.set(s.affinity_group_id, []);
      }
      groupsInCommission.get(s.affinity_group_id)!.push(s.name);
    }
  });

  if (groupsInCommission.size > 0) {
    console.log(`\n   📌 Grupos en esta comisión:`);
    for (const [groupId, members] of groupsInCommission) {
      const totalInGroup = students.filter(s => s.affinity_group_id === groupId).length;
      const inThisCommission = members.length;
      const status = inThisCommission === totalInGroup ? '✅ COMPLETO' : `⚠️  PARCIAL (${inThisCommission}/${totalInGroup})`;
      console.log(`      Grupo ${groupId} ${status}`);
    }
  }
});

// Check balance
console.log('\n' + '='.repeat(80));
console.log('\n✅ VERIFICACIÓN DE RESTRICCIONES:\n');

const studentCounts = commissions.map(c => c.students.length);
const masculinoCounts = commissions.map(c => c.masculinoCount);
const scoreTotals = commissions.map(c => c.totalScore);

const maxStudents = Math.max(...studentCounts);
const minStudents = Math.min(...studentCounts);
const maxMasculino = Math.max(...masculinoCounts);
const minMasculino = Math.min(...masculinoCounts);

const studentDiff = maxStudents - minStudents;
const masculinoDiff = maxMasculino - minMasculino;

console.log(`   Diferencia en cantidad de estudiantes: ${studentDiff} ${studentDiff <= 2 ? '✅' : '❌ VIOLA ±2'}`);
console.log(`      Min: ${minStudents}, Max: ${maxStudents}`);

console.log(`\n   Diferencia en cantidad de masculinos: ${masculinoDiff} ${masculinoDiff <= 2 ? '✅' : '❌ VIOLA ±2'}`);
console.log(`      Min: ${minMasculino}, Max: ${maxMasculino}`);

console.log(`\n   Scores totales: ${scoreTotals.map(s => Math.round(s)).join(', ')}`);
console.log(`      Diferencia: ${Math.round(Math.max(...scoreTotals) - Math.min(...scoreTotals))}`);

// Check if subgroups were kept together
console.log('\n' + '='.repeat(80));
console.log('\n🔍 VERIFICACIÓN DE SUBGRUPOS:\n');

let allSubgroupsIntact = true;
for (const subgroupId of Array.from(subgroups).sort()) {
  const subgroupMembers = students.filter(s => s.subgroup_id === subgroupId);
  const commissionsWithMembers = new Set(
    commissions.filter(c => c.students.some(s => s.subgroup_id === subgroupId)).map(c => c.id)
  );

  if (commissionsWithMembers.size > 1) {
    console.log(`   ❌ Subgrupo ${subgroupId} está SEPARADO (en ${commissionsWithMembers.size} comisiones)`);
    allSubgroupsIntact = false;
  } else {
    const commissionId = Array.from(commissionsWithMembers)[0];
    console.log(`   ✅ Subgrupo ${subgroupId} intacto (${subgroupMembers.length} personas en ${commissionId})`);
  }
}

if (allSubgroupsIntact) {
  console.log('\n   🎉 TODOS los subgrupos se mantuvieron intactos!');
}

console.log('\n' + '='.repeat(80));
console.log('\n✨ TEST COMPLETADO\n');
