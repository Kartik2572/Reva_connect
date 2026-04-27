import fs from "fs";
import path from "path";

const files = [
  "connectionController.js",
  "postController.js",
  "mentorshipController.js",
  "adminController.js"
];

const basePath = path.join(process.cwd(), "controllers");

for (const file of files) {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf-8");

  // Add logger import if not exists
  if (!content.includes('import { logger }')) {
    content = content.replace(
      /import { pool } from "\.\.\/config\/db\.js";/,
      `import { pool } from "../config/db.js";\nimport { logger } from "../utils/logger.js";`
    );
  }

  // Replace console.error(error);
  content = content.replace(/console\.error\(error\);/g, 'logger.error({ error: error.message, stack: error.stack }, "Error in ' + file + '");');
  
  // Replace console.error(error.message);
  content = content.replace(/console\.error\(error\.message\);/g, 'logger.error({ error: error.message, stack: error.stack }, "Error in ' + file + '");');

  // Replace console.error(...); general
  content = content.replace(/console\.error\(([^)]+)\);/g, (match, p1) => {
    if (match.includes('logger.error')) return match;
    return `logger.error(${p1});`;
  });

  // Replace console.log(...)
  content = content.replace(/console\.log\(([\s\S]*?)\);/g, (match, p1) => {
    if (match.includes('logger.info')) return match;
    return `logger.info(${p1});`;
  });

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Updated ${file}`);
}
