type argtype<T> = T extends (...arg: infer R) => any ? R : never;

export default class SuspenseResource<
  T,
  R extends (...arg: any) => Promise<T> = (...arg: any[]) => Promise<T>,
> {
  constructor(
    resourceFetcher: R,
    defaultData: T,
    ...arg: argtype<typeof resourceFetcher>
  ) {
    this.resouseFetcher = resourceFetcher;
    this.data = defaultData;
    this.promise = new Promise<void>((resolve) => {
      resolve();
    });
    this.setFetcher(...arg);
  }

  read(): T {
    switch (this.stat) {
      case "pending":
        console.log("pending");
        throw this.promise as unknown as Error;
      case "fullfilled":
        console.log("fullfilled");
        return this.data;
      case "rejected":
        return this.data;
    }
  }

  reload(...arg: argtype<R>): void {
    console.log("set stat to pending");
    this.stat = "pending";
    this.setFetcher(...arg);
  }

  private setFetcher(...arg: argtype<R>): void {
    this.promise = this.resouseFetcher(...arg)
      .then((data) => {
        this.data = data;
        this.stat = "fullfilled";
      })
      .catch(() => {
        this.stat = "rejected";
      });
  }

  private stat: "pending" | "fullfilled" | "rejected" = "pending";
  private data: T;
  private readonly resouseFetcher: (...arg: argtype<R>) => Promise<T>;
  private promise: Promise<void>;
}
