#!/usr/bin/env node
/**
 * Vercel CLI Deployment Script (Cross-Platform)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';
const ALLOWED_COMMANDS = new Set(['vercel', 'npm', 'pnpm', 'yarn']);
function log(msg) { console.error(msg); }
function commandExists(cmd) {
  if (!ALLOWED_COMMANDS.has(cmd)) throw new Error(`Command not in whitelist: ${cmd}`);
  try {
    if (isWindows) { return spawnSync('where', [cmd], { stdio: 'ignore' }).status === 0; }
    else { return spawnSync('sh', ['-c', `command -v "$1"`, '--', cmd], { stdio: 'ignore' }).status === 0; }
  } catch { return false; }
}
function getCommandOutput(cmd, args) {
  try {
    const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], shell: isWindows });
    return result.status === 0 ? (result.stdout || '').trim() : null;
  } catch { return null; }
}
function parseArgs(args) {
  const result = { projectPath: '.', prod: true, yes: false, skipBuild: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--prod') result.prod = true;
    else if (arg === '--yes' || arg === '-y') result.yes = true;
    else if (arg === '--skip-build') result.skipBuild = true;
    else if (!arg.startsWith('-')) result.projectPath = arg;
  }
  return result;
}
function detectPackageManager(projectPath) {
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) return 'npm';
  if (commandExists('npm')) return 'npm';
  return null;
}
function runBuildIfNeeded(projectPath, skipBuild) {
  if (skipBuild) { log('Build step skipped'); return true; }
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return true;
  let packageJson;
  try { packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')); } catch { return true; }
  if (!packageJson.scripts || !packageJson.scripts.build) return true;
  const pkgManager = detectPackageManager(projectPath);
  if (!pkgManager) { log('Error: No package manager found'); process.exit(1); }
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('Installing dependencies...');
    const installArgs = pkgManager === 'yarn' ? [] : ['install'];
    const r = spawnSync(pkgManager, installArgs, { cwd: projectPath, stdio: 'inherit', shell: isWindows });
    if (r.status !== 0) { log('Install failed'); process.exit(1); }
  }
  log(`Building with ${pkgManager}...`);
  const buildArgs = pkgManager === 'npm' ? ['run', 'build'] : ['build'];
  const result = spawnSync(pkgManager, buildArgs, { cwd: projectPath, stdio: 'inherit', shell: isWindows });
  if (result.status !== 0) { log('Build FAILED!'); process.exit(1); }
  log('Build completed!');
  return true;
}
function doDeploy(projectPath, options) {
  log(''); log('Starting deployment...');
  const args = [];
  if (options.yes) args.push('--yes');
  if (options.prod) args.push('--prod');
  log(`Environment: ${options.prod ? 'Production' : 'Preview'}`);
  const result = spawnSync('vercel', args, {
    cwd: projectPath, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 300000, shell: isWindows
  });
  const output = (result.stdout || '') + (result.stderr || '');
  log(output);
  if (result.status !== 0) { log('Deployment failed'); process.exit(1); }
  const aliasedMatch = output.match(/Aliased:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const deploymentMatch = output.match(/Production:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const finalUrl = aliasedMatch ? aliasedMatch[1] : (deploymentMatch ? deploymentMatch[1] : null);
  log(''); log('Deployment successful!');
  if (finalUrl) {
    log(`Live at: ${finalUrl}`);
    console.log(JSON.stringify({ status: 'success', url: finalUrl }));
  } else {
    console.log(JSON.stringify({ status: 'success', message: 'Deployed' }));
  }
}
function main() {
  log('========================================');
  log('Vercel Deployment');
  log('========================================');
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  if (!commandExists('vercel')) { log('Vercel CLI not installed'); process.exit(1); }
  const version = getCommandOutput('vercel', ['--version']) || 'unknown';
  log(`Vercel CLI: ${version}`);
  const projectPath = path.resolve(options.projectPath);
  log(`Project: ${projectPath}`);
  runBuildIfNeeded(projectPath, options.skipBuild);
  doDeploy(projectPath, options);
}
main();
