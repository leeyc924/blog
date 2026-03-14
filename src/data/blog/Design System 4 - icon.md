---
title: "Design System 4. icon"
pubDatetime: 2024-02-08
description: fantasticon을 이용한 아이콘 webfont 패키지 제작
tags: ["개인", "Frontend"]
---

오늘은 나만의 icon package를 제작하였습니다.

fantasticon을 이용해서 icon svg 파일들을 webfont로 제작하여 publish 하였습니다.

## Directory

- **components**: Icon컴포넌트가 위치한곳
- **constants**: Icon의 name이 있는곳
- **icons**: icon svg파일들이 있는곳
- **templates**: webfont 추출시 필요한 template

## Webfont generate

피그마에서 svg 아이콘을 만든뒤 icons 폴더에 넣어주고

```json
// fantasticonrc.json
{
  "inputDir": "./src/icons",
  "outputDir": "./dist",
  "normalize": true,
  "fontTypes": ["svg", "woff"],
  "assetTypes": ["css", "ts", "json"],
  "templates": {
    "css": "src/templates/css.hbs"
  }
}
```

```hbs
// templates/css.hbs
@font-face {
    font-family: "{{ name }}";
    src: {{{ fontSrc }}};
    font-display: block;
}

i[class*=" {{ prefix }}-"]::before,
i[class^="{{ prefix }}-"]::before {
    font-family: {{ name }} !important;
    font-style: normal;
    font-weight: 400 !important;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

{{# each codepoints}}
    .{{ ../prefix }}-{{ @key }}::before {
        content: "\{{ codepoint this }}";
    }
{{/ each}}
```

npm fantasticon을 실행하면 woff 파일이 정상적으로 만들어집니다.

## Icon 컴포넌트 & Bundle

components에는 리액트 코드에서 사용될 Icon 컴포넌트를 만든뒤 [tsup](https://tsup.egoist.dev/)으로 번들링해주었습니다.

```typescript
import { CSSProperties } from 'react';
import icons from '../constants';

export interface IconProps {
  name: (typeof icons)[number];
  size?: number;
  irName?: string;
  color?: CSSProperties['color'];
}

const Icon = ({ color = '#000', irName, name, size = 24 }: IconProps) => {
  return (
    <i
      className={`icon icon-${name}`}
      style={{
        fontSize: size,
        color,
      }}
    >
      {irName && <span>{irName}</span>}
    </i>
  );
};

export default Icon;
```

아이콘의 이름을 props로 받기위해 constants.ts 파일을 생성해주는 script도 작성하였습니다.

```bash
#!/bin/bash

icon_path='src/icons'
constant_file='src/constants/index.ts'

echo 'const icons = [' >"$constant_file"

function convert_name {
  file_name=$(basename "$1")
  file_name_without_extension="${file_name%.*}"
  dash_replaced="${file_name_without_extension// /-}"

  echo "$dash_replaced"
}

for file in "$icon_path"/*; do
  if [ -f "$file" ]; then
    converted_name=$(convert_name "$file")
    echo "  '${converted_name}'", >>"$constant_file"
  fi
done

{
  echo '] as const;'
  echo '' >>"$constant_file"
  echo 'export default icons' >>"$constant_file"
} >>"$constant_file"

npx eslint --fix "$constant_file"
```

npm tsup을 하면 dist에 Icon컴포넌트가 정상적으로 번들링됩니다.

```javascript
// tsup.config.js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/components/index.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
```

그 다음 npm publish를 통해 npm에 배포하면 끝.

## 사용

```typescript
import Icon from "@breadlee/icons";

function App() {
  return (
    <>
      아이콘 입니다
      <Icon name="arrow_down" color="red" size={24} />
    </>
  );
}

export default App;
```

icons.woff 파일과 icons.css파일 배포전략을 생각해봐야 할것같습니다.

지금은 임시로 [https://www.jsdelivr.com/?docs=gh](https://www.jsdelivr.com/?docs=gh) 무료 cdn을 활용하여

```html
<link href="https://cdn.jsdelivr.net/npm/@breadlee/icons/dist/icons.css" rel="stylesheet" />
<link
  as="font"
  crossOrigin="anonymous"
  href="https://cdn.jsdelivr.net/npm/@breadlee/icons/dist/icons.woff"
  rel="preload"
  type="font/woff"
/>
```

다음과 같이 불러와서 테스트하고 있습니다.

자세한 소스는 [GitHub](https://github.com/leeyc924/leeyc-package/tree/main/packages/icons)에서 확인가능합니다.
