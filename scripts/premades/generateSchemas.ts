import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { toJSONSchema } from "zod";
import {
  premadeManifestSchema,
  premadeTemplateFileSchema,
  premadeLocaleOverlaySchema,
} from "../../src/core/domain/premade/schemas.js";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");

const manifestSchemaPath = resolve(process.cwd(), "public/schemas/premade/manifest/v1.json");
const templateSchemaPath = resolve(process.cwd(), "public/schemas/premade/template/v1.json");
const localeSchemaPath = resolve(process.cwd(), "public/schemas/premade/locale/v1.json");

interface JsonSchemaDocument extends Record<string, unknown> {
  $schema?: string;
  $id?: string;
}

function formatSchema(schemaObj: JsonSchemaDocument) {
  // Asegurar que el id de schema sea correcto o extender si es necesario
  return `${JSON.stringify(schemaObj, null, 2)}\n`;
}

async function verifyOrWrite(filePath: string, schemaObj: JsonSchemaDocument, touched: string[]) {
  const next = formatSchema(schemaObj);
  const current = existsSync(filePath) ? await readFile(filePath, "utf8") : "";

  if (current !== next) {
    touched.push(filePath);
    if (!checkOnly) {
      await writeFile(filePath, next, "utf8");
    }
  }
}

async function main() {
  const touched: string[] = [];

  // Zod 4 native toJSONSchema()
  const manifestJsonSchema = toJSONSchema(premadeManifestSchema);
  manifestJsonSchema.$schema = "https://json-schema.org/draft/2020-12/schema";
  manifestJsonSchema.$id = "https://dmcc.local/schemas/premade/manifest/v1.json";

  const templateJsonSchema = toJSONSchema(premadeTemplateFileSchema);
  templateJsonSchema.$schema = "https://json-schema.org/draft/2020-12/schema";
  templateJsonSchema.$id = "https://dmcc.local/schemas/premade/template/v1.json";

  const localeJsonSchema = toJSONSchema(premadeLocaleOverlaySchema);
  localeJsonSchema.$schema = "https://json-schema.org/draft/2020-12/schema";
  localeJsonSchema.$id = "https://dmcc.local/schemas/premade/locale/v1.json";

  await verifyOrWrite(manifestSchemaPath, manifestJsonSchema, touched);
  await verifyOrWrite(templateSchemaPath, templateJsonSchema, touched);
  await verifyOrWrite(localeSchemaPath, localeJsonSchema, touched);

  if (checkOnly && touched.length > 0) {
    console.error("❌ JSON Schemas are out of sync with Zod definitions. Run npm run premade:schema:generate.");
    for (const file of touched) {
      console.error(` - ${file}`);
    }
    process.exit(1);
  }

  if (touched.length > 0) {
    console.log(`✓ Generated and updated ${touched.length} JSON Schema files`);
    for (const file of touched) {
      console.log(`  - ${file}`);
    }
  } else {
    console.log("✓ JSON Schemas are up to date with Zod definitions");
  }
}

main().catch((err) => {
  console.error("❌ Schema generation failed:", err);
  process.exit(1);
});
