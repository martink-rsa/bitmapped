import nextra from 'nextra';

const withNextra = nextra({});

/** @type {import('next').NextConfig} */
export default withNextra({
  output: 'export',
  images: { unoptimized: true },
  basePath: process.env.DOCS_BASE_PATH || '',
  assetPrefix: process.env.DOCS_BASE_PATH
    ? `${process.env.DOCS_BASE_PATH}/`
    : '',
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.tsx',
    },
  },
});
