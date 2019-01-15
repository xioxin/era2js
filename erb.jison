/* lexical grammar */
%lex

%s  GIVEN SIF IF ELSEIF GET_NEW_LINE

%x NOTES BUILT_IN_FUNCTION

%%




\ufeff                  /* 跳过 utf8头 */

/*注释*/
";"(.*)                 return 'NOTES'


<BUILT_IN_FUNCTION,GIVEN,SIF>\n|\r\n    %{
                                console.log('NEWLINE',SIF_FLAG,this.conditionStack)


                                 if(SIF_FLAG){
                                 SIF_FLAG = SIF_FLAG-1;
                                    if(SIF_FLAG == 0){
                                        this.popState();
                                    }
                                 }
                                 console.log('NEWLINE popState2',SIF_FLAG,this.conditionStack)
                                 this.popState()
                                 return 'NEWLINE'
                              %}

<GET_NEW_LINE>\n|\r\n                 %{
                             this.popState()
                             return 'NEWLINE'
                            %}



\n|\r\n                 %{ %}


/*保留方法 todo: 方法分多钟 有的后面全是字符串的 需要分开 */
"RETURN"|"RESETDATA"|"ADDCHARA"|"BEGIN"|"RESTART"|"INPUT"|"FONTBOLD"|"PRINTBUTTON"|"SAVEGLOBAL"|"PRINTFORML"|"RESETCOLOR"|"PRINTFORM"|"PRINTL"|"DRAWLINE"|"CLEARLINE"|"RESETCOLOR"|"ALIGNMENT"|"SETFONT"|"FONTREGULAR" %{
    this.begin('BUILT_IN_FUNCTION');
    return 'BUILT_IN_FUNCTION'
%}








/*内置变量*/
("GAMEBASE_VERSION"|"FIRST"|"LINECOUNT"|"GAMEBASE_TITLE"|"GAMEBASE_AUTHOR"|"CENTER"|"GAMEBASE_YEAR"|"RESULT")  return 'BUILT_IN_VARIABLE'





'"'|"'"          return "QUOTES";



/*变量*/
"LOADGLOBAL"                     return 'LOADGLOBAL'

/* 外部可调用的内部变量 LOCAL、LOCALS */

/*内置数组*/
"LOCALS"|"GLOBAL"                   return 'BUILT_IN_ARRAY'

":"[0-9]+                       return 'ARR'




"=="                        return "=="
">"                         return ">"
"<"                         return "<"
"<="                        return "<="
">="                        return ">="
"!="                        return "!="
"==="                       return "==="


/*字符串变量解析*/
"%"                       return "%"




/*赐值*/
"="                               %{
                                    this.begin('GIVEN');
                                    return 'GIVEN'
                                   %}


/* 算式开始结束标志 */
"{"                                return 'EXPRESSION'
"}"                                return 'EXPRESSION_END'

/* 算数 */
"*"                  return '*'
"/"                  return '/'
"-"                  return '-'
"+"                  return '+'
"^"                  return '^'
"!"                  return '!'
"("                  return '('
")"                  return ')'
'%'                  return '%'




"@"([a-zA-Z_]+)             return "@"


/*用户输入*/
"INPUT"                     return 'INPUT'

"CALL"                     %{
                                return 'CALL'
                            %}



"$PRINT_TITLE"              return '$PRINT_TITLE'
[0-9]+("."[0-9]+)?          return 'NUMBER';
// (" ")+                         return 'SPACE';

[a-zA-Z_]([a-zA-Z0-9_]*)(?=(\s*"("))    return 'RUN_FUNCTION';
","                     return ','



"[IF_DEBUG]" return 'DEBUGIF'
"[ELSE]"     return 'DEBUGELSE'
"[ENDIF]"    return 'DEBUGENDIF'


\s+                     /* skip whitespace */


//流程:仅下一行的判断
"SIF"        %{
             SIF_FLAG = 2;
             SIF_NUM ++;
            console.log('SIF_IN' ,SIF_FLAG ,SIF_NUM)

             this.begin('SIF');
             return 'SIF'
            %}

"IF" %{
 this.begin('IF');
 this.begin('GET_NEW_LINE');
 return 'IF'
 %}
"ELSEIF" %{
 this.popState();
 this.begin('IF');
 this.begin('GET_NEW_LINE');
  return 'ELSEIF' %}
"ELSE" %{ this.popState(); this.begin('IF'); return 'ELSE' %}
"ENDIF" %{ this.popState(); return 'ENDIF' %}




<*><<EOF>>                 return 'EOF'
<*>.                       return 'INVALID'



/lex
/* operator associations and precedence */



%left GIVEN



%start expressions

%% /* language grammar */

expressions
    : codes
        {
        console.log($1);
        return $1;
        }
    ;

