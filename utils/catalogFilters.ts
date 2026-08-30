export type CatalogSortBy = 'average_rating' | 'discount_percentage' | 'price';

export type CatalogSortOrder = 'ASC' | 'DESC';

export interface FilterOptions {
  author?: string;
  discount_percentage_min?: number;
  in_stock?: boolean;
  price?: { max?: number; min?: number };
  rating_min?: number;
  ratings_count_min?: number;
  sort_by?: CatalogSortBy;
  sort_order?: CatalogSortOrder;
}

export interface ExactRatingRange {
  maximumExclusive?: number;
  minimum: number;
}

const catalogFilterParameterNames = [
  'author',
  'discount_percentage_min',
  'in_stock',
  'price',
  'rating_min',
  'ratings_count_min',
  'sort_by',
  'sort_order',
] as const;

function finiteNumber(value: string | null) {
  if (value === null || value.trim() === '') return undefined;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function isCatalogSortBy(value: string | null): value is CatalogSortBy {
  return (
    value === 'average_rating' ||
    value === 'discount_percentage' ||
    value === 'price'
  );
}

function isCatalogSortOrder(value: string | null): value is CatalogSortOrder {
  return value === 'ASC' || value === 'DESC';
}

export function exactRatingRange(
  selectedRating: number | null | undefined,
): ExactRatingRange | null {
  if (
    selectedRating === null ||
    selectedRating === undefined ||
    !Number.isInteger(selectedRating) ||
    selectedRating < 1 ||
    selectedRating > 5
  ) {
    return null;
  }

  return selectedRating === 5
    ? { minimum: selectedRating }
    : { maximumExclusive: selectedRating + 1, minimum: selectedRating };
}

export function matchesExactRating(
  bookRating: number,
  selectedRating: number | null | undefined,
) {
  const range = exactRatingRange(selectedRating);
  if (!range) return true;
  return (
    bookRating >= range.minimum &&
    (range.maximumExclusive === undefined ||
      bookRating < range.maximumExclusive)
  );
}

export function catalogFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'> | null,
): FilterOptions {
  if (!searchParams) return {};

  const filters: FilterOptions = {};
  const author = searchParams.get('author')?.trim();
  const discountMinimum = finiteNumber(
    searchParams.get('discount_percentage_min'),
  );
  const priceValues = searchParams.get('price')?.split(',') ?? [];
  const priceMinimum = finiteNumber(priceValues[0] ?? null);
  const priceMaximum = finiteNumber(priceValues[1] ?? null);
  const ratingMinimum = finiteNumber(searchParams.get('rating_min'));
  const ratingsCountMinimum = finiteNumber(
    searchParams.get('ratings_count_min'),
  );
  const sortBy = searchParams.get('sort_by');
  const sortOrder = searchParams.get('sort_order');

  if (author) filters.author = author;
  if (discountMinimum !== undefined && discountMinimum >= 0) {
    filters.discount_percentage_min = discountMinimum;
  }
  if (searchParams.get('in_stock') === 'true') filters.in_stock = true;
  if (priceMinimum !== undefined || priceMaximum !== undefined) {
    filters.price = {
      max: priceMaximum,
      min: priceMinimum,
    };
  }
  if (exactRatingRange(ratingMinimum)) {
    filters.rating_min = ratingMinimum;
  }
  if (ratingsCountMinimum !== undefined && ratingsCountMinimum >= 0) {
    filters.ratings_count_min = ratingsCountMinimum;
  }
  if (isCatalogSortBy(sortBy)) filters.sort_by = sortBy;
  if (isCatalogSortOrder(sortOrder)) filters.sort_order = sortOrder;

  return filters;
}

export function catalogSearchParamsWithFilters(
  currentSearchParams: Pick<URLSearchParams, 'entries'> | null,
  filters: FilterOptions,
) {
  const parameters = new URLSearchParams(
    currentSearchParams ? Array.from(currentSearchParams.entries()) : [],
  );

  for (const parameterName of catalogFilterParameterNames) {
    parameters.delete(parameterName);
  }
  parameters.delete('page');

  if (filters.author) parameters.set('author', filters.author);
  if (filters.discount_percentage_min !== undefined) {
    parameters.set(
      'discount_percentage_min',
      String(filters.discount_percentage_min),
    );
  }
  if (filters.in_stock) parameters.set('in_stock', 'true');
  if (filters.price) {
    parameters.set(
      'price',
      `${filters.price.min ?? ''},${filters.price.max ?? ''}`,
    );
  }
  if (filters.rating_min !== undefined) {
    parameters.set('rating_min', String(filters.rating_min));
  }
  if (filters.ratings_count_min !== undefined) {
    parameters.set('ratings_count_min', String(filters.ratings_count_min));
  }
  if (filters.sort_by) parameters.set('sort_by', filters.sort_by);
  if (filters.sort_order) parameters.set('sort_order', filters.sort_order);

  return parameters;
}

export function catalogUrl(pathname: string, parameters: URLSearchParams) {
  const query = parameters.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function positivePageNumber(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function withCatalogFilter<Key extends keyof FilterOptions>(
  currentFilters: FilterOptions,
  filterName: Key,
  value: FilterOptions[Key],
) {
  const filters = { ...currentFilters };

  if (filterName === 'price') {
    filters.price = value as FilterOptions['price'];
    return filters;
  }

  if (filterName === 'sort_by' || filterName === 'sort_order') {
    Object.assign(filters, { [filterName]: value });
    return filters;
  }

  if (currentFilters[filterName] === value) {
    delete filters[filterName];
  } else {
    Object.assign(filters, { [filterName]: value });
  }

  return filters;
}
