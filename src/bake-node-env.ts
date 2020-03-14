import * as t from "@babel/types";
import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

export default function bakeNodeEnv(code: string, env: string): string {
  const ast = parser.parse(code);
  traverse(ast, {
    MemberExpression(nodePath) {
      const { node } = nodePath;

      if (
        t.isMemberExpression(node.object) &&
        t.isIdentifier(node.object.object) &&
        node.object.object.name === "process" &&
        t.isIdentifier(node.object.property) &&
        node.object.property.name === "env" &&
        t.isIdentifier(node.property) &&
        node.property.name === "NODE_ENV"
      ) {
        nodePath.replaceWith(t.stringLiteral(env));
      }
    },
  });

  return generate(ast).code || code;
}