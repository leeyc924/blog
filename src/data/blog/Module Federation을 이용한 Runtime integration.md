---
title: "[Micro Frontend] Module Federation을 이용한 Runtime integration"
pubDatetime: 2024-01-29
description: Webpack 5 Module Federation을 활용한 마이크로 프론트엔드 구현
tags: ["개인", "Frontend"]
---

## Module Federation 이란?

JavaScript 아키텍처의 한 유형으로, "단일 Webpack 빌드에 포함된 모듈뿐만 아니라 여러 서버에 배포되어 있는 원격 모듈을 하나의 애플리케이션에서 로딩할 수 있는 기능"입니다. Webpack 5부터 코어로 추가되었습니다.

웹 애플리케이션을 여러 독립적인 모듈로 분할하고, 동적으로 로드/언로드할 수 있는 아키텍처입니다. 각 모듈은 독립적으로 개발되고 배포되며, 필요에 따라 동적으로 통합됩니다.

### 핵심 이점

- 모듈별 독립적 개발 및 배포로 전체 영향도 최소화
- 동적 로딩으로 초기 로딩 속도 최적화
- 확장성과 유연성 향상

## 용어

- **Host**: 페이지 로드 시 처음 초기화되는 Webpack 빌드. 런타임에 Remote를 로드할 수 있습니다.
- **Remote**: 다른 Webpack 빌드로, 일부가 Host에 의해 사용됩니다.
- **양방향 호스트**: Host 또는 Remote로 작동 가능한 번들
- **전방향 호스트**: 시작 시 Host인지 Remote인지 불명확한 호스트

## 기대효과

| 항목 | 기존 방식 | Module Federation |
|------|---------|------------------|
| 빌드 범위 | 작은 변경도 전체 빌드 필요 | 변경된 컨테이너만 빌드 |
| 영향도 | 전체 서비스 검증 필요 | 해당 컨테이너 범위만 검증 |
| 로딩 시간 | 전체 빌드 변경으로 오래 소요 | 변경 모듈만 새로 로드 |

## 구현

### Remote (React v18.2.0, Webpack 5, TypeScript)

```typescript
// Component
import '../../tailwind.css';

export interface NavbarProps {}

const Navbar = () => {
  return (
    <ul className="flex gap-1">
      <li className="flex justify-center items-center border-solid border-b-2">
        <a href="https://www.naver.com">네이버</a>
      </li>
      <li className="flex justify-center items-center border-solid border-b-2">
        <a href="https://google.com">구글</a>
      </li>
      <li className="flex justify-center items-center border-solid border-b-2">
        <a href="https://www.daum.net">다음</a>
      </li>
    </ul>
  );
};

export default Navbar;
```

```javascript
// webpack.config.js
const path = require('path');
const { EnvironmentPlugin } = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

module.exports = (_, argv) => ({
  devServer: {
    static: { directory: path.resolve(__dirname) },
    port: 3000,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-env',
            ],
            plugins: ['@babel/transform-runtime'],
          },
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote',
      filename: 'remoteEntry.a350ed3e.js',
      exposes: {
        './Navbar': './src/components/Navbar/index.tsx',
      },
      shared: {
        ...deps,
      },
    }),
    new HtmlWebPackPlugin({
      template: './public/index.html',
    }),
  ],
  output: {
    chunkFilename: '[id].a350ed3e.bundle.js',
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components/index.ts'),
    },
  },
});
```

### Host (Next.js, SCSS, TypeScript)

```bash
pnpm add -D @module-federation/nextjs-mf
```

```javascript
// next.config.js
const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, options) {
    const { isServer } = options;
    if(!isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'host',
          remotes: {
            remote: `remote@http://localhost:4000/remoteEntry.a350ed3e.js`,
          },
          filename: 'static/chunks/remoteEntry.a350ed3e.js',
        }),
      );
    }
    return config;
  },
};

module.exports = nextConfig;
```

```typescript
// Component
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import('remote/Navbar'), {
  ssr: false,
  loading: () => <>...loading</>
})

export default function Home() {
  return (
    <div>
      hello world
      <Navbar />
    </div>
  );
}
```

## 동작 방식

- **main.js**: 앱 초기화 역할. 가장 먼저 로드되는 청크로 Container Reference 처리 및 createRoot 등 필요한 코드 포함
- **remoteEntry.js**: Container를 가진 Micro App 초기화 청크. 마이크로 앱을 import할 때 가장 먼저 호출됨
- **XXX.js**: 공유 의존성 청크 및 본문 청크. main.js와 remoteEntry.js의 런타임 처리로 로드 제어됨

Runtime Integration 흐름:
- Host (http://localhost:3000)에서 Remote (http://localhost:4000)의 remoteEntry.a350ed3e.js 호출
- 필요한 모듈 청크들을 동적으로 로드하여 통합

## 참고자료

- https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669
- https://martinfowler.com/articles/micro-frontends.html
- https://fe-developers.kakaoent.com/2022/220623-webpack-module-federation/
- https://maxkim-j.github.io/posts/module-federation-concepts/
