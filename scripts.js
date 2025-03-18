let zip_result;
let checker;
let counter;
let pref;
let city;
let address;
var zip_id = 5; // 郵便番号 (実質郵便番号関係の質問は一つ前から)
var pref_id = 10; // 都道府県
var mail_id = 30; // メールアドレス
var tel_id = 35; // 電話番号
var name_id = 40; // お名前
var area_id = 50; // 地域
var loc = true;
var loading_zip = true;
var first_value = '';
var second_value = '';

const pref_file = "pref_city.json";

// setTimeout(function () {
//   $('.js-modal_start').fadeIn();
// }, 300);



$(function() {
  // 初回モーダルのボタン押下
  // $(document).on( "click", "button.first_button", function (){
  //   first_value = $(this).attr("id");

    // if (first_value == 'yane') {
    //   $('#content').append('<input type="hidden" name="相談内容" value="屋根の修理">');
    // } else {
    //   $('#content').append('<input type="hidden" name="相談内容" value="その他の修理">');
    // }
    // $('.js-modal_start').fadeOut();
    // loc = true;

    $('#content').append('<input type="hidden" name="相談内容" value="[選択なし]">');
    setTimeout(function(){addBallon_nosc('あなたに最適な求人をご紹介する適職診断サイトです！', 'store', true)},500);
    setTimeout(function(){addBallon_nosc('あなたの希望に沿った求人を紹介するため8個だけ質問に回答してください！', 'store', false)},2000);
    setTimeout(function(){addBallon_nosc('現在の就業状況を教えてください！', 'store', false)},3000);
    setTimeout(function(){addQues_nosc()},4000);
    
  // });

  $(document).on( "click", ".choice_button", function (){
    var tag =  $(this).attr('id');
    removeQuestion(tag, 'button');
  });

  $(document).on( "click", ".go_button", function (){
    var tag =  $(this).attr('id');
    removeQuestion(tag, 'input'); 
  });

  $(document).on( "click", ".select_button", function (){
    var tag =  $(this).attr('id');
    removeQuestion(tag, 'select'); 
  });

  //　離脱防止モーダル
  history.pushState(null, null, null);
  $(window).on("popstate", function(){
    if (loc) {
      $('.js-modal_return2').fadeIn();
    }
  });
  $('.overmouse').on('mouseover', function () {
    if (loc) {
      $('.js-modal_return1').fadeIn();
    }
  });

  // 入力に戻るボタン
  $(document).on( "click", "button.return_button", function (){
    history.pushState(null, null, null);
    $('.js-modal_return').fadeOut();
  });
  
  // ブラウザバックボタン
  $(document).on( "click", "a.back_button", function (){
    // loc = false;
    history.go(-1);
  });

  // モーダルを閉じる挙動
  $('.js-modal-close').on('click',function(){
    // loc = false;
    $('.js-modal_return').fadeOut();
  });


  $(document).on( "click", "button#sbm_btn", function (){
    document.chatform.submit(); 
  });
});

function addImage (path) {
  var html = '<div class="timeline_img"><img src="'+path+'"></div>';
  $('#content').append(html);
}

function addBallon (text, type, is_first = true) {
  var classes = '';
  if (type == 'store') {
    if (is_first) {
      classes = 'store loading'
    } else {
      classes = 'store loading no_icon';
    }
    go_to_bottom();
  } else {
    classes = 'user unread';
  }
  var html = '<div class="'+classes+'"><div class="balloon"><p>'+text+'</p></div></div>';
  $('#content').append(html);

  setTimeout(function(){
    $('div.store').removeClass('loading');
  }, Math.random()*((600+1)-400)+400);

  setTimeout(function(){
    $('div.user').removeClass('unread');
  }, Math.random()*((600+1)-400)+400);
}

