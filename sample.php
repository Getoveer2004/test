<?php
try {
    
    $startDate = $_REQUEST['startDate'];
    $endDate = $_REQUEST['endDate'];
    
//     $json = json_decode($requestData,TRUE);
    
//     $startDate = $json['startDate'];
//     $endDate = $json['endDate'];
    
    // 接続処理
    $dsn = 'mysql:host=localhost;dbname=worldcup2014';
    $user = 'root';
    $password = '1234';
    $dbh = new PDO($dsn, $user, $password);
    
    
    $sql = <<<EOM
            SELECT
                p.id AS playerId
                , p.name AS playerName
                , c.name AS countryName
                , p.club
                , p.position
                , p.uniform_num AS uniformNum
                , p.birth
                , p.height
                , p.weight
            FROM
                players p JOIN countries c
                    ON p.country_id = c.id
            WHERE
                1 = 1
        EOM;
    
    
//     // 入力された検索したい名前を取得
//     $playerName = isset($_GET['playerName']) ? $_GET['playerName'] : '';
//     $bindPlayerName = '%'.$playerName.'%';
    
//     // チェックされたポジションを取得。pdo_in.phpと異なりチェックがない場合は配列が空。
//     $positions = array();
//     if (isset($_GET['positions'])) {
//         $sql .= " AND p.position IN (%s)"; // チェックされている場合だけ、IN条件を追加
//         $positions = $_GET['positions'];
        
//         // 配列の要素の数だけIN内の?をカンマ区切りで生成し%s部分をprintf関数で置換
//         $sql = sprintf($sql, substr(str_repeat(',?', count($positions)), 1));
//     }
    
    $stmt_params = array();
    if (isset($startDate) && $endDate != '') {
        $sql .= " AND birth >= ? AND birth < ? ";
        array_push($stmt_params, $startDate);
        array_push($stmt_params, $endDate);
    }
    
    
    $stmt = $dbh->prepare($sql);
    pdo_stmt_bind_values($stmt, $stmt_params);
    
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_OBJ); // 全てのレコードを取得
    
    // DEBUG OUTPUT
     //preg_match('/(?<=Sent SQL:).*?(?=Params:)/s', pdo_debugStrParams($stmt), $matches);
     //echo $matches[0].'<br />';
    
    // 接続切断
    $dbh = null;
    
    makeResult($rows);
    
} catch (PDOException $e) {
    print $e->getMessage() . "<br/>";
    die();
}

function makeResult($array) {
    //結果を返して終了
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
    header('Access-Control-Allow-Methods: GET, HEAD, POST, DELETE, PUT,OPTIONS');
    echo json_encode($array);
    exit;
}

function pdo_debugStrParams($s) {
    ob_start();
    $s->debugDumpParams();
    $r = ob_get_contents();
    ob_end_clean();
    return $r;
}

function pdo_stmt_bind_values($stmt, $stmt_params) {
    foreach ($stmt_params as $index => $param) {
        if (is_array($param)) {
            // 配列であれば、値とdata_typeがセットされていたとして扱う
            if (!array_key_exists('value', $param)) {
                // valueが設定されていなければ処理中断
                return false;
            }
            if (array_key_exists('name', $param)) {
                // nameが指定されていれば「:name」形式
                if (is_null($param['value'])) {
                    // 値がNULLなら、data_typeに明示的にNULLを指定
                    $stmt->bindValue($param['name'], $param['value'], PDO::PARAM_NULL);
                } elseif (array_key_exists('type', $param)) {
                    // data_typeが指定されていたなら指定
                    $stmt->bindValue($param['name'], $param['value'], $param['type']);
                } else {
                    // シンプルに値をバインド
                    $stmt->bindValue($param['name'], $param['value']);
                }
            } else {
                // nameが指定されていなれば1からのindex形式
                if (is_null($param['value'])) {
                    // 値がNULLなら、data_typeに明示的にNULLを指定
                    $stmt->bindValue($index+1, $param['value'], PDO::PARAM_NULL);
                } elseif (array_key_exists('type', $param)) {
                    // data_typeが指定されていたなら指定
                    $stmt->bindValue($index+1, $param['value'], $param['type']);
                } else {
                    // シンプルに値をバインド
                    $stmt->bindValue($index+1, $param['value']);
                }
            }
        } else {
            // 配列でなければ、値がセットされていたとして扱う
            if (is_null($param)) {
                // 値がNULLなら、data_typeに明示的にNULLを指定
                $stmt->bindValue($index+1, $param, PDO::PARAM_NULL);
            } else {
                // シンプルに値をバインド
                $stmt->bindValue($index+1, $param);
            }
        }
    }
    return true;
}

//配列設定
$aryInsert = [];
$aryInsert[] = ['name' => 'のび太', 'gender' => 'man', 'type' => 'human'];
$aryInsert[] = ['name' => 'ドラえもん', 'gender' => 'man', 'type' => 'robot'];
$aryInsert[] = ['name' => 'ジャイアン', 'gender' => 'man', 'type' => 'human'];
$aryInsert[] = ['name' => 'スネ夫', 'gender' => 'man', 'type' => 'human'];
$aryInsert[] = ['name' => 'しずか', 'gender' => 'woman', 'type' => 'human'];
$aryInsert[] = ['name' => 'ドラミ', 'gender' => 'woman', 'type' => 'robot'];

$aryColumn = array_keys($aryInsert[0]);

//SQL文作成処理
$sql = "INSERT INTO
        doraemon_users
        (".implode(',', $aryColumn).")
        VALUES";

$arySql1 = [];
//行の繰り返し
foreach($aryInsert as $key1 => $val1){
    $arySql2 = [];
    //列（カラム）の繰り返し
    foreach($val1 as $key2 => $val2){
        $arySql2[] = ':'.$key2.$key1;
    }
    $arySql1[] = '('.implode(',', $arySql2).')';
}

$sql .= implode(',', $arySql1);

//bind処理
$sth = $pdo -> prepare($sql);
foreach($aryInsert as $key1 => $val1){
    foreach($val1 as $key2 => $val2){
        $sth -> bindValue(':'.$key2.$key1, $val2);
    }
}

//実行処理
$sth -> execute();


?>
