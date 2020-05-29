const core = require('@actions/core');
const github = require('@actions/github');

/** @see https://developer.github.com/v3/repos/deployments */
async function run() {
    try {
        const {context} = github;
        const {repo} = context;

        /** @type {state} */
        const state = core.getInput('state', {required: true});
        const token = core.getInput('token', {required: true});
        const description = core.getInput('description');
        const environment = core.getInput('environment') || 'live';
        const environment_url = core.getInput('environment_url');

        const octokit = new github.GitHub(token, {previews: ['flash', 'ant-man']});

        const deploy = await octokit.repos.createDeployment({
            description,
            environment,
            owner: repo.owner,
            ref: context.ref,
            repo: repo.repo,
            required_contexts: [],
        });

        await octokit.repos.createDeploymentStatus({
            ...repo,
            deployment_id: deploy.data.id,
            description,
            environment_url,
            log_url: `https://github.com/${repo.owner}/${repo.repo}/commit/${context.sha}/checks`,
            state,
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

/**
 * @typedef {"error" | "failure" | "inactive" | "in_progress" | "queued" | "pending" | "success" } state
 */
