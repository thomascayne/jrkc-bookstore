import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { createElement } from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

// Load the actual server module without Next's server-only marker or network access.
// TypeScript handles the same type-only imports and aliases used by the application.
function loadTypeScript(relativePath, imports = {}, globals = {}) {
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(
    readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  runInNewContext(source, {
    AbortSignal,
    URL,
    exports: loadedModule.exports,
    module: loadedModule,
    require(name) {
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    },
    ...globals,
  });
  return loadedModule.exports;
}

const catalogImports = {
  'server-only': {},
  '@/utils/bookCategories': loadTypeScript('utils/bookCategories.ts'),
  '@/utils/catalogFilters': loadTypeScript('utils/catalogFilters.ts'),
  '@/utils/googleBooks': loadTypeScript(
    'utils/googleBooks.ts',
    {},
    {
      process: { env: {} },
    },
  ),
};

function volume(id, categories) {
  return {
    id,
    volumeInfo: {
      categories,
      title: 'The Psychology of Historical Research',
    },
  };
}

function success(items = [], totalItems = items.length) {
  return { status: 200, body: { items, totalItems } };
}

function loadCatalog(context, responses) {
  const requests = [];
  context.after(() => assert.equal(requests.length, responses.length));
  const catalog = loadTypeScript('catalog/google-books.ts', catalogImports, {
    async fetch(request) {
      const response = responses[requests.length];
      requests.push(new URL(request));
      assert.ok(response, 'Unexpected additional provider request');
      return new Response(JSON.stringify(response.body ?? {}), {
        status: response.status,
      });
    },
  });
  return { ...catalog, requests };
}

const psychologyFilters = { categoryKey: 'psychology', page: 1, pageSize: 24 };

test('broader results retain their actual categories and disclose the broader search', async (context) => {
  const catalog = loadCatalog(context, [
    success(),
    success([volume('history', ['History'])]),
  ]);
  const result = await catalog.fetchGoogleCatalog(psychologyFilters);

  assert.equal(result.relatedSearch, true);
  assert.equal(result.books[0].category.key, 'history');
  assert.equal(result.books[0].category_label_check, 'History');
  assert.equal(result.books[0].section, 'History');
  assert.deepEqual(
    catalog.requests.map((request) => request.searchParams.get('q')),
    ['subject:psychology', 'psychology'],
  );
});

test('subject matches remain category results without overwriting provider metadata', async (context) => {
  const catalog = loadCatalog(context, [
    success([volume('psychology', ['Psychology', 'History'])]),
  ]);
  const result = await catalog.fetchGoogleCatalog(psychologyFilters);

  assert.equal(result.relatedSearch, false);
  assert.equal(result.books[0].category.key, 'psychology');
  assert.equal(result.books[0].category_label_check, 'Psychology, History');
});

test('unknown and missing categories are not invented from the requested category', async (context) => {
  const catalog = loadCatalog(context, [
    success(),
    success([volume('unknown', ['Archival methods']), volume('missing')]),
  ]);
  const result = await catalog.fetchGoogleCatalog(psychologyFilters);
  const unknown = result.books.find((book) => book.id === 'unknown');
  const missing = result.books.find((book) => book.id === 'missing');

  assert.equal(unknown.category, null);
  assert.equal(unknown.categoryId, 0);
  assert.equal(unknown.category_label_check, 'Archival methods');
  assert.equal(missing.category, null);
  assert.equal(missing.category_label_check, '');
});

test('specific categories do not collapse into Art or Fiction substring matches', async (context) => {
  const catalog = loadCatalog(context, [
    success([
      volume('performing', ['Performing Arts']),
      volume('juvenile', ['Juvenile Nonfiction']),
      volume('fiction', ['Juvenile Fiction']),
    ]),
  ]);
  const result = await catalog.fetchGoogleCatalog({ page: 1, pageSize: 24 });
  const byId = new Map(
    result.books.map((book) => [book.id, book.category.key]),
  );

  assert.equal(byId.get('performing'), 'performing-arts');
  assert.equal(byId.get('juvenile'), 'juvenile-nonfiction');
  assert.equal(byId.get('fiction'), 'juvenile-fiction');
});

test('book details preserve an unmapped provider category', async (context) => {
  const catalog = loadCatalog(context, [
    { status: 200, body: volume('archive', ['Archival methods']) },
  ]);
  const book = await catalog.fetchGoogleBook('archive');
  assert.equal(book.category, null);
  assert.equal(book.category_label_check, 'Archival methods');
});

test('a successful empty response supersedes an earlier provider failure', async (context) => {
  const catalog = loadCatalog(context, [{ status: 503 }, success(), success()]);
  const result = await catalog.fetchGoogleCatalog(psychologyFilters);

  assert.equal(result.totalBooks, 0);
  assert.equal(result.books.length, 0);
});

test('an optional later query failure does not invalidate an earlier empty response', async (context) => {
  const catalog = loadCatalog(context, [
    success(),
    { status: 503 },
    { status: 503 },
  ]);
  const result = await catalog.fetchGoogleCatalog(psychologyFilters);
  assert.equal(result.totalBooks, 0);
});

test('all failed requests still report a provider outage', async (context) => {
  const catalog = loadCatalog(context, [
    { status: 503 },
    { status: 503 },
    { status: 503 },
  ]);
  await assert.rejects(
    catalog.fetchGoogleCatalog(psychologyFilters),
    /HTTP 503/,
  );
});

test('the label alternative retains author and search constraints', async (context) => {
  const catalog = loadCatalog(context, [
    success(),
    { status: 503 },
    success([volume('history', ['History'])]),
  ]);
  const result = await catalog.fetchGoogleCatalog({
    categoryKey: 'juvenile-nonfiction',
    page: 1,
    pageSize: 24,
    author: 'Smith',
    search: 'astronomy',
  });

  assert.equal(result.relatedSearch, true);
  assert.equal(
    catalog.requests[2].searchParams.get('q'),
    'astronomy inauthor:Smith Juvenile Non-Fiction',
  );
  assert.equal(result.books[0].category.key, 'history');
});

test('remaining batches use the successful broader query and preserve category labels', async (context) => {
  const catalog = loadCatalog(context, [
    success(),
    success([volume('history', ['History'])], 80),
    success([volume('law', ['Law'])]),
  ]);
  const result = await catalog.fetchGoogleCatalog(psychologyFilters);

  assert.equal(catalog.requests[2].searchParams.get('q'), 'psychology');
  assert.equal(catalog.requests[2].searchParams.get('startIndex'), '40');
  assert.equal(result.relatedSearch, true);
  assert.equal(result.totalBooks, 2);
  assert.equal(
    result.books.find((book) => book.id === 'law').category.key,
    'law',
  );
});

const { default: CatalogResultSummary } = loadTypeScript(
  'components/CatalogResultSummary.tsx',
  {
    'react/jsx-runtime': jsxRuntime,
  },
);

test('broader category results are visibly distinguished from confirmed category matches', () => {
  const markup = renderToStaticMarkup(
    createElement(CatalogResultSummary, {
      categoryLabel: 'Psychology',
      relatedSearch: true,
      totalBooks: 1,
    }),
  );
  assert.match(markup, /Related results for Psychology/);
  assert.match(markup, /may belong to other categories/);
  assert.doesNotMatch(markup, /in this category/);
});

test('exact category and all-books summaries do not announce a broader search', () => {
  const exact = renderToStaticMarkup(
    createElement(CatalogResultSummary, {
      categoryLabel: 'Psychology',
      relatedSearch: false,
      totalBooks: 1,
    }),
  );
  const all = renderToStaticMarkup(
    createElement(CatalogResultSummary, { totalBooks: 2 }),
  );
  assert.match(exact, /1 book in this category/);
  assert.doesNotMatch(exact, /Related results/);
  assert.doesNotMatch(all, /in this category|Related results/);
});
