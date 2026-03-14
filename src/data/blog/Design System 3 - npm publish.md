---
title: "Design System 3. npm publish"
pubDatetime: 2024-02-02
description: npm에 패키지를 배포하는 방법
tags: ["개인", "Frontend"]
---

이전 글에서 eslint tsconfig 파일을 구성하였으니 해당 파일을 publish하여 나의 어디 프로젝트는 사용할수 있게 할것이다

우선 npm login 을 해준다

```bash
npm login
>>> npm notice Log in on https://registry.npmjs.org/
>>> Login at:
>>> https://www.npmjs.com/login?next=/login/cli/...
>>> Press ENTER to open in the browser...

>>> Logged in on https://registry.npmjs.org/.


npm whoami
>>> leeyc924
```

npm publish을 하여 해당 패키지를 publish해준다

```bash
npm publish
>>> npm WARN publish npm auto-corrected some errors in your package.json when publishing.  Please run "npm pkg fix" to address these errors.
>>> npm WARN publish errors corrected:
>>> npm WARN publish Removed invalid "scripts"
>>> npm notice
>>> npm notice 📦  @breadlee/tsconfig@0.0.1
>>> npm notice === Tarball Contents ===
>>> npm notice 695B base.json
>>> npm notice 418B nextjs.json
>>> npm notice 126B package.json
>>> npm notice 166B react-library.json
>>> npm notice === Tarball Details ===
>>> npm notice name:          @breadlee/tsconfig
>>> npm notice version:       0.0.1
>>> npm notice filename:      breadlee-tsconfig-0.0.1.tgz
>>> npm notice package size:  711 B
>>> npm notice unpacked size: 1.4 kB
>>> npm notice shasum:        a99970836c3972e2760aa9e8bed1c6b1b8b28233
>>> npm notice integrity:     sha512-Q64V+mzjvrKF+[...]bFiZ8el1aLiVQ==
>>> npm notice total files:   4
>>> npm notice
>>> npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access
>>> + @breadlee/tsconfig@0.0.1
```
