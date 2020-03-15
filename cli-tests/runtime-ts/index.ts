// Use some TypeScript-specific syntax in this file to make sure TypeScript gets compiled..
// Make sure the syntax isn't also parseable as Flow.
type Idk<T> = T extends string ? number : string;

console.log("hi");

export {};