function addQues (ques_array, ques_no) {
  var classes = '';
  var ans_no = 0;
  var in_img = '';
  if (ques_array[0] == '都道府県') {
    var code = '';
    // 都道府県の場合は特殊分岐
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<select id="q-'+ques_no+'_select">';

    html += '<option value="">--- 選択してください ---</option>';
    html += '</select>';
    html += '<button type="button" id="'+ques_no+'" class="select_button">送信</button>';
    html += '</div>';
    get_address_from_json('pref');

  } else if (ques_array[0] == '市区町村') {
    // 選ばれた都道府県を取得
    pref = [$('input[name="'+String(Number(ques_no)-1)+'"]').val()];
    var code = $('input[name="'+String(Number(ques_no)-1)+'"]').data()['id'];
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<select id="q-'+ques_no+'_select">';
    html += '<option value="">--- 選択してください ---</option>';
    html += '</select>';
    html += '<button type="button" id="'+ques_no+'" class="select_button">送信</button>';
    html += '</div>';
    get_address_from_json(code);

  } else if (ques_array[0] == '住所') {
    // 選ばれた市区町村を取得
    city = [$('input[name="'+String(Number(ques_no)-1)+'"]').val()];
    // 都道府県選択時の残りの番地入力
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<input type="text" id="q-'+ques_no+'_input" placeholder="'+ques_array[0]+'を入力してください">';
    html += '<button type="button" id="'+ques_no+'" class="go_button">送信</button>';
    html += '</div>';
  } else if (ques_array[0] == 'メールアドレス') {
    // メールアドレスは特殊分岐
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<input type="mail" id="q-'+ques_no+'_input" placeholder="'+ques_array[0]+'を入力してください">';
    html += '<button type="button" id="'+ques_no+'" class="go_button">送信</button>';
    html += '</div>';
  } else if (ques_array[0] == '電話番号') {
    // 電話番号は特殊分岐
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<input type="tel" id="q-'+ques_no+'_input" placeholder="'+ques_array[0]+'を入力してください">';
    html += '<button type="button" id="'+ques_no+'" class="go_button">送信</button>';
    html += '</div>';
  } else if (ques_array[0] == 'お名前') {
    // 名前は特殊分岐
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<input type="text" id="q-'+ques_no+'_input" placeholder="'+ques_array[0]+'を入力してください">';
    html += '<button type="button" id="'+ques_no+'" class="go_button">送信</button>';
    html += '</div>';
  } else if (ques_array.length == 1) {
    var html = '<div class="answer input_area" id="q-'+ques_no+'">';
    html += '<input type="text" id="q-'+ques_no+'_input" placeholder="'+ques_array[0]+'を入力してください">';
    html += '<button type="button" id="'+ques_no+'" class="go_button">送信</button>';
    html += '</div>';
  } else {
    if (ques_array.length % 2 == 0) {
      if (ques_array.length % 3 != 0) {
        classes = 'answer two';
      } else {
        classes = 'answer three';
      }
    } else {
      classes = 'answer three';
    }
    // ques_no = 15(材質) 19(状態) 特例処理
    if (ques_no == 15) {

      var html = '<div class="answer two" id="q-'+ques_no+'">';
      $.each(ques_array, function(index, value){
        if ($.isArray(value)) {
          in_img = ' in_img';
          if (value[0].match(/<br>/)) {
            html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button in_img two_low">';
          } else {
            html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button in_img">';
          }
          html += '<img src="'+value[1]+'">'+value[0]+'</button>';
        } else {
          html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button">'+value+'</button>';
        }
        ans_no++;
      });
    /*
    } else if (ques_no == 19) {

      var html = '<div class="answer two" id="q-'+ques_no+'">';
      $.each(ques_array, function(index, value){
        if ($.isArray(value)) {
          if (value[0].match(/<br>/)) {
            html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button in_img two_low">';
          } else {
            html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button in_img">';
          }
          html += '<img src="'+value[1]+'">'+value[0]+'</button>';
        } else {
          html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button no_img wd_100">'+value+'</button>';
        }
        ans_no++;
      });
    */
    } else {

      var html = '<div class="'+classes+'" id="q-'+ques_no+'">';
      $.each(ques_array, function(index, value){
        if ($.isArray(value)) {
          in_img = ' in_img';
          if (value[0].match(/<br>/)) {
            html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button in_img two_low">';
          } else {
            html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button in_img">';
          }
          html += '<img src="'+value[1]+'">'+value[0]+'</button>';
        } else {
          html += '<button type="button" id="q-'+ques_no+'_a-'+ans_no+'" class="choice_button'+in_img+'">'+value+'</button>';
        }
        ans_no++;
      });
    }
    html += '</div>';
  }
  $('#content').append(html);
  go_to_bottom();
}

