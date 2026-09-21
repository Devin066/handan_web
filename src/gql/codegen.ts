import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/server/schema.graphql',
  documents: 'src/gql/documents/**/*.gql',
  generates: {
    'src/gql/index.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
        'fragment-matcher'
      ]
    }
  }
  // hooks: {
  //   afterAllFileWrite: ['eslint --fix', 'prettier --write']
  // }
};

export default config;
