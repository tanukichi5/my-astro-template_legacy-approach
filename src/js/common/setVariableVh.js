/**
 * 
 * bodyに画面の高さをcss変数（--vh）をセットします
 * 
 * 本来はsafariの100vhのがおかしい問題を解決するために入れるますが、
 * 今回はandroid用に入れてます
 * 
 * 現在はdvhを使うと解決するはずだけど、面倒なのでjsでまとめて対応する
 * 
 * @usage
 * css側で以下のように指定します。
 * height: var(--vh, 100vh);
 * 
 */


import SetVariableVh from '@/libs/setVariableVh'
new SetVariableVh()
