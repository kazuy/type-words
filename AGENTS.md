# Development Instructions

## Workflow

### Before implementation

- When a task adds or changes directory or package boundaries, present the
  proposed structure before implementation, including the responsibilities and
  dependency direction of major additions. Do not create placeholders for
  components that have no current responsibility. Obtain user agreement on the
  structure before proceeding.
- Propose meaningful commit boundaries before implementation.

### Review and commits

- When a task spans multiple proposed commit boundaries, implement only one
  boundary at a time. After implementing and verifying that boundary, leave
  its changes unstaged, present them for user review, and stop before starting
  the next boundary.
- Do not accumulate changes for later commit boundaries in the working tree.
  When a file will be touched by multiple boundaries, change only the hunks
  required by the current boundary so each review and commit remains atomic.
- After the user approves and stages the current boundary, create an
  appropriate Conventional Commit without requesting confirmation again.
  Begin the next boundary only after that commit is complete.
- Use Conventional Commit types such as `feat` and `chore` for commits, and
  use the same type names as branch-name prefixes.

## TypeScript and React

### Module design

- Keep a helper local and unexported when it has a single consumer. Extract a
  module only when it represents a clear architectural boundary or has
  multiple consumers. Avoid generic modules with unclear responsibilities.
- Keep calculation rules, problem generation, and answer grading separate
  from React components. Use pure functions wherever possible.
- Keep side effects such as time, timers, randomness, and screen updates at
  the edges. Allow problem generation to receive a `random: () => number`
  dependency so tests can use deterministic inputs.
- Prefer a lightweight feature-oriented structure. Avoid unnecessary
  domain/application/infrastructure layers.

### Testing

- Use Vitest for game logic and React Testing Library for UI behavior.
- Use parameterized tests when cases share the same setup, action, and
  assertion structure. Keep behaviorally distinct scenarios in separate tests.
- Test observable behavior rather than implementation details.
- Verify that subtraction never produces negative intermediate results,
  empty answers are not treated as zero, and correct answers remain hidden
  until grading.
- After changing application code, run the repository's lint, test, and build
  scripts once they are available.

### Style

- Use Biome for linting and formatting.
- **Logical spacing:** Keep closely related statements together, and insert a
  single blank line when the code moves to a distinct logical step, concern, or
  phase. Apply this to control flow and `return` statements based on meaning,
  rather than adding blank lines mechanically. Do not add blank lines solely
  because a function or control-flow block starts, a `case` or `default` label
  appears, or a block ends.

## Terraform

### Running commands

Terraform is managed with mise. Run Terraform commands from the repository
root through `mise exec` and use `-chdir=infra`.

### Validation

After changing Terraform configuration, run:

```sh
mise exec -- terraform -chdir=infra fmt -check -diff
mise exec -- terraform -chdir=infra validate
git diff --check
```

### Style

- Group attributes by logical concern, such as iteration, resource identity,
  configuration, and lifecycle behavior. Insert a single blank line when the
  concern changes, but do not add blank lines mechanically at the start or end
  of a block.

### Safety

- Review deletion behavior for every Terraform-managed resource. When
  supported, explicitly protect resources whose deletion would remove
  artifacts, identities, or running services with
  `deletion_policy = "PREVENT"` or `deletion_protection = true`. Do not rely on
  a provider's default deletion behavior without deliberate review.
- For R2 buckets, use Terraform's `lifecycle.prevent_destroy` because the
  Cloudflare bucket resource does not provide a deletion-protection attribute.
- Manage only the private word data bucket and its disabled public access in
  `infra/`. The state bucket, Pages project, and API tokens are managed outside
  this Terraform configuration.
- Keep backend settings, actual variable values, credentials, state, and plans
  out of Git. Never include individual account or resource information in
  committed examples.
