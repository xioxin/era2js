export class BinaryExpression {
    type = 'BinaryExpression';
    constructor(
        public operator: string,
        public left: any,
        public right: any,
    ) {}
}

export class UnaryExpression {
    type = 'UnaryExpression';
    constructor(
        public operator: string,
        public argument: any
    ) {}
}

export class ExpressionStatement {
    type = 'ExpressionStatement'
    constructor(
        public expression: any,
    ) {}
}

export class Literal {
    type = "Literal";
    constructor(
        public value: any,
    ) {}
}



export class FunctionDeclaration {
    type = "FunctionDeclaration";
    constructor(
        public id: any,
        public params: (Identifier|AssignmentPattern)[],
        public body: BlockStatement,
    ){}
}

export class AssignmentPattern {
    type = "AssignmentPattern";
    constructor (
       public left: Identifier,
       public right: any,
    ){}
}

export class Program {
    type = "Program";
    constructor(
        public body: any[],
    ){}
}
export class BlockStatement {
    type = "BlockStatement";
    constructor(
        public body: any[],
    ){}
}


export class VariableDeclaration {
    type = "VariableDeclaration";
    constructor(
        public kind: string,
        public declarations: any[],
    ){}
}

export class VariableDeclarator {
    type = "VariableDeclarator";
    constructor(
        public id: any,
        public init: any
    ){}
}

export class Identifier {
    type = "Identifier";
    constructor(
        public name: any,
    ){}
}

export interface Nodes {
    BinaryExpression: typeof BinaryExpression,
    UnaryExpression: typeof UnaryExpression,
    ExpressionStatement: typeof ExpressionStatement,
    Literal: typeof Literal
};
