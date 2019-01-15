// import {Nodes} from "./node";
import { AllNodes } from "./nodes";

export function addNodePosition(yy: any, pos0: any){
    return (callback: any) => {
        let r;
        if(typeof callback == 'function'){
            r = callback(yy);
        }else {
            r = callback;
        }
        r.position = pos0;
        return r;
    }
}

export function o(p: string, a?: string | ((yy: AllNodes) => {}), o?: any): [string, string, any] {
    let action:any = a;
    let patternString = p;
    let options = o;
    let performActionFunctionString = '$$ = $1;';
    if(action){
        if(typeof action == "function"){
            action = action.toString();
            performActionFunctionString = `$$ = yy.addNodePosition(yy,@0)(${action})`
        }else {
            performActionFunctionString = action;
        }
    }

    return [patternString, performActionFunctionString, options]
}
