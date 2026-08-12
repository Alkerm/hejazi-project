const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const buildDir = 'C:\\temp\\prisma_build';
const targetDotPrismaDir = path.resolve(__dirname, '../node_modules/.prisma/client');
const schemaSrc = path.resolve(__dirname, '../apps/api/prisma/schema.prisma');
const schemaDest = path.join(buildDir, 'schema.prisma');

try {
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Read schema and set explicit output path to root node_modules/.prisma/client
  let schemaContent = fs.readFileSync(schemaSrc, 'utf8');
  const normalizedTarget = targetDotPrismaDir.replace(/\\/g, '/');
  
  if (schemaContent.includes('output   =')) {
    schemaContent = schemaContent.replace(/output\s+=.*/, `output   = "${normalizedTarget}"`);
  } else {
    schemaContent = schemaContent.replace('provider = "prisma-client-js"', `provider = "prisma-client-js"\n  output   = "${normalizedTarget}"`);
  }

  fs.writeFileSync(schemaDest, schemaContent, 'utf8');

  const prismaCliPath = require.resolve('prisma/build/index.js');
  console.log('Generating Prisma Client outside OneDrive path...');
  
  execSync(`node "${prismaCliPath}" generate --schema="${schemaDest}"`, {
    cwd: buildDir,
    stdio: 'inherit',
    env: { ...process.env, PRISMA_DISABLE_WARNINGS: 'true' }
  });
  console.log('Prisma Client generated successfully!');
} catch (err) {
  console.error('Prisma generation error:', err.message);
}