code:

    INVALID { $$ = $1 }
    |
    ENTER { $$ = $1 }
    |
    command { $$ = $1 }
    |
    zhushi { $$ = $1 }
    |
    debugifs {$$ = $1 }
    |
    run_function {  $$ = $1 }
    |
    NUMBER {  $$ = $1 }
    |
    given {  $$ = $1 }
    |
    if_group {  $$ = $1 }
    |
    newFuncion { $$ = $1 } /* todo:新建方法需要判断不能在if中 */
    |
    INPUT {  $$ = $1 }
    |
    CALL {  $$ = $1 }
    |
    sif {  $$ = $1 }
    ;

codes:
    code { $$ = $1}
    |
    codes code{ $$ = $1+$2 }
;

/*
blank:
    SPACE {$$ = $1}
    ;

blanks:
    blank {$$ = $1}
    |
    blanks blank {$$ = $1+$2}
    ;


    */

/* 为系统方法增加前缀 */
built_in_function:
    BUILT_IN_FUNCTION { $$ = "sys."+$1 }
;

run_function:
    //自定义方法
    RUN_FUNCTION "(" function_vers ")" NEWLINE {
        $$ = $1 + "(" + $3 +");\n"
    }
    |
    RUN_FUNCTION "(" function_vers ")" {
        $$ = $1 + "(" + $3 +")"
    }
    |
    // 保留方法 没有括号的版本 todo:是否无括号版本只有一个参数
        built_in_function function_ver NEWLINE {
            $$ = $1 + "(" + $2 +");\n"
        }
    |
    // 保留方法 没有括号的版本 todo:是否无括号版本只有一个参数
    built_in_function chas NEWLINE {
        $$ = $1 + "(`" + $2 +"`);\n"
    }
    |
    // 保留方法 有括号的版本
    built_in_function "(" function_vers ")" NEWLINE {
        $$ = $1 + "(" + $3 + ");\n"
    }
    |
    // 没有参数
    built_in_function NEWLINE {
        $$ = $1+"();\n"
    }
;

function_ver:
    var { $$ = $1 }
    |
    string{ $$ = $1 }
    |
    var_in_code{ $$ = $1 }
;

function_vers:
    function_ver { $$ = $1 }
    |
    function_vers ',' function_ver { $$ = $1+$2+$3 }
;



var_in_string:
    '%' var '%' {
        $$ = "${"+$2+"}"
    }
;

var_in_code:
    '%' var '%' {
        $$ = $2
    }
;






command:
RESETCOLOR {$$ = "sys.RESETCOLOR();\n"}
|
"$PRINT_TITLE" {$$ = "sys.$PRINT_TITLE();\n"}
|
CLEARLINE var {$$ = "sys.CLEARLINE("+$2+");\n"}
|
PRINTFORML{
      if($1.length == 10){
          $$ = "sys.PRINTFORML();\n";
      }else{
          $$ = "sys.PRINTFORML(\""+ $1.substring(11,$1.length) +"\");\n"
      }
  }
|
RESETCOLOR{$$ = "sys.RESETCOLOR(\""+ $1.substring(11,$1.length) +"\");\n"}
|
PRINTFORM {$$ = "sys.PRINTFORM(\""+ $1.substring(10,$1.length) +"\");\n"}
|
DRAWLINE { $$ = "sys.DRAWLINE()"; }
|
PRINTL{
    if($1.length == 6){
        $$ = "sys.PRINTL();\n";
    }else{
        $$ = "sys.PRINTL(\""+ $1.substring(7,$1.length) +"\");\n"
    }
}
|
LOADGLOBAL {
    $$ = "sys.LOADGLOBAL();\n";
}

;

/*变量*/
var:
    var_write { $$ = $1 }
    |
    var_readonly { $$ = $1 }
    |
    run_function  { $$ = $1 }
;

/*可写变量*/
var_write:
    LOCALS {
        var v1 = $1.split(':');
        $$ = v1[0]+"["+(v1[1]?v1[1]:0)+"]";
    }
    |
    array { $$ = $1 }
;



/*只读变量*/
var_readonly:
    BUILT_IN_VARIABLE { $$ = "sys." + $1 }
    |
    NUMBER { $$ = $1 }
    |
    string {  $$ = $1 }
    |
    expression { $$ = $1 }
;


/*数组*/
array
:arr { $$ = $1}
;

built_in_array
:BUILT_IN_ARRAY { $$ = $1 }

;

arr
:built_in_array ARR {$$ = $1 +"["+ $2.substring(1) +"]" }
|built_in_array { $$ = $1+"[0]"}
|invalids ARR {$$ = $1 +"["+ $2.substring(1) +"]" }
|arr ARR {$$ = $1 +"["+ $2.substring(1) +"]" }
;


