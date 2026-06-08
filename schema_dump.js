import { pool } from "./backend/config/db.js";

async function querySchema() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);
    
    let currentTable = "";
    res.rows.forEach(row => {
      if (currentTable !== row.table_name) {
        currentTable = row.table_name;
        console.log(`\nTable: ${currentTable}`);
      }
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Also check for post_likes table
    const fkRes = await pool.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `);
    console.log("\nForeign Keys:");
    fkRes.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

querySchema();
