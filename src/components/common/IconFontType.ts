/**
 *
 * アイコンフォントの型です
 *
 * import type { IconFont } from '@/components/common/IconFontType';
 *
 */

import type IconFontType from '@/styles/foundation/base/_iconfont-type.scss';

type IconFontType = typeof IconFontType; // breakpoints変数から型を作成
export type IconProps = keyof IconFontType; // オブジェクト型のkeyからユニオン型を作成("hoge" | "fuga")
