import { readerFromStreamReader } from "https://deno.land/std@0.96.0/io/streams.ts";
import { readLines } from "https://deno.land/std@0.96.0/io/mod.ts";
import { writeAll } from "https://deno.land/std@0.96.0/io/util.ts";
import { resolve } from "https://deno.land/std@0.96.0/path/posix.ts";

async function updateSystem() {
  const update = await $`[apt update] sudo apt update -y`;
  if (!update.success) {
    throw new Error("failed to run apt update");
  }

  const basic = await $
    `[apt install] sudo apt install -y curl apt-transport-https zip software-properties-common`;
  if (!basic.success) {
    throw new Error("failed to run apt install");
  }
}

async function installConfigFiles() {
  const bash = await fetch(
    "https://raw.githubusercontent.com/wperron/dotfiles/master/.bashrc",
  );

  const bashDest = await Deno.open(
    resolve(Deno.env.get("HOME") ?? "", ".bashrc.test"),
    { read: true, write: true, create: true },
  );

  const git = await fetch(
    "https://raw.githubusercontent.com/wperron/dotfiles/master/.gitconfig",
  );

  const gitDest = await Deno.open(
    resolve(Deno.env.get("HOME") ?? "", ".gitconfig.test"),
    {
      read: true,
      write: true,
      create: true,
    },
  );

  await Promise.all([
    streamReaderToFile(bash.body!.getReader(), bashDest),
    streamReaderToFile(git.body!.getReader(), gitDest),
  ]);
}

async function installLatestGit() {
  const add = await $`[git] sudo apt-add-repository -y ppa:git-core/ppa`;
  if (!add.success) {
    throw new Error("failed to add git-core/ppa repository");
  }

  const update = await $`[git] sudo apt update -y`;
  if (!update.success) {
    throw new Error("failed to update apt");
  }

  const install = await $`[git] sudo apt install -y git`;
  if (!install.success) {
    throw new Error("failed to install git");
  }
}

async function installPython() {
  const python = await $
    `[python] sudo apt install -y python python3 python3-pip`;
  if (!python.success) {
    throw new Error("failed to install python");
  }
}

async function installNode() {
  const nodeSource = await fetch("https://deb.nodesource.com/setup_16.x");
  const dest = await Deno.makeTempFile();
  const f = await Deno.open(dest, { read: true, write: true });
  await streamReaderToFile(nodeSource.body!.getReader(), f);

  const script = await $`[node] sudo bash ${dest}`;
  if (!script.success) {
    throw new Error("failed to run Node install script");
  }

  const install = await $`[node] sudo apt install -y nodejs`;
  if (!install.success) {
    throw new Error("failed to install Node from apt");
  }
}

async function installGolang() {
  const goSource = await fetch(
    "https://dl.google.com/go/go1.16.4.linux-amd64.tar.gz",
  );
  const dest = await Deno.makeTempFile();
  const f = await Deno.open(dest, { read: true, write: true });
  await streamReaderToFile(goSource.body!.getReader(), f);

  const go = await $`[golang] sudo tar -C /usr/local -xzf ${dest}`;
  if (!go.success) {
    throw new Error("failed to install golang");
  }
}

async function installRust() {
  const rustupSource = await fetch("https://sh.rustup.rs");
  const dest = await Deno.makeTempFile();
  const f = await Deno.open(dest, { read: true, write: true });
  await streamReaderToFile(rustupSource.body!.getReader(), f);

  const rustup = await $`[rust] bash ${dest} -y`;
  if (!rustup.success) {
    throw new Error("failed to install Rust from rustup");
  }
}

async function installDeno() {
  const denoSource = await fetch("https://deno.land/x/install/install.sh");
  const dest = await Deno.makeTempFile();
  const f = await Deno.open(dest, { read: true, write: true });
  await streamReaderToFile(denoSource.body!.getReader(), f);

  const deno = await $`[deno] sh ${dest}`;
  if (!deno.success) {
    throw new Error("failed to install Rust from rustup");
  }
}

function streamReaderToFile(
  sr: ReadableStreamDefaultReader,
  f: Deno.File,
) {
  const reader = readerFromStreamReader(sr);
  return Deno.copy(reader, f);
}
// --- Taken from npm:shq ---
function d(m: string) {
  return (m.length === 1 ? "'\\''" : `'"${m}"'`);
}

// deno-lint-ignore no-control-regex
const n = /\x00+/g;
const b = /^[A-Za-z0-9,:=_\.\/\-]+$/;
const p = /'+/g;

// deno-lint-ignore no-explicit-any
function q(o: any, x: string) {
  if (!x)return (o.empty || "''");
  const s = String(x).replace(n, "");
  const m = b.exec(s);
  if (m && (m[0].length === s.length)) {
    const g = (o.gratuitous || "");
    return g + s + g;
  }
  return ("'" + s.replace(p, d) + "'").replace(/^''/, "").replace(/''$/, "");
}

function shq(x: string) {
  return q(false, x);
}
// ---

function $(parts: TemplateStringsArray, ...args: string[]) {
  let cmd = parts[0], i = 0;
  while (i < args.length) cmd += shq(args[i].replace(/\n$/, "")) + parts[++i];

  let prefix = "";
  if (cmd.match(/^\[.*\]/)) {
    const end = cmd.indexOf("]");
    prefix = cmd.slice(0, end + 1), cmd = cmd.slice(end + 1).trimLeft();
  }

  console.log(`prefix: ${prefix}, cmd: ${cmd}`);

  const c = Deno.run({
    cmd: cmd.split(" "),
    stdout: "piped",
    stderr: "piped",
  });

  pipeThrough(prefix, c.stdout, Deno.stdout);
  pipeThrough(prefix, c.stderr, Deno.stderr);

  return c.status();
}

async function pipeThrough(
  prefix: string,
  reader: Deno.Reader,
  writer: Deno.Writer,
) {
  const encoder = new TextEncoder();
  for await (const line of readLines(reader)) {
    await writeAll(writer, encoder.encode(`${prefix} ${line}\n`));
  }
}

if (import.meta.main) {
  await updateSystem();
  await installConfigFiles();
  await installLatestGit();
  await installPython();
  await installNode();
  await installGolang();
  await installRust();
  await installDeno();
}
