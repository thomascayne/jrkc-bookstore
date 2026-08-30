import assert from 'node:assert/strict';
import test from 'node:test';

import {
  catalogFiltersFromSearchParams,
  catalogSearchParamsWithFilters,
  exactRatingRange,
  matchesExactRating,
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

test('customer rating selections use exact star buckets', () => {
  assert.deepEqual(exactRatingRange(1), {
    maximumExclusive: 2,
    minimum: 1,
  });
  assert.deepEqual(exactRatingRange(5), { minimum: 5 });
  assert.equal(matchesExactRating(1.5, 1), true);
  assert.equal(matchesExactRating(3, 1), false);
  assert.equal(matchesExactRating(5, 1), false);
  assert.equal(matchesExactRating(2, 2), true);
  assert.equal(matchesExactRating(2.5, 2), true);
  assert.equal(matchesExactRating(3, 2), false);
  assert.equal(matchesExactRating(5, 5), true);
  assert.equal(matchesExactRating(4.5, 5), false);
});

test('invalid customer ratings are discarded during URL synchronization', () => {
  assert.deepEqual(
    catalogFiltersFromSearchParams(new URLSearchParams('rating_min=6')),
    {},
  );
  assert.deepEqual(
    catalogFiltersFromSearchParams(new URLSearchParams('rating_min=2.5')),
    {},
  );
});
