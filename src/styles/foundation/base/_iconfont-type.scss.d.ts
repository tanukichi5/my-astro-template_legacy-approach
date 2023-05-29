export type Styles = {
  'arrow-left': string;
  'arrow-right': string;
  home: string;
  minus: string;
  plus: string;
  sns_facebook: string;
  sns_facebook2: string;
  sns_instagram: string;
  sns_line: string;
  sns_line2: string;
  sns_line3: string;
  sns_line4: string;
  sns_twitter: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
