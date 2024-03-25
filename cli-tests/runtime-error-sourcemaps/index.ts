type Something = 5;

class Whatever<
  A,
  B, // comment to make this take up multiple lines
  C
> {
  constructor() {
    this.someMethod();
  }

  someMethod() {
    this.anotherMethod();
  }

  anotherMethod() {
    this.someOtherThirdThing();
  }

  someOtherThirdThing() {
    const err = new Error("uh oh spongebob");
    // @ts-ignore
    err.someProperty = 65;
    throw err;
  }
}

const whatever = new Whatever();
