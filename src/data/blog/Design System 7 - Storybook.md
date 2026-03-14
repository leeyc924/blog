---
title: "Design System 7. Storybook"
pubDatetime: 2024-02-23
description: Vite 기반 Storybook 구성 및 Chromatic 배포
tags: ["개인", "Frontend"]
---

Storybook은 React, Angular, Vue 등의 분리된 UI 컴포넌트를 체계적이고 효율적으로 구축할 수 있는 개발 도구입니다.

UI 컴포넌트 라이브러리의 문서화(documentation)를 위해 사용할 수도 있고 디자인 시스템(Design system)을 개발하기 위한 플랫폼으로 사용할 수도 있습니다.

## Directory

Vite 기반으로 프로젝트를 구성하였습니다.

- `.storybook`: storybook config 관련 파일들이 있습니다
- `stories`:
  - `Components`: @breadlee/ui 에서 개발한 컴포넌트들의 story들입니다
  - `Display`: Icon, Palette 등 display용도의 story입니다
- `storybook-static`: storybook build시 생성되는 정적 파일들입니다

## Config

```javascript
// .storybook/main.js
import { mergeConfig } from "vite";
import { resolve } from 'path';
const UI_PATH = resolve("../../packages/ui");

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: true,
  },
  async viteFinal(config) {
    return mergeConfig({
      ...config,
      resolve: {
        alias: [
          {
            find: '@styles',
            replacement: `${UI_PATH}/src/styles`
          },
          {
            find: "@components",
            replacement: `${UI_PATH}/src/components`,
          },
          {
            find: "@types",
            replacement: `${UI_PATH}/src/types`,
          },
          {
            find: "@hooks",
            replacement: `${UI_PATH}/src/hooks`,
          },
          {
            find: "@icons",
            replacement: resolve("../../packages/icons/dist"),
          },
        ],
      },
      define: {
        "process.env": {},
      },
      css: {
        postcss: null,
      },
    });
  },
};

export default config;
```

## Example

```typescript
// Components/TextField.stories.tsx
import { TextField, TextFieldProps } from '@components';
import { Meta, StoryObj } from '@storybook/react';

const story: Meta<TextFieldProps> = {
  component: TextField,
  tags: ['autodocs'],
  parameters: {},
};

export default story;

export const Default: StoryObj<TextFieldProps> = {
  args: {
    placeholder: 'TextField',
  },
};
```

Palette는 MDX로 작성할 수도 있지만 직접 story를 작성하였습니다.

```typescript
// Display/Palette.stories.tsx
import { Typography } from '@components';
import { Meta, StoryObj } from '@storybook/react';
import { palette } from '@styles';
import { useEffect, useRef, useState } from 'react';

interface PaletteProps {
  color?: keyof typeof palette;
}

const ColorItem = ({ className, name }: { name: string; className: string }) => {
  const [color, setColor] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      const computedStyle = getComputedStyle(ref.current);
      const color = computedStyle.getPropertyValue('background-color');
      const regex = /(\d+), (\d+), (\d+)/;
      const match = color.match(regex);
      if (!match) return;

      const r = parseInt(match[1]).toString(16).padStart(2, '0').toUpperCase();
      const g = parseInt(match[2]).toString(16).padStart(2, '0').toUpperCase();
      const b = parseInt(match[3]).toString(16).padStart(2, '0').toUpperCase();

      setColor(`#${r}${g}${b}`);
    }
  }, [className]);

  return (
    <div key={name} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 5 }}>
      <div
        ref={ref}
        style={{
          backgroundColor: className,
          width: '100%',
          height: '48px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0 1px 3px 0',
          border: '1px solid hsla(203, 50%, 30%, 0.15)',
        }}
      ></div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography color="Gray800" variant="D2">
          {name}
        </Typography>
        <Typography color="Gray800" variant="D2">
          {color}
        </Typography>
      </div>
    </div>
  );
};

const ColorItemList = ({ title }: { title: string }) => {
  const colors = Object.entries(palette).filter(([name]) => name.includes(title));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <Typography color="Gray900" variant="H4">
          {title}
        </Typography>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        {colors.map(([name, className]) => (
          <ColorItem className={className} key={name} name={name} />
        ))}
      </div>
    </div>
  );
};

const Palette = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      <ColorItemList title="Primary" />
      <ColorItemList title="Secondary" />
      <ColorItemList title="Tertiary" />
      <ColorItemList title="Error" />
      <ColorItemList title="Background" />
      <ColorItemList title="Surface" />
      <ColorItemList title="Blue" />
      <ColorItemList title="Gray" />
      <ColorItemList title="Black" />
      <ColorItemList title="White" />
    </div>
  );
};

const story: Meta<PaletteProps> = {
  component: Palette,
  parameters: {
    docs: {
      description: {
        component: 'Display palette',
      },
    },
  },
};

export default story;

export const Default: StoryObj = {
  render() {
    return <Palette />;
  },
};
```

## Publish

배포는 Chromatic을 활용하여 배포해주었습니다.

[https://65d092e55038add0e921289f-xwvphhjnrf.chromatic.com/](https://65d092e55038add0e921289f-xwvphhjnrf.chromatic.com/)

자세한 소스는 여기서 확인가능합니다:

[https://github.com/leeyc924/leeyc-package/tree/main/apps/storybook](https://github.com/leeyc924/leeyc-package/tree/main/apps/storybook)