// 初回スクロールなし
function addBallon_nosc (text, type, is_first = true) {
  var classes = '';
  if (type == 'store') {
    if (is_first) {
      classes = 'store loading'
    } else {
      classes = 'store loading no_icon';
    }
  }
  var html = '<div class="'+classes+'"><div class="balloon"><p>'+text+'</p></div></div>';
  $('#content').append(html);

  setTimeout(function(){
    $('div.store').removeClass('loading');
  },500);
}
function addQues_nosc () {
  var html = '<div class="answer two" id="q-0">';
  // if (first_value == 'yane') {
    html += '<button type="button" id="q-0_a-0" class="choice_button">正社員</button>';
    html += '<button type="button" id="q-0_a-1" class="choice_button">派遣</button>';
    html += '<button type="button" id="q-0_a-2" class="choice_button">フリーター</button>';
  // } else {
    // 最初の質問でそれ以外
  //   html += '<button type="button" id="q-0_a-3" class="choice_button">職あり</button>';
  //   html += '<button type="button" id="q-0_a-4" class="choice_button">学生</button>';
  //   html += '<button type="button" id="q-0_a-5" class="choice_button"><span class="ft_sm">無職</span></button>';
  // }
  html += '</div>';
  $('#content').append(html);
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    go_to_bottom();
  }
}

