const shouldSkip = process.env.SKIP_PNPM_ENFORCEMENT === 'true';

if (shouldSkip) {
  process.exit(0);
}

const execPath = process.env.npm_execpath ?? '';
const userAgent = process.env.npm_config_user_agent ?? '';

const isPnpmExec = execPath.includes('pnpm');
const isPnpmUA = userAgent.includes('pnpm');

if (isPnpmExec || isPnpmUA) {
  process.exit(0);
}

const messageLines = [
  '',
  '**********************************************',
  '* Use "pnpm install" for installation here.  *',
  '* To skip this check (e.g. in CI/EB), set    *',
  '* SKIP_PNPM_ENFORCEMENT=true in the env.     *',
  '**********************************************',
  '',
];

console.error(messageLines.join('\n'));
process.exit(1);