/* 赐值过程 */
given:
    var_write GIVEN expression NEWLINE{
        $$ = $1 + " = " + $3+";\n";
    }
    |
    var_write GIVEN function_ver NEWLINE{
        $$ = $1 + " = " + $3+";\n";
    }
    |
    var_write GIVEN string NEWLINE{
        $$ = $1 + " = " + $3+";\n";
    }
    |
    var_write GIVEN chas NEWLINE{
        $$ = $1 + " = `" + $3+"`;\n";
    }
    |
    var_write GIVEN e NEWLINE{
            $$ = $1 + " = " + $3+";\n";
    }


;

/*等式*/
expression:
    EXPRESSION e EXPRESSION_END {
        $$ = $2;
    }
;

/*   数字优先  | '-' e %prec UMINUS  */

e
    : e '+' e { $$ = $1+$2+$3 }
    | e '-' e { $$ = $1+$2+$3 }
    | e '*' e { $$ = $1+$2+$3 }
    | e '/' e { $$ = $1+$2+$3 }
    | e '^' e { $$ = $1+$2+$3 }
    | e '%' e { $$ = $1+$2+$3 }
    | '!' e   { $$ = $1+$2 }
    | e '%' { $$ = $1+$2 }
    | '(' e { $$ = $1+$2 }
    | e ')' { $$ = $1+$2 }
    | var { $$ = $1 }
    ;


debugifs:
    DEBUGIF codes DEBUGELSE codes DEBUGENDIF
    {
        $$="if(sys.DEBUG){\n"+$2+"\n}else{\n"+$4+"\n}";
    }
    |
    DEBUGIF DEBUGELSE codes DEBUGENDIF
    {
        $$="if(sys.DEBUG){}else{\n"+$3+"\n}\n";
    }
    |
    DEBUGIF codes DEBUGENDIF
    {
        $$="if(sys.DEBUG){\n"+$2+"\n}";
    }
    ;

invalids
    :INVALID { $$ = $1 }
    |invalids INVALID { $$ = $1+$2 }
;


cha:
  INVALID {$$ = $1}
  |
  var_in_string { $$ = $1 }
  |
  expression{$$ = "${" + $1 + "}" /*字符串中解析*/}
  ;

chas:
  cha {$$ = $1}
  |
  chas cha {$$ = $1 + $2}
  ;

string:
    QUOTES chas QUOTES { $$ = "`" + $2 + "`"; }
;


newFuncion
    :
    "@" codes EOF
        {
            $$ = "function "+$1.substring(1,$1.length)+"(){\n"+ $2 +"\n}";
        }
    ;

input:
    INPUT codes EOF
    {
        $$ = "function "+$1.substring(1,$1.length)+"(){\n"+ $2 +"\n}";
    }
    ;

zhushi
    :
    NOTES{
        $$ = "/"+"* "+$1+" *"+"/";
    }
    ;
judgment
    : var "==" var { $$ = $1+$2+$3 }
    | var ">"  var  { $$ = $1+$2+$3 }
    | var "<"  var  { $$ = $1+$2+$3 }
    | var ">=" var { $$ = $1+$2+$3 }
    | var "<=" var { $$ = $1+$2+$3 }
    | var "!=" var { $$ = $1+$2+$3 }
;

sif:
    SIF judgment NEWLINE code NEWLINE { $$ = " if ("+ $2 +"){\n"+$4+"\n}\n" }
    |
    SIF judgment NEWLINE run_function {  $$ = " if ("+ $2 +"){\n"+$4+"\n}\n" }

;





if_group
    :if ENDIF              { $$ = $1  }
    |if else ENDIF         { $$ = $1+$2  }
    |if elseifs ENDIF      { $$ = $1+$2  }
    |if elseifs else ENDIF { $$ = $1+$2+$3 }
;


if
:IF judgment NEWLINE codes  { $$ = "if("+$2+"){\n"+$4+"\n}\n";  }
|IF judgment NEWLINE        { $$ = "if("+$2+"){  }\n";  }  /* if中没有内容 */
;

else
:ELSE codes { $$ = "else{\n"+$2+"\n}\n";  }
|ELSE { $$ = "else{  \n }\n";  }
;

elseifs
: elseif { $$ = $1 }
| elseifs elseif { $$ = $1+$2 }
;


elseif
:ELSEIF judgment NEWLINE codes { $$ = "else if("+$2+"){\n"+$4+"\n}\n";  }
|ELSEIF judgment NEWLINE       { $$ = "else if("+$2+"){   \n   }\n";  }
/* |ELSEIF judgment NEWLINE codes elseif { $$ = "else if("+$2+"){\n"+$4+"\n};\n"+$5;  } */
;


%%
  var SIF_FLAG = 0;
  var SIF_NUM = 0;