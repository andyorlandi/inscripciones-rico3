import { prisma } from '../lib/db';
import { calculateScore } from '../lib/scoring';
import { generatePersonalCode } from '../lib/personal-code';

const firstNames = [
  'Luciana', 'Martín', 'Sofía', 'Juan', 'Valentina', 'Diego', 'Camila', 'Matías',
  'Florencia', 'Santiago', 'Victoria', 'Tomás', 'Agustina', 'Nicolás', 'María',
  'Federico', 'Catalina', 'Ezequiel', 'Josefina', 'Sebastián', 'Rocío', 'Ignacio',
  'Milagros', 'Lucas', 'Delfina', 'Pablo', 'Emilia', 'Joaquín', 'Candela', 'Bruno'
];

const lastNames = [
  'González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'García', 'Pérez',
  'Sánchez', 'Romero', 'Díaz', 'Torres', 'Álvarez', 'Ruiz', 'Moreno', 'Benítez',
  'Castro', 'Herrera', 'Silva', 'Méndez', 'Vega', 'Suárez', 'Ramírez', 'Flores',
  'Giménez', 'Molina', 'Ortiz', 'Pereyra', 'Cabrera', 'Ríos', 'Acosta'
];

const catedrasDG = [
  'Belluccia',
  'Díaz Colodrero',
  'Diseño Transforma',
  'Ex Mazzeo',
  'Gabriele',
  'Melon',
  'Meygide',
  'Pujol',
  'Ex Rico',
  'Salomone',
  'Ex Wolkowicz'
];

const catedrasMorfo = [
  'Brignone',
  'Longinotti',
  'Mazzeo',
  'Pereyra',
  'Pescio',
  'Wainhaus'
];

const catedrasTipo = [
  'Carbone',
  'Cosgaya',
  'Filippis',
  'Gaitto',
  'Longinotti',
  'Venancio'
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateStudent(index: number) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;

  // Randomly assign catedras (some will have high scores, some low)
  const dg1Catedra = randomItem(catedrasDG);
  const dg2Catedra = randomItem(catedrasDG);
  const morfo1Catedra = randomItem(catedrasMorfo);
  const morfo2Catedra = randomItem(catedrasMorfo);
  const tipo1Catedra = randomItem(catedrasTipo);
  const tipo2Catedra = randomItem(catedrasTipo);

  const isRecursante = Math.random() < 0.13; // ~13% recursantes (3-4 out of 30)
  const recursanteCatedra = isRecursante ? randomItem(['Rico', 'Wolkowicz', 'Otra cátedra']) : null;

  const studentData = {
    dg1_catedra: dg1Catedra,
    dg1_otra: null,
    dg2_catedra: dg2Catedra,
    dg2_otra: null,
    morfo1_catedra: morfo1Catedra,
    morfo1_otra: null,
    morfo2_catedra: morfo2Catedra,
    morfo2_otra: null,
    tipo1_catedra: tipo1Catedra,
    tipo1_otra: null,
    tipo2_catedra: tipo2Catedra,
    tipo2_otra: null,
  };

  const score = calculateScore(studentData);
  const personalCode = await generatePersonalCode(name);

  return {
    name,
    email,
    personalCode,
    dg1Catedra,
    dg2Catedra,
    morfo1Catedra,
    morfo2Catedra,
    tipo1Catedra,
    tipo2Catedra,
    isRecursante,
    recursanteCatedra,
    score
  };
}

async function seed() {
  // Clear existing data
  await prisma.student.deleteMany({});
  console.log('🗑️  Cleared existing students');

  // Generate 30 students
  for (let i = 1; i <= 30; i++) {
    const student = await generateStudent(i);

    await prisma.student.create({
      data: student
    });

    console.log(`✅ Created student ${i}/30: ${student.name} (Score: ${student.score})`);
  }

  console.log('\n🎉 Seed completed successfully!');

  // Show statistics
  const total = await prisma.student.count();
  const aggregates = await prisma.student.aggregate({
    _avg: { score: true },
    _min: { score: true },
    _max: { score: true }
  });
  const recursantes = await prisma.student.count({
    where: { isRecursante: true }
  });

  console.log('\n📊 Statistics:');
  console.log(`   Total students: ${total}`);
  console.log(`   Average score: ${(aggregates._avg.score || 0).toFixed(2)}`);
  console.log(`   Score range: ${aggregates._min.score} - ${aggregates._max.score}`);
  console.log(`   Recursantes: ${recursantes}`);

  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
});
