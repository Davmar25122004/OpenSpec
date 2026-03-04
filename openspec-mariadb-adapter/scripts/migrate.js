const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');
require('dotenv').config();

const ChangesRepository = require('../db/ChangesRepository');
const TasksRepository = require('../db/TasksRepository');
const SpecsRepository = require('../db/SpecsRepository');
const ArtifactsRepository = require('../db/ArtifactsRepository');
const pool = require('../db/pool');

const OPENSPEC_DIR = path.join(__dirname, '../../openspec/changes');

async function migrate() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`Starting MariaDB OpenSpec Migration ${isDryRun ? '(DRY RUN)' : ''}...`);

  try {
    const yamlFiles = glob.sync('**/.openspec.yaml', { cwd: OPENSPEC_DIR });
    
    for (const yamlRelPath of yamlFiles) {
      const changeDir = path.dirname(path.join(OPENSPEC_DIR, yamlRelPath));
      const changeId = path.basename(changeDir);
      
      const isArchived = changeDir.includes('archive');
      const status = isArchived ? 'archived' : 'done'; // Simplification for migrated data
      
      // 1. Process Change Metadata
      const yamlContent = fs.readFileSync(path.join(changeDir, '.openspec.yaml'), 'utf8');
      const doc = yaml.load(yamlContent);
      const validator = require('validator');
      
      if (!isDryRun) {
        await ChangesRepository.create({
          id: validator.escape(changeId),
          name: validator.escape(changeId.replace(/^[0-9-]+-/, '').replace(/-/g, ' ')),
          schema_name: doc.schema ? validator.escape(doc.schema) : 'spec-driven',
          schema_version: '1.0',
          status: status
        });
      }
      console.log(`Migrated Change: ${changeId}`);

      // 2. Process tasks.md
      const tasksPath = path.join(changeDir, 'tasks.md');
      if (fs.existsSync(tasksPath)) {
        const tasksContent = fs.readFileSync(tasksPath, 'utf8');
        const lines = tasksContent.split('\n');
        let orderIndex = 0;
        
        for (const line of lines) {
          const match = line.match(/^\s*-\s*\[([xX\s])\]\s*(.*)$/);
          if (match) {
            const isDone = match[1].trim().toLowerCase() === 'x';
            const title = validator.escape(match[2].trim());
            if (!isDryRun) {
              await TasksRepository.create({
                changeId: validator.escape(changeId),
                title,
                done: isDone,
                orderIndex: orderIndex++
              });
            }
          }
        }
        console.log(`  - Parsed ${orderIndex} tasks`);
      }

      // 3. Process specs/**/*.md
      const specFiles = glob.sync('specs/**/*.md', { cwd: changeDir });
      for (const specRel of specFiles) {
        const specKey = validator.escape(specRel.replace(/\.md$/, '').replace(/\\/g, '/'));
        const content = fs.readFileSync(path.join(changeDir, specRel), 'utf8');
        if (!isDryRun) {
          await SpecsRepository.upsert({
            changeId: validator.escape(changeId),
            specKey,
            content: validator.escape(content)
          });
        }
      }
      if (specFiles.length > 0) console.log(`  - Parsed ${specFiles.length} specs`);

      // 4. Process Artifacts (proposal, design, tasks)
      const coreArtifacts = ['proposal.md', 'design.md', 'tasks.md'];
      for (const artifactFile of coreArtifacts) {
        if (fs.existsSync(path.join(changeDir, artifactFile))) {
          const artifactId = validator.escape(artifactFile.replace('.md', ''));
          if (!isDryRun) {
            await ArtifactsRepository.upsertArtifact({
              changeId: validator.escape(changeId),
              artifactId,
              status: 'done',
              outputPath: validator.escape(path.join(changeDir, artifactFile))
            });
          }
        }
      }
    }
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
