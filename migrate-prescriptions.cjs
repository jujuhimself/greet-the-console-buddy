const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// === FILL THESE IN ===
const supabaseUrl = 'https://frgblvloxhcnwrgvjazk.supabase.co'; 
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZ2JsdmxveGhjbndyZ3ZqYXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTExNjgzNywiZXhwIjoyMDY0NjkyODM3fQ.2FxmwdXfW0RX_c-fg9cc7xF4yqGUGT_jJEzq5OLrCQM'; // Get from Supabase dashboard (Project Settings > API > Service Role Key)

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function migrate() {
  // List all user folders in the prescriptions bucket
  const { data: userFolders, error: folderError } = await supabase.storage.from('prescriptions').list('', { limit: 1000 });
  if (folderError) {
    console.error('Error listing user folders:', folderError);
    return;
  }

  for (const folder of userFolders) {
    if (!folder.name) continue;
    // List all files in this user's folder
    const { data: files, error: fileError } = await supabase.storage.from('prescriptions').list(folder.name, { limit: 1000 });
    if (fileError) {
      console.error(`Error listing files for user ${folder.name}:`, fileError);
      continue;
    }

    for (const file of files) {
      // Compose file path and get created_at if available
      const filePath = `${folder.name}/${file.name}`;
      const createdAt = file.created_at || new Date().toISOString();

      // Insert into prescriptions table
      const { error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          id: crypto.randomUUID(),
          user_id: folder.name,
          patient_name: '', // You can try to extract from file.name if you have a convention
          doctor_name: '',
          prescription_date: createdAt.split('T')[0],
          status: 'pending',
          created_at: createdAt,
          updated_at: createdAt,
        });

      if (insertError) {
        console.error(`Failed to insert for file ${filePath}:`, insertError);
      } else {
        console.log(`Inserted prescription for file: ${filePath}`);
      }
    }
  }
}

migrate();