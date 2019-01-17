// import {Nodes} from "./node";
import { AllNodes } from './nodes';

(global as any).$$test = [];



export function addNodePosition(yy: any, pos0: any) {
    return (callback: any) => {
        let r;
        if (typeof callback === 'function') {
            r = callback(yy);
        } else {
            r = callback;
        }
        if (r & typeof r === 'object') {
            (r as any).position = pos0;
        }
        (global as any).$$test.push(r);
        return r;
    };
}

export function o(p: string, a?: string | ((yy: AllNodes) => {}), o?: any): [string, string, any] {
    let action: any = a;
    const patternString = p;
    const options = o;
    let performActionFunctionString = '$$ = $1;';
    if (action) {
        if (typeof action === 'function') {
            action = action.toString();
            performActionFunctionString = `$$ = yy.addNodePosition(yy,@0)(${action})`;
        } else {
            performActionFunctionString = action;
        }
    }

    return [patternString, performActionFunctionString, options];
}

export function r(s: string[] = [], p: string, a?: string | ((self: any) => any )): [string[], string, string] | [string, string] {
    let action: any = a;
    let performActionFunctionString = '/* skip whitespace */';
    if (action) {
        if (typeof action === 'function') {
            action = action.toString();
            performActionFunctionString = `return (${action})(this)`;
        } else {
            performActionFunctionString = `return '${action}'`;
        }
    }
    console.log('s.length', s);
    if(s.length){
        return [s , p, performActionFunctionString ];
    }else {
        return [p, performActionFunctionString];
    }
}
