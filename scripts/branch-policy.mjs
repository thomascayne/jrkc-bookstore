import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const protectedBranches = new Set(['main']);

export function assertPullRequestFlow(baseBranch, headBranch) {
  if (!baseBranch || !headBranch) {
    throw new Error('Pull-request base and head branches are required.');
  }

  if (baseBranch === 'main' && protectedBranches.has(headBranch)) {
    throw new Error(
      'Pull requests into main must originate from a working branch.',
    );
  }

  if (!protectedBranches.has(baseBranch)) {
    throw new Error(`Unsupported protected base branch: ${baseBranch}.`);
  }
}

export function assertDeploymentSource(targetBranch, pullRequests) {
  const authorizedPullRequest = pullRequests.some((pullRequest) => {
    if (!pullRequest.merged_at || pullRequest.base?.ref !== targetBranch) {
      return false;
    }

    return targetBranch === 'main' && !protectedBranches.has(pullRequest.head?.ref);
  });

  if (!authorizedPullRequest) {
    throw new Error(
      `Commit is not associated with an authorized merged pull request into ${targetBranch}; deployment is blocked.`,
    );
  }
}

function runCommandLine() {
  const [command, firstArgument, secondArgument] = process.argv.slice(2);

  if (command === 'pull-request') {
    assertPullRequestFlow(firstArgument, secondArgument);
    console.log(`Authorized pull request flow: ${secondArgument} -> ${firstArgument}`);
    return;
  }

  if (command === 'deployment') {
    const pullRequests = JSON.parse(readFileSync(0, 'utf8'));

    if (!Array.isArray(pullRequests)) {
      throw new TypeError('GitHub pull-request response must be an array.');
    }

    assertDeploymentSource(firstArgument, pullRequests);
    console.log(`Authorized merged pull request into ${firstArgument}.`);
    return;
  }

  throw new Error('Expected "pull-request" or "deployment" policy command.');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCommandLine();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Branch policy rejected the operation: ${message}`);
    process.exit(1);
  }
}
