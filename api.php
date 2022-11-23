<?php

//DBがなかったら作成
if (file_exists('api.db')===FALSE) {
    makeMockDb();
}

//通常処理
main();

function main() {
    $formalParam=array();//正式なパラメータ格納用
    
    /* パラメータ取得処理
     * [param] URLをパラメータとして処理する
     * 0:空白
     * 1:api固定
     * 2:コレクション名
     * 3:ID
     *
     * [qparam] ?以降で取得されるもの
     * name: 検索時の名前
     */
    
    //?以降を取得する
    $qparamLine = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
    
    //?の位置を取得して存在すればそれ以前をアドレスとする。
    $intQ = strpos($_SERVER['REQUEST_URI'],'?');
    if ($intQ === FALSE) {
        $params =explode('/',$_SERVER['REQUEST_URI']);
    } else {
        $params =explode('/',substr($_SERVER['REQUEST_URI'],0,$intQ-1));
    }
    
    //ゆるいアドレスチェック
    if (count($params) < 3) {
        makeResultError();
    }
    
    $formalParam['collection']=$params[2];//コレクション名　この例では使っていません。
    $formalParam['id']=-1;
    $formalParam['search']="";
    
    //検索用パラメータ取得
    parse_str($qparamLine, $qparams);
    if (isset($qparams['name'])) {
        $formalParam['search'] = $qparams['name'];
    }
    
    //32bit環境でもエラーにならないように9桁までの制限をしています。
    if (isset($params[3])) {
        if (preg_match('/^[0-9]{1,9}$/',$params[3])===1) {
            $formalParam['id']=intval($params[3]);
        } else {
            //idが存在してルール外だったらエラー(空白のみ許可)
            if ($params[3]!='') {
                makeResultError();
            }
        }
    }
    
    //メソッド別の処理
    switch(strtolower($_SERVER['REQUEST_METHOD'])) {
        case 'put':
            //更新
            $json = json_decode(file_get_contents('php://input'),TRUE);
            if (isset($json['id']) && isset($json['name'])) {
                put($json['id'],$json['name']);
            }
            break;
        case 'delete':
            //削除　アドレスからIDを取得する
            if ($formalParam['id'] < 0) {
                makeResultIdName(0,"error");
            } else {
                delete($formalParam['id']);
            }
            break;
        case 'post':
            //新規
            
            if (isset($_POST['json']) == FALSE) {
                makeResultError();
            }
            $json = json_decode($_POST['json'],TRUE);
            
            if (isset($json['name'])) {
                post($json['name']);
            } else {
                makeResultError();
            }
            
            break;
        case 'get':
            //取得
            get($formalParam['id'],$formalParam['search']);
            break;
        case 'options':
            //プリフライトリクエストに対してダミーデータを返す
            //404を返すとプリフライトリクエストがエラーで終了するため
            makeResultIdName(0,'dummy');
            break;
        default:
            makeResultError();
    }
}

function delete($id) {
    //削除して削除したデータを返す
    $data = readDb();
    for ($i = 0; $i < count($data); $i++) {
        if ($data[$i]['id']==$id) {
            $dname = $data[$i]['name'];
            array_splice($data,$i,1);
            writeDb($data);
            makeResultIdName($id,$dname);
        }
    }
    
    makeResultIdName(0,"error");
}

function post($name) {
    //登録して登録したデータを返す
    $data = readDb();
    $intMax = 0;
    for ($i = 0; $i < count($data); $i++) {
        if ($intMax < $data[$i]['id']) {
            $intMax = $data[$i]['id'];
        }
    }
    
    $add=array();
    $add['id']=$intMax+1;
    $add['name']=$name;
    
    $data[]=$add;
    writeDb($data);
    makeResultIdName($add['id'],$add['name']);
}

function put($id,$name) {
    //更新して更新したデータを返す
    $data = readDb();
    for ($i = 0; $i < count($data); $i++) {
        if ($data[$i]['id']==$id) {
            $data[$i]['name']=$name;
            writeDb($data);
            makeResultIdName($data[$i]['id'],$data[$i]['name']);
        }
    }
    
    makeResultIdName(0,"error");
}

function get($id,$search) {
    //表示
    $data = readDb();
    
    if ($search==='') {
        if ($id < 0) {
            //全件表示
            makeResult($data);
        } else {
            //id指定表示
            for ($i = 0; $i < count($data); $i++) {
                if ($data[$i]['id']==$id) {
                    makeResult($data[$i]);
                }
            }
            
            echo makeResultIdName(0,"error");
            exit;
        }
    } else {
        //検索モード
        $ret = array();
        for ($i = 0; $i < count($data); $i++) {
            if (mb_strpos($data[$i]['name'],$search) !== FALSE) {
                $ret[] = array('id' => $data[$i]['id'],'name' => $data[$i]['name']);
            }
        }
        
        makeResult($ret);
    }
}

function makeResultError() {
    //エラーを返して終了
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
    header('Access-Control-Allow-Methods: GET, HEAD, POST, DELETE, PUT, OPTIONS');
    header("HTTP/1.1 404 Not Found");
    exit;
}

function makeResultIdName($id,$name) {
    //結果を返して終了
    $array = array();
    $array['id']=$id;
    $array['name']=$name;
    
    makeResult($array);
}

function makeResult($array) {
    //結果を返して終了
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
    header('Access-Control-Allow-Methods: GET, HEAD, POST, DELETE, PUT,OPTIONS');
    echo json_encode($array);
    exit;
}

function readDb() {
    //DBから一覧取得
    return json_decode(file_get_contents("api.db"),TRUE);
}

function writeDb($data) {
    //DBに反映
    file_put_contents("api.db",json_encode($data));
}

function makeMockDb() {
    //テスト用DB作成
    $mock= array (
        array('id'=>101,'name'=>'徳川'),
        array('id'=>102,'name'=>'豊臣'),
        array('id'=>103,'name'=>'織田'),
        array('id'=>104,'name'=>'宮本'),
        array('id'=>105,'name'=>'武田'),
        array('id'=>106,'name'=>'佐々木'),
        array('id'=>107,'name'=>'坂田'),
        array('id'=>108,'name'=>'渡辺'),
    );
    
    file_put_contents("api.db",json_encode($mock));
}