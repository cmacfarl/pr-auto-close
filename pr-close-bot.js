/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const { Octokit } = require("@octokit/core");
const { createProbotAuth } = require("octokit-auth-probot");
const { createAppAuth } = require("@octokit/auth-app");
const { config, composeConfigGet } = require("@probot/octokit-plugin-config");

const ProbotOctokit = Octokit.defaults({
  authStrategy: createProbotAuth,
});

const processPull = async (pull, octokit, config, log) => {
  if ((config.forkOnly == true) && (pull.head.repo.fork == false)) {
    return;
  }
  log.info("Commenting on " + pull.base.repo.name + " " + pull.number)
  await octokit.issues.createComment({
    owner: pull.base.repo.owner.login,
    repo: pull.base.repo.name,
    issue_number: pull.number,
    body: config.closureComment,
  });
  log.info("Closing " + pull.base.repo.name + " " + pull.number)
  ret = await octokit.pulls.update({
    owner: pull.base.repo.owner.login,
    repo: pull.base.repo.name,
    pull_number: pull.number,
    state: "closed"
  });
  log.info("Closed " + pull.base.repo.name + " " + pull.number)
  return ret;
}

const processRepository = async (repository, octokit, config, log) => {
  log.info("Processing " + repository.name)
  pulls = await octokit.pulls.list({ owner: repository.owner.login, repo: repository.name})
  pulls.data.forEach(async (pull) => { await processPull(pull, octokit, config, log) })
}

module.exports = async (app) => {
  app.log.info("Started pr-auto-close bot");
  const octokit = await app.auth(process.env.INSTALLATION_ID, app.log);

  /*
   * Pull the config from a known repo that is not the target as the target
   * so that we can change the config independent of the target's release cycle.
   */
  const cfg = await octokit.config.get({
    owner: process.env.CONFIG_OWNER,
    repo: process.env.CONFIG_REPO,
    path: ".github/pr-auto-close.yml",
  });

  /*
   * Go get any PRs that were opened while we were not running.  Don't care about pagination
   * because the number of open PRs are in the single digits.
   */
  // repositories = await octokit.apps.listReposAccessibleToInstallation();
  // repositories.data.repositories.forEach(async (repository) => { await processRepository(repository, octokit, cfg.config, app.log) });

  /*
   * Handle PRs as they come in.
   */
  app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
    return processPull(context.payload.pull_request, octokit, cfg.config, app.log);
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};


