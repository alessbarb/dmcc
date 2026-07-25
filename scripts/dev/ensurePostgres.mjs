import { spawnSync } from "node:child_process";

const DATABASE_SERVICE = "postgres";
const MAX_READY_ATTEMPTS = 30;
const READY_INTERVAL_MS = 1_000;

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function ensureDockerAvailable() {
  const dockerVersion = run("docker", ["--version"]);

  if (dockerVersion.error?.code === "ENOENT") {
    console.error(
      "[dev] Docker no está instalado o no se encuentra en el PATH.",
    );
    process.exit(1);
  }

  const dockerInfo = run("docker", ["info"], {
    stdio: "ignore",
  });

  if (dockerInfo.status !== 0) {
    console.error("");
    console.error("[dev] Docker está instalado, pero el daemon no responde.");
    console.error("");
    console.error("Arráncalo antes de ejecutar el proyecto:");
    console.error("");
    console.error("  Docker Engine:");
    console.error("    sudo systemctl start docker");
    console.error("");
    console.error("  Docker Desktop:");
    console.error("    inicia Docker Desktop");
    console.error("");
    process.exit(1);
  }
}

function startPostgres() {
  console.log("[dev] Comprobando PostgreSQL...");

  const composeUp = run(
    "docker",
    ["compose", "up", "-d", DATABASE_SERVICE],
    {
      stdio: "inherit",
    },
  );

  if (composeUp.status !== 0) {
    console.error("[dev] No se pudo levantar PostgreSQL.");
    process.exit(composeUp.status ?? 1);
  }
}

async function waitForPostgres() {
  for (let attempt = 1; attempt <= MAX_READY_ATTEMPTS; attempt += 1) {
    const readinessCheck = run(
      "docker",
      [
        "compose",
        "exec",
        "-T",
        DATABASE_SERVICE,
        "pg_isready",
        "-q",
      ],
      {
        stdio: "ignore",
      },
    );

    if (readinessCheck.status === 0) {
      console.log("[dev] PostgreSQL está preparado.");
      return;
    }

    if (attempt === 1) {
      console.log("[dev] Esperando a que PostgreSQL acepte conexiones...");
    }

    await sleep(READY_INTERVAL_MS);
  }

  console.error(
    `[dev] PostgreSQL no estuvo disponible después de ${
      (MAX_READY_ATTEMPTS * READY_INTERVAL_MS) / 1_000
    } segundos.`,
  );
  console.error("");
  console.error("Revisa el contenedor con:");
  console.error("");
  console.error(`  docker compose logs ${DATABASE_SERVICE}`);
  console.error("");

  process.exit(1);
}

ensureDockerAvailable();
startPostgres();
await waitForPostgres();