function removeQuestion (tag, type) {
  if (!tag.indexOf('q-'+(zip_id+1))) {
    // zipに対する回答の特殊分岐
    answer_zip(tag);
    return;
  }

  var ques_no = '';
  var ans_no = '';
  var text = '';
  var input = '';
  var alart = '';
  $('div.alart').remove();

  if (type == 'button') {
    var res = tag.split('_');
    ques_no = res[0].split('-')[1];
    ans_no = res[1].split('-')[1];
    text = $('#'+tag).text();
    input = '<input type="hidden" name="'+ques_no+'" value="'+text+'">';
  } else if (type == 'input') {

    ques_no = tag;
    text = replaceFullToHalf($('input#q-'+tag+'_input').val());

    //入力エラー差し戻し
    if (text == '') {
      alart = '入力してください';

      $('#q-'+tag).prepend('<div class="alart">'+alart+'</div>');
      return;
    }

    // q = zip_id 郵便番号の場合は詳細チェック
    if (tag == zip_id) {
      if (!text.match(/^\d{3}-?\d{4}$/)) {
        alart = '正しい形式で入力してください';
      } else {
        counter = 0;
        getAddressData(text);
        checker = setInterval(check_zip,100);
        $('#q-'+zip_id).addClass('loading');
        $('#q-'+zip_id+'_input').attr('disabled','disabled');

        //以降処理はcheck_zipに移動
        return;
      }

    // q = zip_id+4 郵便番号からの番地入力
    } else if (tag == zip_id+4) {
      address += text;

    // q = pref_id+2 都道府県選択からの場合は番地をたす
    } else if (tag == pref_id+2) {
      address = text;

    // q = mail_id メールアドレスの場合は詳細チェック
    } else if (tag == mail_id) {
      if (!text.match(/^[a-zA-Z0-9_.+-]+[@][a-zA-Z0-9.-]+[.][a-zA-Z0-9]+$/)) {
        alart = '正しい形式で入力してください';
      }

    // q = tel_id 電話番号の場合は詳細チェック
    } else if (tag == tel_id) {
      // チェック内容
      if (!text.match(/^(0([1-9]{1}-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{4}|0[789]0-?\d{4}-?\d{4}|050-?\d{4}-?\d{4})$/)) {
        alart = '正しい形式で入力してください';
      }
      var rep = text.replace(/-/g, '');
      if (rep.match(/0{7,}|1{7,}|2{7,}|3{7,}|4{7,}|5{7,}|6{7,}|7{7,}|8{7,}|9{7,}|1234567/)) {
        alart = '正しい形式で入力してください';
      }
    }

    // 今まででエラーに引っ掛かるか判定
    if (alart != '') {
      $('#q-'+tag).prepend('<div class="alart">'+alart+'</div>');
      return;

    // 郵便番号時の番地入力はaddressを代入
    } else if (tag == (zip_id+4)) {
      input = '<input type="hidden" name="'+tag+'" value="'+address+'">';
    } else {
      input = '<input type="hidden" name="'+tag+'" value="'+text+'">';
    }
  } else if (type == 'select') {
    ques_no = tag;
    text = $('select#q-'+tag+'_select').val();
    //入力エラー差し戻し
    if (text == '') {
      alart = '選択してください';
      $('#q-'+tag).prepend('<div class="alart">'+alart+'</div>');
      return;
    }

    if (tag == pref_id) {
      input = '<input type="hidden" name="'+tag+'" value="'+text.split('-')[1]+'" data-id="'+text.split('-')[0]+'">';
      text = text.split('-')[1];
    } else {
      input = '<input type="hidden" name="'+tag+'" value="'+text+'">';
    }
  }
  $('#content').append(input);
  $('div#q-'+ques_no).remove();
  if (text == 'はい' || text == 'いいえ') {
    setTimeout(function(){addBallon(text, 'user')},100);
  } else {
    setTimeout(function(){addBallon('「'+text+'」です', 'user')},100);
  }
  jump(ques_no, ans_no);
}
function addQues(ques_array, ques_no) {
  var html = '';
  if (ques_no == area_id) {
   // 地域選択をプルダウンにする
   html = '<div class="answer input_area" id="q-' + ques_no + '">';
   html += '<select id="q-' + ques_no + '_select">';
   html += '<option value="">--- 選択してください ---</option>';
   $.each(ques_array, function(index, value) {
    html += '<option value="' + index + '">' + value + '</option>';
   });
   html += '</select>';
   html += '<button type="button" id="' + ques_no + '" class="select_button">送信</button>';
   html += '</div>';
  } else if (ques_no == area_id + 1) {
   // 都道府県選択をプルダウンにする
   html = '<div class="answer input_area" id="q-' + ques_no + '">';
   html += '<select id="q-' + ques_no + '_select">';
   html += '<option value="">--- 選択してください ---</option>';
   $.each(ques_array, function(index, value) {
    html += '<option value="' + value + '">' + value + '</option>';
   });
   html += '</select>';
   html += '<button type="button" id="' + ques_no + '" class="select_button">送信</button>';
   html += '</div>';
  } 
  $('#content').append(html);
  go_to_bottom();
 }
 
function jump(ques, ans = null) {
  if (ques == 0) {
   setTimeout(function() { addBallon('あなたの希望している地域での求人をお探しいたします。', 'store', true); }, 1500);
   setTimeout(function() { addBallon('働きたい地域を選択してください。', 'store', true); }, 2500);
   setTimeout(function() { 
    addQues(['北海道東北', '関東', '中部', '近畿', '中国四国', '九州沖縄'], area_id); 
   }, 3000);
 
  } else if (ques == area_id) {
   var regions = [
    ['北海道', '青森県', '岩手県', '秋田県', '宮城県', '山形県', '福島県'],
    ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'],
    ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
   ];
   setTimeout(function() {
    addQues(regions[ans], area_id + 1);
   }, 2000);
  
 

  } if (ques == 14) {
    setTimeout(function(){addBallon('ご入力ありがとうございます。非公開求人が複数ある地域でした！', 'store', true)},1000);
    setTimeout(function(){addBallon('どれくらいで転職活動をスタートしたいですか？', 'store', true)},2500);
    setTimeout(function(){addQues(['なるべく早めに', '1ヶ月後くらいから','3ヶ月後くらいから','半年以降'], 15)},3000);
  } else if (ques == 15) {
    setTimeout(function(){addBallon('ご回答ありがとうございます！', 'store', true)},1500);
    setTimeout(function(){addBallon('あなたに合った求人をより選定するため、過去の就職回数を教えてください。', 'store', true)},2000);
    setTimeout(function(){addQues(['0回', '1回', '2回','3回','4回以上'], 16)},3000);
  } else if (ques == 16) {
    setTimeout(function(){addBallon('すでに就活をしていますか？', 'store', true)},1500);
    setTimeout(function(){addQues(['はい', 'いいえ'], 17)},2000);
  } else if (ques == 17) {
    setTimeout(function(){addBallon('ありがとうございます！あなたのご年齢を教えてください！', 'store', true)},1500);
    setTimeout(function(){addQues(['18~22', '23~39', '30~34','35歳以上',], 18)},2000);

  } else if (ques == 18) {
    setTimeout(function(){addBallon('お客様にピッタリな求人がいくつか見つかりました！', 'store', true)},1000);
    setTimeout(function(){addBallon('非公開なホワイト求人もお知らせしますので、連絡先を教えてください。', 'store', true)},2000);
    setTimeout(function(){addQues(['メールアドレス'], mail_id)},2500);
    setTimeout(function(){addQues(['電話番号'], tel_id)},2500);
  } else if (ques == tel_id) {
  //   setTimeout(function(){addBallon('最後にお名前を教えてください。', 'store', true)},1500);
  //   setTimeout(function(){addQues(['お名前'], name_id)},2000);
  // } else if (ques == name_id) {
    setTimeout(function(){addBallon('ご入力いただきありがとうございました。', 'store', true)},1000);
    setTimeout(function(){addBallon('最後に送信ボタンを押してください。', 'store', false)},1500);

    // 最後の処理
    setTimeout(function(){
      $('#content').append('<div class="submit_btn" type="submit"><button type="submit" id="sbm_btn" class="dokidoki_sbm">送信</button></div>');
      $('main .inner').css('padding-bottom','100px');
    },2300);
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
      setTimeout(function(){
        go_to_bottom();
      },2500);
    }
  }
}

