# 従来のWEB制作に近いビルド設定のAstro環境

Word Pressに組み込んだりFTPで手動アップロードするプロジェクトなどで使う

# 制作環境はAstroベースです

- node v18.16.0
- npm v8.1.3

**HTML**
基本的にastroファイルをメインに構築しています。  
一部reactコンポーネントも含まれていますが、reactコンポーネント内にjsは書いていないのでビルド後は静的なHTMLになります。  

**CSS**
「FLOCSS + BEM + Tailwind CSS」で構築しています。  
Tailwind CSSは余白やフォントサイズなどの微調整に使用しています。

## 環境セットアップ（初回のみ）

```
$ npm i
```

## ローカルサーバー起動（開発環境立ち上げ）

```
$ npm run dev
```

その後、[http://127.0.0.1:3000/](http://127.0.0.1:3000/)にアクセス。 

## ビルド

```
$ npm run build
```

distディレクトリが作成されその中にビルドファイルが出力されます。  

gulpで画像圧縮も同時やります

## ディレクトリ構成
```
.
├ public //静的ファイルを配置
└ src
　 ├ components //コンポーネント
　 ├ iconfont //アイコンフォント
　 ├ js //サイトで実際に使用するjsファイルを配置
　 ├ libs //ライブラリなどを使用した固有のロジック
　 ├ pages //Astroでルーティングされるページコンポーネント
　 ├ stories //Storybook用のファイルを配置
　 └ styles //スタイルを配置
```

## importのエイリアス

下記のように`@`を付けることでsrcディレクトリ内を絶対パスで指定可能

```
import Button from '@/components/common/Button'
```

scssのエイリアスも同様に`@`を使用できます
```
@use '@/styles/global' as *;
```


## アイコンフォントについて

```
$ npm run iconfont
```

上記コマンドでアイコンフォントを作成するgulpがWatch状態になります。  
この状態で`/iconfont/svg/`ディレクトリにsvgファイルを配置するとアイコンフォントが作成されます。

### アイコンフォントの使用方法

アイコンフォント用のコンポーネントを用意しているのでそれを使用します。  
`/components/common/IconFont.tsx`

### アイコンフォントのプレビュー

`/iconfont/sample.html`をブラウザで開くだけで使用可能なアイコンフォント一覧を確認できます。


## Storybook

以下のコマンドでStorybookが起動します。
```
npm run storybook
```

Docsタブ内のShow codeよりコピペすることでサイト内で使用可能です。  
※コピペする際に**classNameをclassに手動で変更する必要あり**  
※全然作り込んでいなので参考程度

## Lint & Prettier

以下コマンドでLintエラー検出・自動補完
```
npm run lint:fix
```


## 補足事項

### CSSについて

WordPressに組み込むため「FLOCSS + BEM + Tailwind CSS」で作成しています。  

**Scoped CSSやCSS Modulesは使用していません。**  
理由はビルドなどのタイミングclass名が変化（ランダムな文字列が割り当てられる）するため修正のタイミングで以前組み込んだHTMLにスタイルが当たらなくなる可能性があるからです。


### JSについて

jsファイルを追加などした場合は必ず`src/js/app.js`にimportしてください。  
また、astroファイル内やコンポーネントなどに固有のjsも書かないようにしてください。  

上記のようにする理由は`src/js/app.js`以外にjsを書くとビルド時に複数のjsファイルが生成されてWordPressへ組み込みが面倒になるからです。（特に修正の際）

### WordPressへの組み込みについて

ビルドすると`dist`ディレクトリが生成されるので基本的にそのファイルをWordPressに組み込みます。  

- `assets`ディレクトリと`chunks`ディレクトリは必ず同じ階層に置くこと
- cssを組み込む場合は`assets/style.css`をサイト全体に読み込む
- jsを組み込む場合は`assets/hoisted/bundle.js`をサイト全体に読み込む  
※他に`assets/hoisted/bundle2.js`や`assets/client/bundle2.js`なども生成されるが無視してOK
- 修正などで再ビルドした場合は`chunks`ディレクトリと`assets/hoisted/bundle.js`を必ず置き換えること


