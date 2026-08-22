import {readFile} from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const packageLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const english = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const chinese = await readFile(new URL('../README.zh-CN.md', import.meta.url), 'utf8');
const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
const integrationWorkflow = await readFile(new URL('../.github/workflows/integration.yml', import.meta.url), 'utf8');
const publishWorkflow = await readFile(new URL('../.github/workflows/publish.yml', import.meta.url), 'utf8');
const expectedTag = `v${packageJson.version}`;

if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) throw new Error('package version must be stable semver');
if (packageLock.version !== packageJson.version || packageLock.packages?.['']?.version !== packageJson.version) {
  throw new Error('package-lock.json version does not match package.json');
}
if (!changelog.includes(`## ${packageJson.version} - `)) throw new Error(`CHANGELOG.md has no ${packageJson.version} section`);
if (!english.includes('@chenjie1129/dsh-remotion-video-plugin')) throw new Error('English README is missing the npm package name');
if (!chinese.includes('@chenjie1129/dsh-remotion-video-plugin')) throw new Error('Chinese README is missing the npm package name');
if (!english.includes(packageJson.version) || !chinese.includes(packageJson.version)) throw new Error('both READMEs must name the release version');
if (!patch.includes("name: '@chenjie1129/dsh-remotion-video-plugin'") || !patch.includes("name: '@chenjie1129/dsh-remotion-video-plugin/tools'")) {
  throw new Error('bundle patch must mount both the skill and tool rows');
}
if (!integrationWorkflow.includes('npm run test:e2e')) throw new Error('integration workflow must run the full tool smoke');
if (!publishWorkflow.includes('id-token: write') || !publishWorkflow.includes('npm publish --access public')
  || !publishWorkflow.includes('ref: refs/tags/${{ inputs.tag }}')
  || !publishWorkflow.includes('npm --prefix demo ci')
  || !publishWorkflow.includes('releases/tags/${RELEASE_TAG}')) {
  throw new Error('publish workflow must use an exact release tag, OIDC permission, and public npm publication');
}
if (process.env.RELEASE_TAG !== undefined && process.env.RELEASE_TAG !== expectedTag) {
  throw new Error(`release tag ${process.env.RELEASE_TAG} does not match ${expectedTag}`);
}
if (packageJson.publishConfig?.access !== 'public' || packageJson.publishConfig?.provenance !== true) {
  throw new Error('publishConfig must require public access and provenance');
}

console.log(`Release contract verified for ${packageJson.name}@${packageJson.version} (${expectedTag}).`);
