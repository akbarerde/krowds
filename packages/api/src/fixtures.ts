export const FRONTEND_FIXTURE_SOURCE = "frontend-fixture" as const;

export type FrontendFixtureMode = "development" | "test";
export type FrontendFixtureKey<TFixtures extends object> = Extract<
  keyof TFixtures,
  string
>;

export interface FrontendFixtureClient<TFixtures extends object> {
  readonly mode: FrontendFixtureMode;
  readonly source: typeof FRONTEND_FIXTURE_SOURCE;
  get<K extends FrontendFixtureKey<TFixtures>>(
    key: K,
  ): Promise<TFixtures[K]>;
}

export interface FrontendFixtureOptions<TFixtures extends object> {
  fixtures: TFixtures;
  mode: FrontendFixtureMode;
}

/**
 * Creates a read-only, frontend-only fixture source. It performs no network
 * request and is not a KrowdsApiClient or a backend authority.
 */
export function createFrontendFixtureClient<TFixtures extends object>({
  fixtures,
  mode,
}: FrontendFixtureOptions<TFixtures>): FrontendFixtureClient<TFixtures> {
  const snapshot = Object.freeze({ ...fixtures });

  return Object.freeze({
    mode,
    source: FRONTEND_FIXTURE_SOURCE,
    async get<K extends FrontendFixtureKey<TFixtures>>(key: K) {
      if (!Object.hasOwn(snapshot, key)) {
        throw new RangeError(`No frontend fixture is registered for "${key}".`);
      }

      return snapshot[key];
    },
  });
}
