import {
  StoreApi,
  StoreMutatorIdentifier,
  StoreMutators,
} from "zustand/vanilla";

type ExtractType<O, T> = { [K in keyof O]: O[K] extends T ? O[K] : unknown };
type Diff<T extends string, U, F> = ({ [P in T]: P } & {
  [P in keyof U]: U[P] extends F ? string : never;
} & {
  [x: string]: never;
})[T];
type ExtractTargetKey<T, O> = Diff<
  Extract<keyof O, string>,
  ExtractType<O, T>,
  T
>;
type Write<T, U> = Omit<T, keyof U> & U;
type WithSelectorSubscribe<S> = S extends {
  getState: () => infer T;
}
  ? Write<S, StoreSubscribeWithSelector<T>>
  : never;
type StoreSubscribeWithSelector<T> = {
  subscribe: {
    (
      listener: (selectedState: T, previousSelectedState: T) => void
    ): () => void;
    <U>(
      selector: (state: T) => U,
      listener: (selectedState: U, previousSelectedState: U) => void,
      options?: {
        equalityFn?: (a: U, b: U) => boolean;
        fireImmediately?: boolean;
      }
    ): () => void;
  };
  setState: {
    _(
      partial:
        | T
        | Partial<T>
        | {
            _(state: T): T | Partial<T> | void;
          }["_"],
      replace?: boolean | undefined
    ): void;
  }["_"];
};

type Get<T, K, F> = K extends keyof T ? T[K] : F;
export type Mutate<S, Ms> = number extends Ms["length" & keyof Ms]
  ? S
  : Ms extends []
  ? S
  : Ms extends [[infer Mi, infer Ma], ...infer Mrs]
  ? Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
  : never;
export type StateCreator<
  T,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  U = T
> = ((
  setState: Get<
    Mutate<WithSelectorSubscribe<StoreApi<T>>, Mis>,
    "setState",
    never
  >,
  getState: Get<Mutate<StoreApi<T>, Mis>, "getState", never>,
  store: Mutate<StoreApi<T>, Mis>
) => U) & {
  $$storeMutators?: Mos;
};
