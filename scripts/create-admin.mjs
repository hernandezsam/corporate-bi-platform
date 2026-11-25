#!/usr/bin/env node
/**
 * Script seguro de creación del primer usuario ADMINISTRADOR.
 *
 * Uso:
 *   npm run seed:admin
 *
 * O pasando variables de entorno (útil en Render Shell):
 *   ADMIN_EMAIL=admin@empresa.com ADMIN_FULL_NAME="Administrador Principal" ADMIN_PASSWORD="TuPasswordSegura123" npm run seed:admin
 *
 * Nunca almacena ni hardcodea credenciales en el código fuente.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Error: Defina NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local o en el entorno."
    );
    process.exit(1);
  }

  let email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let fullName = process.env.ADMIN_FULL_NAME?.trim();
  let password = process.env.ADMIN_PASSWORD;

  if (!email || !fullName || !password) {
    const rl = readline.createInterface({ input, output });
    try {
      if (!fullName) {
        fullName = (await rl.question("Nombre completo del administrador: ")).trim();
      }
      if (!email) {
        email = (await rl.question("Correo electrónico corporativo: "))
          .trim()
          .toLowerCase();
      }
      if (!password) {
        password = (
          await rl.question("Contraseña inicial (mínimo 8 caracteres): ")
        ).trim();
      }
    } finally {
      rl.close();
    }
  }

  if (!email || !email.includes("@")) {
    console.error("Error: Correo electrónico inválido.");
    process.exit(1);
  }
  if (!fullName || fullName.length < 2) {
    console.error("Error: Nombre completo inválido.");
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error("Error: La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\nCreando administrador principal (${email})...`);

  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  let userId = created?.user?.id;

  if (createErr) {
    if (createErr.message?.toLowerCase().includes("already")) {
      console.log(
        "El usuario ya existía en Supabase Auth. Buscando para promoverlo a ADMIN..."
      );
      const { data: listData, error: listErr } =
        await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) {
        console.error("Error consultando usuarios:", listErr.message);
        process.exit(1);
      }
      const existing = listData.users.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (!existing) {
        console.error("No se encontró el usuario existente.");
        process.exit(1);
      }
      userId = existing.id;
    } else {
      console.error("Error creando usuario en Auth:", createErr.message);
      process.exit(1);
    }
  }

  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      role: "ADMIN",
      active: true,
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    console.error("Error configurando perfil ADMIN:", profileErr.message);
    process.exit(1);
  }

  console.log("✔ Administrador principal configurado con éxito.");
  console.log(`  ID:     ${userId}`);
  console.log(`  Nombre: ${fullName}`);
  console.log(`  Correo: ${email}`);
  console.log(`  Rol:    ADMIN\n`);
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
