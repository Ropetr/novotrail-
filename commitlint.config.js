export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      ['api', 'web', 'db', 'types', 'config', 'deps', 'omnichannel', 'crm', 'fiscal', 'auth'],
    ],
    'header-max-length': [2, 'always', 100],
  },
};
