## ヘッドレスブラウザでwebコンテンツ収集くん
ソース内の配列（accesslist）内のURLのサイトを表示するためのコンテンツを./dataディレクトリに保存してくれる君.  

######Howto
phantomjs redirectTrace.js  

######wget/curlとの違い
Javascriptの``location.href``で発生したりするリダイレクト先も収集する
