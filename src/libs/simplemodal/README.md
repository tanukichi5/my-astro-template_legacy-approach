# simplemodal.js

アクセシブルなモーダルを実装できるライブラリです。

[Micromodal.js](https://micromodal.vercel.app/)を参考に作成しています。
Micromodal.jsとの違いはhtmlの記述量の少なさとpopover機能の有無です。

- HTMLの属性を切り替える処理しかしていないのでCSSでデザインを自由にカスタマイズ可能
- WAI-ARIAを操作しているので支援技術に対応
- キーボード操作に対応

## インポート

モーダルのコンポーネントをインポート

```js
import Simplemodal from 'path/to/simplemodal'
```

## HTML

- モーダルを開くボタン（トリガー）に`data-simplemodal-trigger`属性を付与
- モーダル本体のidに`data-simplemodal-trigger`の値を設定

`data-simplemodal-trigger`は**閉じる機能も有しているため複数設置しても大丈夫**です

```html
<button data-simplemodal-trigger="js-modal">モーダルを開くボタン</button>

<div id="js-modal">
  モーダルの本体
<div>
```

## 実行

```js
const simplemodal = new Simplemodal();
```

## オプション

```js
new Simplemodal({options});
```

```js
new Simplemodal({
  trigger : "data-hoge-trigger",
  backFixed: false
});
```

| Option | Description | Default |
| --- | --- | --- |
| trigger | 開閉するトリガーのデータ属性名を変更{string} デフォルト"data-simplemodal-trigger" | data-simplemodal-trigger |
| backFixed | モーダルオープン時に背面を固定するかどうか{boolean} デフォルトtrue | true |
| multipleOpen | モーダルを複数開くかどうか{boolean} デフォルトfalse | false |
| clickOutSideClose | モーダルの外側をクリックしたときに閉じるかどうか{boolean} デフォルトfalse | false |
| onOpen | パネルを開いたときのコールバック{function} | () => { } |
| onClose | パネルを閉じたときのコールバック{function} | () => { } |


## ポップオーバー

トリガーのHTMLに関連属性付与することでポップオーバーモードになります。

```html
<button type="button" data-popover-trigger="js-popover-sample" data-popover="true" data-popover-offset="10">
  popover open
</button>
```

| Attribute | Description |
| --- | --- |
| data-popover | 値をtrueでポップオーバーモード |
| data-popover-offset | ポップオーバー本体とトリガーの余白 |


## トリガー要素のデフォルトイベント

トリガーは基本的にデフォルトイベント（aタグのリンクなど）を無効にしています。有効にする場合は`data-prevent="false"`をトリガーに付与してください。

主な使用場所:ページ内アンカー

```html
<a href="#page-link" data-popover-trigger="js-popover-sample" data-prevent="false">
  popover open
</a>
```

## メソッド

```js
const simplemodal = new Simplemodal();

simplemodal.open("モーダルID", {options})
simplemodal.close("モーダルID", {options})
```

| Option | Description |
| --- | --- |
| open | 第一引数に指定したモーダルを開きます, 第二引数は任意 |
| close | 第一引数に指定したモーダルを閉じます,第二引数は任意 |
