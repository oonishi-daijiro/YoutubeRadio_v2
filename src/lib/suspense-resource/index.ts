export default class SuspenseResource<T extends (...arg: any) => Promise<any>> {
  constructor(resourceFetcher: T, defaultData: Awaited<ReturnType<T>>) {
    this.resouseFetcher = resourceFetcher;
    this.data = defaultData;
    this.promise = new Promise<void>((resolve) => {
      resolve();
    });
  }

  read(...arg: Parameters<T>): Awaited<ReturnType<T>> {
    this.setupPromise(...arg);
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

  reload(...arg: Parameters<T>): void {
    console.log("set stat to pending");
    this.stat = "pending";
    this.disPromiseSetup = false;
    this.setupPromise(...arg);
  }

  private setupPromise(...arg: Parameters<T>): void {
    if (!this.disPromiseSetup) {
      this.promise = this.resouseFetcher(...arg)
        .then((data) => {
          this.data = data;
          this.stat = "fullfilled";
        })
        .catch(() => {
          this.stat = "rejected";
        });
      this.disPromiseSetup = true;
    }
  }

  private stat: "pending" | "fullfilled" | "rejected" = "pending";

  private disPromiseSetup = false;

  private data: Awaited<ReturnType<T>>;

  private readonly resouseFetcher: (...arg: Parameters<T>) => Promise<any>;

  private promise: Promise<void>;
}
