#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
    cp,
    mkdir,
    readdir,
    readFile,
    rm,
    stat,
    writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const releaseDir = join(rootDir, "release");
const stagingDir = join(releaseDir, "_staging");
const portableAppFolderName = "DM Campaign Companion";
const portableZipName = "DMCC-Windows-x64-portable.zip";

const clean = process.argv.includes("--clean");
const skipBuild = process.argv.includes("--skip-build");
const withWindowsInstallers =
    process.argv.includes("--with-windows-installers") ||
    process.env.DMCC_RELEASE_WITH_WINDOWS_INSTALLERS === "1";

const packageJson = JSON.parse(
    await readFile(join(rootDir, "package.json"), "utf8"),
);

const keepIntermediate =
    process.argv.includes("--keep-intermediate") ||
    process.env.DMCC_RELEASE_KEEP_INTERMEDIATE === "1";

const appName = packageJson.build?.productName ?? "DM Campaign Companion";
const version = packageJson.version ?? "0.0.0";

function log(message = "") {
    console.log(message);
}

function section(title) {
    log("");
    log(`\x1b[36m==> ${title}\x1b[0m`);
}

function commandPath(command) {
    const suffix = process.platform === "win32" ? ".cmd" : "";
    return join(rootDir, "node_modules", ".bin", `${command}${suffix}`);
}

function run(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const label = [command, ...args].join(" ");
        log(`$ ${label}`);

        const child = spawn(command, args, {
            cwd: options.cwd ?? rootDir,
            stdio: "inherit",
            shell: process.platform === "win32",
            env: {
                ...process.env,
                ...(options.env ?? {}),
            },
        });

        child.on("error", reject);

        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`Command failed with exit code ${code}: ${label}`));
        });
    });
}

async function commandExists(command) {
    const checker = process.platform === "win32" ? "where" : "command";
    const args = process.platform === "win32" ? [command] : ["-v", command];

    return new Promise((resolve) => {
        const child = spawn(checker, args, {
            stdio: "ignore",
            shell: process.platform !== "win32",
        });

        child.on("error", () => resolve(false));
        child.on("exit", (code) => resolve(code === 0));
    });
}

async function removeSmallBrokenInstallers() {
    if (!existsSync(releaseDir)) {
        return;
    }

    const entries = await readdir(releaseDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const filePath = join(releaseDir, entry.name);
        const fileStat = await stat(filePath);

        const looksLikeFailedSetup =
            entry.name.endsWith(".exe") &&
            entry.name.toLowerCase().includes("setup") &&
            fileStat.size < 1024 * 1024;

        if (looksLikeFailedSetup) {
            await rm(filePath, { force: true });
        }
    }
}

async function cleanupReleaseDirectory() {
    if (keepIntermediate) {
        log("");
        log("Keeping intermediate release files because --keep-intermediate was used.");
        return;
    }

    if (!existsSync(releaseDir)) {
        return;
    }

    const removableDirectories = [
        "_staging",
        "linux-unpacked",
        "win-unpacked",
        "mac",
        "mac-universal",
    ];

    const removableFiles = [
        "builder-debug.yml",
        "builder-effective-config.yaml",
        "latest-linux.yml",
        "latest.yml",
        "latest-mac.yml",
    ];

    for (const directoryName of removableDirectories) {
        const directoryPath = join(releaseDir, directoryName);

        if (existsSync(directoryPath)) {
            log(`Removing intermediate directory: ${directoryName}`);
            await rm(directoryPath, { recursive: true, force: true });
        }
    }

    const entries = await readdir(releaseDir, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const shouldRemove =
            removableFiles.includes(entry.name) ||
            entry.name.endsWith(".blockmap") ||
            entry.name.endsWith(".nsis.7z") ||
            entry.name.endsWith(".nsis-web.7z");

        if (shouldRemove) {
            log(`Removing intermediate file: ${entry.name}`);
            await rm(join(releaseDir, entry.name), { force: true });
        }
    }

    await removeSmallBrokenInstallers();
}

async function copyWindowsPortableFolder() {
    const winUnpackedDir = join(releaseDir, "win-unpacked");

    if (!existsSync(winUnpackedDir)) {
        throw new Error(
            "Windows unpacked build was not generated. Expected release/win-unpacked.",
        );
    }

    const targetDir = join(stagingDir, portableAppFolderName);

    await rm(stagingDir, { recursive: true, force: true });
    await mkdir(stagingDir, { recursive: true });
    await cp(winUnpackedDir, targetDir, { recursive: true });

    return targetDir;
}

