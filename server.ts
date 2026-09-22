import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { RAW_ENCYCLOPEDIA_PROGRESSIONS } from './src/audio/encyclopediaData';
import { checkVoiceLeading } from './src/audio/harmonicProgressions';
import { solveProgression, parseNoteToOffset } from './src/utils/voiceLeadingSolver';
import { db } from './src/db/index.ts';
import { bugReports } from './src/db/schema.ts';
import { createObjectCsvStringifier } from 'csv-writer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Data persistence for reports
  const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.json');

  try {
    const dir = path.dirname(REPORTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }

  function readReports(): any[] {
    try {
      if (fs.existsSync(REPORTS_FILE)) {
        const content = fs.readFileSync(REPORTS_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.error('Failed to read reports:', err);
    }
    return [];
  }

  function writeReports(reports: any[]) {
    try {
      fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write reports:', err);
    }
  }

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get voice-leading status of all progressions
  app.get('/api/audit/status', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const report = RAW_ENCYCLOPEDIA_PROGRESSIONS.map(prog => {
      const steps: { midisSATB: [number, number, number, number] }[] = [];
      for (let i = 0; i < prog.bass.length; i++) {
        const b = parseNoteToOffset(prog.bass[i]) + 60;
        const t = parseNoteToOffset(prog.tenor[i]) + 60;
        const a = parseNoteToOffset(prog.alto[i]) + 60;
        const s = parseNoteToOffset(prog.sop[i]) + 60;
        steps.push({ midisSATB: [b, t, a, s] });
      }
      const validation = checkVoiceLeading(steps);
      return {
        id: prog.id,
        name: prog.name,
        formula: prog.formula,
        cat: prog.cat,
        notes: { bass: prog.bass, tenor: prog.tenor, alto: prog.alto, sop: prog.sop },
        isValid: validation.isValid,
        warnings: validation.warnings
      };
    });
    
    res.json(report);
  });

  // Solve all defective progressions automatically
  app.post('/api/audit/solve', (req, res) => {
    const filePath = path.join(process.cwd(), 'src', 'audio', 'encyclopediaData.ts');
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    
    const solvedList: { id: string; name: string; oldNotes: any; newNotes: any }[] = [];
    const failedList: { id: string; name: string; warnings: string[] }[] = [];

    for (const prog of RAW_ENCYCLOPEDIA_PROGRESSIONS) {
      const steps: { midisSATB: [number, number, number, number] }[] = [];
      for (let i = 0; i < prog.bass.length; i++) {
        const b = parseNoteToOffset(prog.bass[i]) + 60;
        const t = parseNoteToOffset(prog.tenor[i]) + 60;
        const a = parseNoteToOffset(prog.alto[i]) + 60;
        const s = parseNoteToOffset(prog.sop[i]) + 60;
        steps.push({ midisSATB: [b, t, a, s] });
      }
      const validation = checkVoiceLeading(steps);
      if (!validation.isValid) {
        const solved = solveProgression(prog);
        if (solved) {
          const startIdx = fileContent.indexOf(`id: '${prog.id}'`);
          if (startIdx !== -1) {
            const endIdx = fileContent.indexOf('},', startIdx);
            if (endIdx !== -1) {
              let block = fileContent.substring(startIdx, endIdx);
              
              const bRep = `bass: ${JSON.stringify(solved.bass).replace(/"/g, "'")}`;
              const tRep = `tenor: ${JSON.stringify(solved.tenor).replace(/"/g, "'")}`;
              const aRep = `alto: ${JSON.stringify(solved.alto).replace(/"/g, "'")}`;
              const sRep = `sop: ${JSON.stringify(solved.sop).replace(/"/g, "'")}`;
              
              block = block.replace(/bass:\s*\[[^\]]*\]/, bRep);
              block = block.replace(/tenor:\s*\[[^\]]*\]/, tRep);
              block = block.replace(/alto:\s*\[[^\]]*\]/, aRep);
              block = block.replace(/sop:\s*\[[^\]]*\]/, sRep);
              
              fileContent = fileContent.substring(0, startIdx) + block + fileContent.substring(endIdx);
              
              solvedList.push({
                id: prog.id,
                name: prog.name,
                oldNotes: { bass: prog.bass, tenor: prog.tenor, alto: prog.alto, sop: prog.sop },
                newNotes: { bass: solved.bass, tenor: solved.tenor, alto: solved.alto, sop: solved.sop }
              });
            }
          }
        } else {
          failedList.push({ id: prog.id, name: prog.name, warnings: validation.warnings });
        }
      }
    }

    if (solvedList.length > 0) {
      fs.writeFileSync(filePath, fileContent, 'utf-8');
    }

    res.json({
      success: true,
      solvedCount: solvedList.length,
      failedCount: failedList.length,
      solved: solvedList,
      failed: failedList
    });
  });

  // Get all reports (newest first)
  app.get('/api/reports', (req, res) => {
    res.json(readReports());
  });

  // Submit a new report
  app.post('/api/reports', (req, res) => {
    const { userEmail, userComment, selectedTask, deviceId } = req.body;
    
    if (!userComment || userComment.trim() === '') {
      return res.status(400).json({ error: 'Комментарий обязателен для заполнения' });
    }

    const reports = readReports();
    const newReport = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      userEmail: userEmail ? userEmail.trim() : 'Анонимный пользователь',
      userComment: userComment.trim(),
      selectedTask: selectedTask || null,
      deviceId: deviceId || 'Unknown Device'
    };

    reports.unshift(newReport);
    writeReports(reports);

    res.json({ success: true, report: newReport });
  });

  // Delete a report (for managing reports if needed)
  app.delete('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    let reports = readReports();
    const originalLength = reports.length;
    reports = reports.filter(r => r.id !== id);
    
    if (reports.length < originalLength) {
      writeReports(reports);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  });

  // Submit a new bug report to PostgreSQL
  app.post('/api/bugs', async (req, res) => {
    try {
      const { description, currentSection, recentActions } = req.body;

      if (!description || typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({ error: 'Описание проблемы обязательно для заполнения' });
      }

      if (!currentSection || typeof currentSection !== 'string') {
        return res.status(400).json({ error: 'Текущий раздел обязателен' });
      }

      // Truncate recentActions to the last 10 elements to prevent DB bloating
      const actionsArray = Array.isArray(recentActions) ? recentActions : [];
      const truncatedActions = actionsArray.slice(-10);

      const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

      const [inserted] = await db.insert(bugReports).values({
        description: description.trim(),
        currentSection: currentSection.trim(),
        recentActions: truncatedActions,
        userAgent: userAgent,
        status: 'new',
      }).returning();

      return res.status(201).json({ success: true, bug: inserted });
    } catch (err: any) {
      console.error('Error submitting bug report:', err);
      return res.status(500).json({ error: 'Не удалось отправить баг-репорт: ' + err.message });
    }
  });

  // Export all bug reports to a single CSV file on-the-fly
  app.get('/api/bugs/export', async (req, res) => {
    try {
      const reports = await db.select().from(bugReports);

      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'id', title: 'ID' },
          { id: 'description', title: 'Description' },
          { id: 'currentSection', title: 'Section' },
          { id: 'recentActions', title: 'Recent Actions' },
          { id: 'userAgent', title: 'User Agent' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'status', title: 'Status' }
        ]
      });

      const records = reports.map((r: any) => ({
        id: r.id,
        description: r.description,
        currentSection: r.currentSection,
        recentActions: JSON.stringify(r.recentActions),
        userAgent: r.userAgent,
        createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString(),
        status: r.status
      }));

      const headerString = csvStringifier.getHeaderString();
      const recordsString = csvStringifier.stringifyRecords(records);
      const csvContent = (headerString || '') + (recordsString || '');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bug_reports.csv"');
      return res.send(csvContent);
    } catch (err: any) {
      console.error('Error exporting bug reports to CSV:', err);
      return res.status(500).send('Failed to export bug reports: ' + err.message);
    }
  });

  // --- Vite / Static Assets Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://localhost:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
});
