# FitMate Server

사용자 이미지와 선택 조건을 받아 AI 모델 서버와 통신하는 FitMate 백엔드 서버입니다.

- Framework: NestJS + TypeScript
- Package manager: pnpm
- API prefix: `/api`
- API version: `/v1`
- Base URL: `http://localhost:3000/api/v1`

## 실행

```bash
pnpm install
pnpm start:dev
```

운영 빌드:

```bash
pnpm build
pnpm start:prod
```

## 환경변수 (예시)

```env
NODE_ENV=dev
NODE_PORT=3000
AI_MODEL_URL=http://localhost:8000
```

| 이름           | 설명              |
| -------------- | ----------------- |
| `NODE_ENV`     | `dev` 또는 `prod` |
| `NODE_PORT`    | 서버 실행 포트    |
| `AI_MODEL_URL` | AI 모델 서버 주소 |

## 공통 정책

- 전역 prefix는 `/api`입니다.
- URI versioning을 사용하므로 현재 API는 `/api/v1` 아래에 있습니다.
- 전역 `ValidationPipe`가 적용됩니다.
  - DTO에 없는 요청 필드는 거절됩니다.
  - query/body 값은 DTO 타입에 맞게 변환됩니다.
- 전역 `ClassSerializerInterceptor`가 적용됩니다.
  - 응답 DTO에 노출된 필드만 클라이언트 응답으로 사용합니다.

## 파일 저장 구조

```txt
public/
├── temp/  # 업로드 직후 임시 이미지
└── user/  # fitting 성공 후 device-id 기준으로 저장되는 이미지
```

- `public/temp`의 임시 파일은 cron 작업으로 정리됩니다.
- `public/user`에는 디바이스 ID당 이미지 1개가 유지됩니다.

## 인증 헤더

`POST /fitting`은 `device-id` 헤더가 필요합니다.

```http
device-id: test-device-id-1234
```

허용 형식:

- 영문
- 숫자
- `_`
- `-`
- 길이 8~128자

## API

### 1. 유저 이미지 업로드

```http
POST /api/v1/user/image
Content-Type: multipart/form-data
```

#### Request

| field   | type | required | 설명               |
| ------- | ---- | -------- | ------------------ |
| `image` | file | yes      | 사용자 이미지 파일 |

허용 파일:

- `image/jpeg`
- `image/png`
- `image/webp`
- 최대 10MB

#### Response

```json
{
  "filename": "15f7b996-74c1-4757-bf9e-00352109c059_1753520645048.png"
}
```

`filename`은 이후 fitting 요청의 `userImageName`으로 사용합니다.

#### curl

```bash
curl -X POST http://localhost:3000/api/v1/user/image \
  -F "image=@./user.png"
```

### 2. 옷 추천 리스트 조회

```http
GET /api/v1/outfit
```

#### Query

| name       | type   | required | 설명                |
| ---------- | ------ | -------- | ------------------- |
| `part`     | enum   | yes      | 추천 받을 착용 부위 |
| `minPrice` | number | yes      | 최소 가격           |
| `maxPrice` | number | yes      | 최대 가격           |

`part` 값:

```txt
FULL, TOP, BOTTOM, OUTER, DRESS, SHOES, HAT
```

검증:

- `minPrice >= 0`
- `maxPrice >= 0`
- `maxPrice <= 500000`
- `minPrice <= maxPrice`

#### Response

```json
[
  {
    "image": "https://example.com/outfit.png",
    "brand": "FitMate",
    "name": "오버핏 셔츠",
    "price": 39000,
    "link": "https://example.com/products/1"
  }
]
```

#### curl

```bash
curl "http://localhost:3000/api/v1/outfit?part=TOP&minPrice=10000&maxPrice=50000"
```

### 3. 가상 피팅 이미지 생성

```http
POST /api/v1/fitting
Content-Type: application/json
device-id: test-device-id-1234
```

#### Request Body

| field            | type   | required | 설명                            |
| ---------------- | ------ | -------- | ------------------------------- |
| `userImageName`  | string | yes      | `/user/image` 응답의 `filename` |
| `outfitImageUrl` | string | yes      | 피팅할 옷 이미지 URL            |

`userImageName`은 서버가 생성한 파일명 형식만 허용합니다.

```txt
uuid_timestamp.jpg
uuid_timestamp.jpeg
uuid_timestamp.png
uuid_timestamp.webp
```

`outfitImageUrl` 조건:

- `http` 또는 `https`
- 내부망/loopback IP 차단
- 응답 content-type은 `jpeg`, `png`, `webp`만 허용
- 최대 응답 크기 10MB

#### Request Example

```json
{
  "userImageName": "15f7b996-74c1-4757-bf9e-00352109c059_1753520645048.png",
  "outfitImageUrl": "https://example.com/outfit.png"
}
```

#### Response

```json
{
  "image": "base64-encoded-fitting-image"
}
```

#### curl

```bash
curl -X POST http://localhost:3000/api/v1/fitting \
  -H "Content-Type: application/json" \
  -H "device-id: test-device-id-1234" \
  -d '{
    "userImageName": "15f7b996-74c1-4757-bf9e-00352109c059_1753520645048.png",
    "outfitImageUrl": "https://example.com/outfit.png"
  }'
```

## AI 모델 서버 연동

서버는 `AI_MODEL_URL`을 기준으로 AI 모델 서버에 요청합니다.

| 내부 호출                     | 설명                       |
| ----------------------------- | -------------------------- |
| `GET {AI_MODEL_URL}/outfit`   | 옷 추천 리스트 요청        |
| `POST {AI_MODEL_URL}/fitting` | 가상 피팅 이미지 생성 요청 |

AI 서버 요청 timeout은 10초입니다.

## 주요 디렉토리

```txt
src/
├── auth/     # device-id guard/decorator
├── user/     # 이미지 업로드 및 temp cleanup
├── outfit/   # 옷 추천 API
└── fitting/  # 가상 피팅 API
```

## 검증

```bash
pnpm build
```
