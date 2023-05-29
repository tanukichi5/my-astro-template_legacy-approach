// 1. 必要ライブラリ
const gulp = require("gulp");
const rename = require('gulp-rename');

//アイコンフォント作成用
const iconfont = require('gulp-iconfont');
const consolidate = require('gulp-consolidate');
const runTimestamp = Math.round(Date.now() / 1000); // タイムスタンプ
const fontName = 'iconfont'; // シンボルフォント名

const paths = {
  iconFontOutputDir: 'public/fonts/', //アイコンフォントを出力するディレクトリ
  svg: 'src/iconfont/svg/*.svg', //svgの格納場所
  fonts: '/fonts/', //cssからアイコンフォントを@font-faceで読み込むためのパス（ディレクトリを指定）
  templateScss: 'src/iconfont/templates/iconfont.scss', //アイコンフォントのスタイルが書かれたテンプレート
  templateScssType: 'src/iconfont/templates/iconfont-type.scss', //アイコンフォントの型定義用スタイルが書かれたテンプレート
  scssOutputDir: 'src/styles/foundation/base/', //scssファイルの出力先
  templatePreviewHtmnl: 'src/iconfont/templates/iconfont.html', //アイコンフォントのプレビュー用HTMLのテンプレート
  templatePreviewCss: 'src/iconfont/templates/iconfont.css', //アイコンフォントのプレビュー用cssのテンプレート
  previewOutputDir: 'src/iconfont/' //プレビュー用ファイルの出力先
}

//画像圧縮
const imagemin = require('gulp-imagemin'); //v7.1.0を使うこと
const mozjpeg = require('imagemin-mozjpeg'); //v9.0.0を使うこと
const pngquant = require('imagemin-pngquant');
const changed = require('gulp-changed');


//アイコンフォント ジェネレーター
const task_iconfont = () => {
  return gulp
    .src([paths.svg])
    .pipe(iconfont({
      fontName: fontName, // required
      timestamp: runTimestamp,
      formats: ['ttf', 'eot', 'woff', 'svg'],
      normalize: true,
      fontHeight: 1001
    }))
    .on('glyphs', function (glyphs, options) {
      engine = 'lodash',
        consolidateOptions = {
          glyphs: glyphs,
          fontName: fontName,
          timestamp: runTimestamp,
          fontPath: paths.fonts, // フォントをCSSから読み込むときのパス
          className: 'iconfont', // CSSのフォントのクラス名を指定
        }
      // シンボルフォント用のcssを作成
      gulp.src(paths.templateScss)
        .pipe(consolidate(engine, consolidateOptions))
        .pipe(rename({ basename: '_' + fontName }))
        .pipe(gulp.dest(paths.scssOutputDir)); // SCSSの吐き出し先を指定
      gulp.src(paths.templateScssType)
        .pipe(consolidate(engine, consolidateOptions))
        .pipe(rename({ basename: '_' + fontName + '-type' }))
        .pipe(gulp.dest(paths.scssOutputDir)); // 型定義用SCSSの吐き出し先を指定
      gulp.src(paths.templatePreviewCss)
        .pipe(consolidate(engine, consolidateOptions))
        .pipe(rename({ basename: fontName }))
        .pipe(gulp.dest(paths.previewOutputDir)); // CSSの吐き出し先を指定
      // シンボルフォント一覧のサンプルHTMLを作成
      gulp.src(paths.templatePreviewHtmnl)
        .pipe(consolidate(engine, consolidateOptions))
        .pipe(rename({ basename: 'preview' }))
        .pipe(gulp.dest(paths.previewOutputDir)); // サンプルHTMLの吐き出し先を指定
    })
    .pipe(gulp.dest(paths.iconFontOutputDir));
};

//画像を圧縮して移動
const task_imagemin = () => {
  return gulp
    .src('public/images/**')
    .pipe(changed('dist/assets/img'))
    .pipe(
      imagemin([
        pngquant({
          quality: [.60, .70], // 画質
          speed: 1 // スピード
        }),
        mozjpeg({ quality: 65 }), // 画質
        imagemin.svgo(),
        imagemin.optipng(),
        imagemin.gifsicle({ optimizationLevel: 3 }) // 圧縮率
      ])
    )
    .pipe(gulp.dest('dist/images'));
};

//監視タスク
const task_watch = () => {
  const watches = [
    gulp.watch(paths.svg, task_iconfont),
  ];

  watches.forEach((v) => {
    return v;
  });
};

//デフォルト実行タスク
exports.default = gulp.series(task_watch);

//ビルド時の実行タスク
exports.build = gulp.series(task_imagemin);