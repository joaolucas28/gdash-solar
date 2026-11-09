// Tranca e destranca o .env com uma senha escolhida pelo usuário, para levar as credenciais
// entre máquinas pelo GitHub sem expor nada. O arquivo trancado é o .env.cifrado (pode subir).
// Cifra: AES-256-GCM com chave derivada da senha por scrypt. Sem a senha, o arquivo é ilegível.
//
// Uso, da raiz do projeto, num terminal PowerShell (a senha é digitada sem aparecer):
//   node scripts/env-senha.mjs trancar   -> lê .env e grava .env.cifrado
//   node scripts/env-senha.mjs abrir     -> lê .env.cifrado e grava .env
import fs from "node:fs";
import crypto from "node:crypto";

const ENV = ".env", CIFRADO = ".env.cifrado";
const SCRYPT = { N: 2 ** 16, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
let sobra = "";

function perguntarSenha(texto) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(texto);
    if (!stdin.isTTY) {
      // Sem terminal interativo: lê uma linha por vez, guardando o que sobrar para a próxima pergunta.
      const pegar = () => {
        const i = sobra.indexOf("\n");
        if (i < 0) return false;
        const linha = sobra.slice(0, i).replace(/\r$/, "");
        sobra = sobra.slice(i + 1);
        process.stdout.write("\n"); resolve(linha); return true;
      };
      if (pegar()) return;
      stdin.setEncoding("utf8");
      const ler = (c) => { sobra += c; if (pegar()) { stdin.off("data", ler); stdin.pause(); } };
      stdin.on("data", ler);
      stdin.resume();
      return;
    }
    let senha = "";
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();
    const ler = (c) => {
      for (const ch of c) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false); stdin.pause(); stdin.off("data", ler);
          process.stdout.write("\n"); return resolve(senha);
        }
        if (ch === "\u0003") { process.stdout.write("\n"); process.exit(1); }
        if (ch === "\u0008" || ch === "\u007f") { if (senha) { senha = senha.slice(0, -1); process.stdout.write("\b \b"); } continue; }
        senha += ch; process.stdout.write("*");
      }
    };
    stdin.on("data", ler);
  });
}

const chave = (senha, salt) => crypto.scryptSync(senha.normalize("NFC"), salt, 32, SCRYPT);

async function trancar() {
  if (!fs.existsSync(ENV)) sair(`Não achei o ${ENV}. Rode da raiz do projeto gdash-solar.`);
  const senha = await perguntarSenha("Escolha a senha (mínimo 12 caracteres): ");
  if (senha.length < 12) sair("Senha curta. Use pelo menos 12 caracteres.");
  if ((await perguntarSenha("Repita a senha: ")) !== senha) sair("As senhas não batem. Nada foi gravado.");
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", chave(senha, salt), iv);
  const dados = Buffer.concat([c.update(fs.readFileSync(ENV)), c.final()]);
  const saida = { versao: 1, cifra: "aes-256-gcm/scrypt", salt: salt.toString("base64"), iv: iv.toString("base64"),
    tag: c.getAuthTag().toString("base64"), dados: dados.toString("base64") };
  fs.writeFileSync(CIFRADO, JSON.stringify(saida, null, 2) + "\n");
  console.log(`${CIFRADO} gravado. Pode subir para o GitHub. Guarde a senha: sem ela não dá para abrir.`);
}

async function abrir() {
  if (!fs.existsSync(CIFRADO)) sair(`Não achei o ${CIFRADO}. Rode git pull e confira se está na raiz do projeto.`);
  const e = JSON.parse(fs.readFileSync(CIFRADO, "utf8"));
  const senha = await perguntarSenha("Senha do .env: ");
  let texto;
  try {
    const d = crypto.createDecipheriv("aes-256-gcm", chave(senha, Buffer.from(e.salt, "base64")), Buffer.from(e.iv, "base64"));
    d.setAuthTag(Buffer.from(e.tag, "base64"));
    texto = Buffer.concat([d.update(Buffer.from(e.dados, "base64")), d.final()]);
  } catch { sair("Senha errada (ou arquivo corrompido). Nada foi alterado."); }
  if (fs.existsSync(ENV)) {
    if (fs.readFileSync(ENV).equals(texto)) { console.log(`${ENV} já está igual ao cifrado. Nada mudou.`); return; }
    fs.copyFileSync(ENV, ".env.antigo");
    console.log("O .env que existia foi guardado como .env.antigo.");
  }
  fs.writeFileSync(ENV, texto);
  console.log(`${ENV} recriado a partir do ${CIFRADO}.`);
}

function sair(msg) { console.error(msg); process.exit(1); }

const acao = process.argv[2];
if (acao === "trancar") await trancar();
else if (acao === "abrir") await abrir();
else sair("Uso: node scripts/env-senha.mjs trancar | abrir");
