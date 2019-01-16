const fs = require('fs');
const escodegen = require('escodegen');


let jsonText = fs.readFileSync('./labelDicT.json', {encoding: 'utf-8'});

const labelDic = JSON.parse(jsonText);

const map = new Map();

function forDic(dic) {

  if(dic && dic.$type){
    dic.$type = dic.$type.split(',')[0];
  }
  if(dic && dic.$id){
    map[dic.$id] = dic;
  }
  for(let key in dic){
    if(typeof dic[key] == 'object'){
      forDic(dic[key]);
    }
  }
}


function forDic2(dic) {
  for(let key in dic){
    if(dic[key] && typeof dic[key] == 'object'){
      if(dic[key].$ref){
        dic[key] = map[dic[key].$ref];
      } else {
        forDic2(dic[key])
      }
    }
  }
}

forDic(labelDic);
forDic2(labelDic);

global.labelDic = labelDic;


console.log(labelDic);


/*labelDic.labelAtDic.prinT_TITLE.$values[0]*/
function flat(dic){

  const flatArr = [];
  const flat2 = (dic2) => {
    flatArr.push(dic2);
    if(dic2 && dic2.nextLine){
      flat2(dic2.nextLine);
    }
  }
  flat2(dic);
  return flatArr;
}
global.flat = flat;

const flatArr = flat(labelDic.labelAtDic.systeM_TITLE.$values[0]);


const printLabelName = global.printLabelName = (labelArr) => {
  labelArr.forEach((v, i) => {
    if(v.labelName){
      console.log(i, v.labelName)
    }
    if(v.function && v.function.name){
      console.log(i, v.function.name)
    }
  })
}
console.log('flat', flatArr);


const program = {
  "type": "Program",
  "body": [
  {
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "Identifier",
        "name": "PRINT_TITLE"
      },
      "arguments": [
        {
          "type": "Identifier",
          "name": "aaa"
        },
        {
          "type": "Literal",
          "value": "000000000000000000000555440000",
          "raw": "\"000000000000000000000555440000\""
        }
      ]
    }
  }
],
  "sourceType": "script"
}







/* flat(labelDic.labelAtDic.systeM_TITLE.$values[0]) */