// 全角を半角に
function replaceFullToHalf(str){
  str = str.replace(/ー/g, '-');
  str = str.replace(/−/g, '-');
  str = str.replace(/　/g, '');
  str = str.replace(/ /g, '');
  return str.replace(/[！-～]/g, function(s){
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

function getAddressData(zip) {
  zip_result = {'address': '', 'error': '', 'zip': zip, 'get': ''};
  zip = zip.replace(/ー/g, '');
  zip = zip.replace(/−/g, '');
  $.getJSON('https://zipcloud.ibsnet.co.jp/api/search?callback=?', {zipcode: zip.replace(/-/g, '')}
  ).done(function(data) {
    if (!data.results) {
      zip_result['error'] = '該当の住所がありません';
      zip_result['get'] = true;
    } else {
      let res = data.results[0];
      pref = res.address1;
      city = res.address2;
      address = res.address3;
      zip_result['get'] = true;
    }
  }).fail(function(){
    zip_result['error'] = '入力値を確認してください。';
    zip_result['get'] = true;
  });
}

// 郵便番号入力後の処理
function check_zip() {
  console.log(counter);
  if(loading_zip) {
    if (zip_result['get']) {
      clearInterval(checker);
      loading_zip = false;
      // 取得完了 以降処理しないようにfalse

      if (zip_result['error'] != '') {
        $('#q-'+zip_id).prepend('<div class="alart">'+zip_result['error']+'</div>');
        $('#q-'+zip_id).removeClass('loading');
        $('#q-'+zip_id+'_input').prop('disabled',false);
        return;
      } else {
        loading_zip = true;
        $('#content').append('<input type="hidden" name="'+zip_id+'" value="'+zip_result['zip']+'">');
        $('div#q-'+zip_id).remove();
        addBallon('「'+zip_result['zip']+'」です', 'user');
        setTimeout(function(){addBallon('ご入力ありがとうございます。', 'store', true)},500);
        setTimeout(function(){addBallon('住所は、'+pref+city+address+'でお間違い無いでしょうか？', 'store', false)},1000);
        setTimeout(function(){addQues(['はい', 'いいえ'], zip_id+1)},1500);
      }
    } else if (counter > 100) {
      $('#q-'+zip_id).removeClass('loading');
      $('#q-'+zip_id+'_input').prop('disabled',false);
      // タイムアウト
      clearInterval(checker);
      $('#q-'+zip_id).prepend('<div class="alart">もう一度送信ボタンを押してください</div>');
      return;
    } else {
      counter++;
    }
  }
  if (!loading_zip && counter == 0) {
    loading_zip = true;
    console.log('happen!');
    $('#q-'+zip_id).removeClass('loading');
    $('#q-'+zip_id+'_input').prop('disabled',false);
    // タイムアウト
    clearInterval(checker);
    $('#q-'+zip_id).prepend('<div class="alart">もう一度送信ボタンを押してください</div>');
    return;
  }
}

// スクロール処理
function go_to_bottom () {
  var element = document.documentElement;
  var bottom = element.scrollHeight - element.clientHeight;
  window.scrollTo({top: bottom, left: 0, behavior: 'smooth'});
}

// 郵便番号確認後の処理
function answer_zip(tag) {
  var res = tag.split('_');
  ques_no = res[0].split('-')[1];
  ans_no = res[1].split('-')[1];
  text = $('#'+(zip_id+1)).text();
  if (ans_no == 0) {

    // 住所保存
    $('#content').append('<input type="hidden" name="'+(zip_id+2)+'" value="'+pref+'">');
    $('#content').append('<input type="hidden" name="'+(zip_id+3)+'" value="'+city+'">');

    $('div#q-'+(zip_id+1)).remove();
    addBallon('はい', 'user');
    setTimeout(function(){addBallon('番地やマンション名などを入力してください', 'store', true)},1000);
    setTimeout(function(){addQues(['住所'], zip_id+4)},1500);
  } else {
    $('input[name="'+zip_id+'"]').remove();
    $('div#q-'+(zip_id+1)).remove();
    addBallon('いいえ', 'user');
    setTimeout(function(){addBallon('ではお手数ですがもう一度後入力お願いします。', 'store', true)},1000);
    setTimeout(function(){addQues(['郵便番号'], zip_id)},2000);
  }
}

// JSON読み込み処理
function get_address_from_json(type) {
  var str = '';
  setTimeout(function(){
    if (type == 'pref') {
      $.getJSON(pref_file, function(json){
        for(var i=0; i<47; i++) {
          code = ('00'+String(Number(i)+1)).slice(-2);
          str = '<option value="'+json[i][code]['id']+'-'+json[i][code]['pref']+'">'+json[i][code]['pref']+'</option>';      
          $('#q-'+pref_id+'_select').append(str);
        }
      });
    } else {
      $.getJSON(pref_file, function(json){
        var key = Number(type)-1;
        var cities = json[key][type]['city'];
        for(var i=0; i<cities.length; i++) {
          str = '<option value="'+cities[i]['name']+'">'+cities[i]['name']+'</option>';      
          $('#q-'+String(pref_id+1)+'_select').append(str);
        }
      });

    }
  },100);
}

// 時間表示
function getCurrentTime() {
  var now = new Date();
  var res = "" + now.getFullYear() + padZero(now.getMonth() + 1) + padZero(now.getDate()) + padZero(now.getHours()) + padZero(now.getMinutes()) + padZero(now.getSeconds());
  return res;
}

function padZero(num) {
  var result;
  if (num < 10) {
    result = "0" + num;
  } else {
    result = "" + num;
  }
  return result;
}