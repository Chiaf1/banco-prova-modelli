// Rilevamento di hardware e versioni, gestione dei modelli caricati in Ollama.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { Hardware } from "./calcoli.ts";

function comando(cmd: string, args: string[]): string | null {
  const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 15_000 });
  return r.status === 0 ? `${r.stdout}${r.stderr}` : null;
}

function campo(testo: string | null, re: RegExp): string | null {
  const m = testo ? re.exec(testo) : null;
  return m ? m[1].trim() : null;
}

export function rilevaHardware(): Hardware {
  const lscpu = comando("lscpu", []);
  const meminfo = (() => {
    try {
      return readFileSync("/proc/meminfo", "utf8");
    } catch {
      return null;
    }
  })();
  const osRelease = (() => {
    try {
      return readFileSync("/etc/os-release", "utf8");
    } catch {
      return null;
    }
  })();
  const gpu = comando("nvidia-smi", ["--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"]);
  const [gpuNome, vram, driver] = gpu ? gpu.split("\n")[0].split(",").map((s) => s.trim()) : [null, null, null];
  const cuda = campo(comando("nvidia-smi", []), /CUDA (?:UMD )?Version:\s*([\d.]+)/);
  const memKb = campo(meminfo, /^MemTotal:\s+(\d+) kB/m);
  const llama = comando("llama", ["--version"]);
  return {
    cpu: campo(lscpu, /^Model name:\s*(.+)$/m),
    cpu_thread: Number(campo(lscpu, /^CPU\(s\):\s*(\d+)/m)) || null,
    cpu_max_mhz: Number(campo(lscpu, /^CPU max MHz:\s*([\d.]+)/m)) || null,
    ram_gib: memKb ? Math.round((Number(memKb) / 1024 / 1024) * 10) / 10 : null,
    gpu: gpuNome ?? null,
    vram_mib: vram ? Number(vram) : null,
    driver: driver ?? null,
    cuda,
    sistema: campo(osRelease, /^PRETTY_NAME="?([^"\n]+)"?/m),
    kernel: comando("uname", ["-r"])?.trim() ?? null,
    node: process.version,
    ollama: campo(comando("ollama", ["--version"]), /version is\s*(\S+)/),
    llama_versione: llama ? llama.split("\n")[0].trim() : null,
    llama_build: campo(llama, /build (\d+)/),
  };
}

export type ModelloOllama = {
  name: string;
  size: number;
  size_vram: number;
  context_length: number | null;
};

export async function ollamaCaricati(base = "http://localhost:11434"): Promise<ModelloOllama[]> {
  const r = await fetch(`${base}/api/ps`, { signal: AbortSignal.timeout(5000) });
  const j = (await r.json()) as { models?: ModelloOllama[] };
  return (j.models ?? []).map((m) => ({
    name: m.name,
    size: m.size,
    size_vram: m.size_vram,
    context_length: m.context_length ?? null,
  }));
}

// Scarica tutti i modelli Ollama (ollama stop) e aspetta che la lista sia vuota.
export async function scaricaOllama(base = "http://localhost:11434"): Promise<string[]> {
  let caricati: ModelloOllama[];
  try {
    caricati = await ollamaCaricati(base);
  } catch {
    return []; // Ollama spento: niente da scaricare
  }
  for (const m of caricati) comando("ollama", ["stop", m.name]);
  for (let i = 0; i < 50; i++) {
    if ((await ollamaCaricati(base)).length === 0) return caricati.map((m) => m.name);
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Ollama non ha scaricato: ${(await ollamaCaricati(base)).map((m) => m.name).join(", ")}`);
}

export async function serverRisponde(urlV1: string): Promise<boolean> {
  try {
    const r = await fetch(`${urlV1.replace(/\/$/, "")}/models`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

// /props di llama.cpp (contesto effettivo, modello caricato), se disponibile.
export async function propsLlama(urlV1: string): Promise<{ n_ctx: number | null; model_path: string | null } | null> {
  try {
    const r = await fetch(`${urlV1.replace(/\/v1\/?$/, "")}/props`, { signal: AbortSignal.timeout(3000) });
    const j: any = await r.json();
    return {
      n_ctx: j.default_generation_settings?.n_ctx ?? j.n_ctx ?? null,
      model_path: j.model_path ?? null,
    };
  } catch {
    return null;
  }
}

export function versioneProgramma(): { versione: string; commit: string | null; modifiche_non_committate: boolean } {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const commit = comando("git", ["rev-parse", "--short", "HEAD"])?.trim() ?? null;
  const stato = comando("git", ["status", "--porcelain", "--", "bench", "esercizi", "package.json"]);
  return { versione: pkg.version, commit, modifiche_non_committate: !!stato?.trim() };
}

// Variabili OLLAMA_* del servizio systemd (contesto, flash attention, cache KV...).
export function ambienteOllama(): Record<string, string> | null {
  const r = comando("systemctl", ["show", "ollama", "-p", "Environment", "--value"]);
  if (r == null) return null;
  return Object.fromEntries(
    r
      .trim()
      .split(/\s+/)
      .map((v) => v.replace(/^"|"$/g, ""))
      .filter((v) => v.startsWith("OLLAMA_"))
      .map((v) => [v.slice(0, v.indexOf("=")), v.slice(v.indexOf("=") + 1)])
      .sort(),
  );
}
