import assert from 'node:assert/strict';
import test from 'node:test';

import {
  catalogFiltersFromSearchParams,
  catalogSearchParamsWithFilters,
  withCatalogFilter,
} from '../utils/catalogFilters.ts';

test('star rating selections remain numeric through URL synchronization', () => {
  const selectedFilters = withCatalogFilter({}, 'rating_min', 4);
  const parameters = catalogSearchParamsWithFilters(
    new URLSearchParams('page=3&q=architecture'),
    selectedFilters,
  );

  assert.equal(parameters.get('page'), null);
  assert.equal(parameters.get('q'), 'architecture');
  assert.equal(parameters.get('rating_min'), '4');

  const synchronizedFilters = catalogFiltersFromSearchParams(parameters);
  assert.equal(synchronizedFilters.rating_min, 4);
  assert.equal(typeof synchronizedFilters.rating_min, 'number');
});

test('selecting the active star rating clears that filter', () => {
  assert.deepEqual(withCatalogFilter({ rating_min: 5 }, 'rating_min', 5), {});
});
