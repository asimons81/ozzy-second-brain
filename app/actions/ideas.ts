'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const BRAIN_DIR = path.join(process.cwd(), 'content');
const IDEAS_DIR = path.join(BRAIN_DIR, 'ideas');
const ARCHIVE_DIR = path.join(process.cwd(), '.archive', 'rejected-ideas');

if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

export async function approveIdea(slug: string) {
  const sourcePath = path.join(IDEAS_DIR, `${slug}.md`);
  const destDir = path.join(BRAIN_DIR, 'approved-ideas');
  const sidQueueDir = path.join(process.cwd(), 'notes', 'sid-queue');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (!fs.existsSync(sidQueueDir)) {
    fs.mkdirSync(sidQueueDir, { recursive: true });
  }

  const destPath = path.join(destDir, `${slug}.md`);
  
  if (fs.existsSync(sourcePath)) {
    const fileContent = fs.readFileSync(sourcePath, 'utf-8');
    // We could parse frontmatter here if needed
    
    fs.renameSync(sourcePath, destPath);
    
    // Create Job Ticket for Sid
    const ticketId = `job-${Date.now()}`;
    const ticket = {
      id: ticketId,
      task: 'draft-content',
      priority: 'high',
      source_idea: slug,
      status: 'pending',
      assigned_to: 'sid',
      created_at: new Date().toISOString(),
      instructions: `Please review the approved idea "${slug}" and draft 3 high-signal X posts and 1 LinkedIn post based on it. Store the results in content/renders/${slug}-drafts.md`
    };

    fs.writeFileSync(
      path.join(sidQueueDir, `ticket-${ticketId}.json`),
      JSON.stringify(ticket, null, 2)
    );
    
    revalidatePath('/docs/ideas');
    return { success: true };
  }
  return { success: false, error: 'File not found' };
}

export async function rejectIdea(slug: string) {
  const sourcePath = path.join(IDEAS_DIR, `${slug}.md`);
  const destPath = path.join(ARCHIVE_DIR, `${slug}.md`);

  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, destPath);
    revalidatePath('/docs/ideas');
    return { success: true };
  }
  return { success: false, error: 'File not found' };
}

export async function deleteIdea(slug: string) {
  const filePath = path.join(IDEAS_DIR, `${slug}.md`);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    revalidatePath('/docs/ideas');
    return { success: true };
  }
  return { success: false, error: 'File not found' };
}