async function zipWindowsPortableFolder() {
    const hasZip = await commandExists("zip");

    if (!hasZip) {
        throw new Error(
            "The 'zip' command is required to package Windows portable output. Install it with: sudo apt install zip",
        );
    }

    await copyWindowsPortableFolder();

    const zipPath = join(releaseDir, portableZipName);
    await rm(zipPath, { force: true });

    await run("zip", ["-r", join("..", portableZipName), portableAppFolderName], {
        cwd: stagingDir,
    });

    await rm(stagingDir, { recursive: true, force: true });
}

async function sha256(filePath) {
    const data = await readFile(filePath);
    return createHash("sha256").update(data).digest("hex");
}

function isDeliverableFile(fileName) {
    if (fileName.endsWith(".AppImage")) {
        return true;
    }

    if (fileName.endsWith(".deb")) {
        return true;
    }

    if (fileName.endsWith(".zip")) {
        return true;
    }

    if (fileName.endsWith(".dmg")) {
        return true;
    }

    // Include valid Windows installers or portable executables, but avoid tiny
    // partial NSIS files left behind by failed Wine runs.
    if (fileName.endsWith(".exe")) {
        return true;
    }

    return false;
}

async function getDeliverables() {
    if (!existsSync(releaseDir)) {
        return [];
    }

    const entries = await readdir(releaseDir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        if (!isDeliverableFile(entry.name)) {
            continue;
        }

        const filePath = join(releaseDir, entry.name);
        const fileStat = await stat(filePath);

        if (entry.name.endsWith(".exe") && fileStat.size < 1024 * 1024) {
            continue;
        }

        files.push({
            name: entry.name,
            path: filePath,
            size: fileStat.size,
        });
    }

    files.sort((a, b) => a.name.localeCompare(b.name));
    return files;
}

function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function writeReleaseFiles() {
    const deliverables = await getDeliverables();

    const sums = [];

    for (const artifact of deliverables) {
        const hash = await sha256(artifact.path);
        sums.push(`${hash}  ${artifact.name}`);
        artifact.sha256 = hash;
    }

    await writeFile(
        join(releaseDir, "SHA256SUMS.txt"),
        `${sums.join("\n")}\n`,
        "utf8",
    );

    const manifest = [
        `DM Campaign Companion ${version}`,
        "",
        `Generated at: ${new Date().toISOString()}`,
        `Root: ${rootDir}`,
        "",
        "Artifacts:",
        ...deliverables.map(
            (artifact) =>
                `- ${artifact.name} (${formatBytes(artifact.size)}) sha256=${artifact.sha256}`,
        ),
        "",
        "Recommended delivery:",
        "- Linux portable: AppImage",
        "- Ubuntu/Debian installer: .deb",
        "- Windows portable: DMCC-Windows-x64-portable.zip",
        "",
    ];

    await writeFile(
        join(releaseDir, "RELEASE_MANIFEST.txt"),
        manifest.join("\n"),
        "utf8",
    );

    section("Release artifacts");
    for (const artifact of deliverables) {
        log(`- ${artifact.name} (${formatBytes(artifact.size)})`);
    }

    log("");
    log(`Checksums: ${relative(rootDir, join(releaseDir, "SHA256SUMS.txt"))}`);
    log(`Manifest:  ${relative(rootDir, join(releaseDir, "RELEASE_MANIFEST.txt"))}`);
}

async function main() {
    section(`${appName} desktop release ${version}`);

    if (clean) {
        section("Cleaning release directory");
        await rm(releaseDir, { recursive: true, force: true });
    }

    await mkdir(releaseDir, { recursive: true });

    if (!skipBuild) {
        section("Building web and backend once");
        await run("npm", ["run", "build"]);
    }

    const electronBuilder = commandPath("electron-builder");

    section("Building Linux AppImage");
    await run(electronBuilder, ["--linux", "AppImage"]);

    section("Building Linux .deb");
    await run(electronBuilder, ["--linux", "deb"]);

    section("Building Windows unpacked portable folder");
    await run(electronBuilder, ["--win", "--dir"]);

    section("Packaging Windows portable zip");
    await zipWindowsPortableFolder();

    if (withWindowsInstallers) {
        section("Trying Windows NSIS and portable .exe targets");

        try {
            await run(electronBuilder, ["--win", "nsis", "portable"]);
        } catch (error) {
            log("");
            log("\x1b[33mWindows installer targets failed. Keeping win-unpacked zip.\x1b[0m");
            log(String(error.message ?? error));
        }

        await removeSmallBrokenInstallers();
    }

    section("Cleaning intermediate release files");
    await cleanupReleaseDirectory();

    section("Writing checksums and manifest");
    await writeReleaseFiles();

    section("Done");
}

main().catch((error) => {
    console.error("");
    console.error("\x1b[31mRelease failed\x1b[0m");
    console.error(error);
    process.exitCode = 1;
});
