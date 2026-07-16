# Frontend Homepage Content And Mock Guide

This guide fixes the frontend content direction for the public `/` route and the matching user-side visual language. It should be read together with `docs/frontend-stack.md` and `docs/api-contract.md`.

Implementation status was last checked on 2026-07-15. This file defines the intended content/visual boundary; actual page data-source status and known DTO gaps are tracked in `docs/frontend-stack.md` and must not be inferred from this design guide.

## Content Review

The provided reference is viable as the visual direction, but its current page content is not suitable to be used unchanged as the public homepage.

- The screenshot content is a logged-in user workspace, centered on "我的收藏". That belongs to `/favorites`, not `/`.
- The public `/` route is defined as "商品首页/推荐流" in `docs/frontend-stack.md` and `frontend/src/app/routeCatalog.ts`; it should support browsing before login.
- The reference can be adapted by keeping the same information density, campus second-hand marketplace tone, search-first layout, left category navigation, product cards, and utility panels.
- The homepage should show public marketplace discovery. User-private collections, invalid favorites, batch management, and cancel-favorite actions should stay in `/favorites`.

## Route Boundary

`/` is the public marketplace homepage. It must prioritize:

- platform identity: "厦大闲置" / "厦门大学校园二手交易平台";
- global search by item name, category, and keyword;
- category navigation for textbooks, digital items, dorm supplies, sports/outdoor, daily goods, cosmetics/care, instruments/stationery, tickets/transfer, and others;
- recommended, latest, or nearby campus listings;
- filter entry points for category, price range, and delivery mode;
- item cards with contract-backed fields such as image, title, price, category, status, and created time;
- favorite, seller, delivery mode, or verification badges only when the current API DTO exposes the required fields;
- calls to publish, post demand, view demands, login, and campus verification, with protected actions allowed to redirect through login;
- light trust cues such as campus-only flow, safe offline pickup, and contract-backed verified states.

`/` must not make these user-private features the main page content:

- "我的收藏";
- "我的发布";
- "购买订单" or "出售订单";
- private message center;
- invalid favorites;
- batch management of selected favorites.

Those features should remain under authenticated user routes such as `/favorites`, `/items/mine`, `/orders/purchase`, `/orders/sale`, and `/messages`.

Current implementation note: the independent mobile homepage links demand calls to `/orders/purchase/demand*`; the desktop homepage still links to placeholder routes `/demands` and `/demands/new`. This is a known route-alignment issue, not evidence that the legacy routes are complete.

## Homepage Content Model

The first screen should be a functional marketplace surface, not a marketing landing page.

Current implementation entry: `frontend/src/features/item-market/HomePage.tsx`. Homepage data must come through the API boundary (`frontend/src/api/item.api.ts` and `frontend/src/api/category.api.ts`) so `VITE_USE_MOCKS=true` and later backend-backed mode keep the same component contract.

Recommended desktop layout:

- top bar: logo, platform name, global search, notification/message/user area;
- left rail: item categories and user route shortcuts;
- main area: homepage title or section title, filters, item grid, pagination or infinite loading;
- right panel: demand highlights, recently active categories, or campus trading tips.

Mobile/H5 is an independent composition rather than a compressed desktop grid. At widths up to `720px` it uses:

- a compact sticky brand row, search bar, and horizontally scrollable category strip;
- a fixed five-item bottom navigation for home, categories, publish, messages, and profile;
- publish-item and post-demand quick actions before the discovery feed;
- horizontally scrollable homepage section tabs and a collapsed filter drawer;
- a dense two-column item grid that exposes title, price, delivery mode, seller, verification, favorite count, and favorite action without requiring a detail-page visit;
- demand highlights, hot categories, and safety guidance after the primary product feed instead of occupying the first screen.

The shared mobile shell belongs in `components/marketplace/`; homepage-specific ordering and compact item cards belong in `features/item-market/`. Desktop keeps the existing top bar, left rail, three-column content area, and full filter panel.

Supporting marketplace pages must follow the same mobile information-density rule instead of stacking desktop-sized panels vertically. The current implementation applies these page-specific boundaries at widths up to `720px`:

- `/items` keeps filters collapsed by default behind an explicit toggle, uses horizontally scrollable filter choices when expanded, and shows the result toolbar plus a compact two-column item grid before secondary helpers;
- `/publish` uses a width-safe single-column form with compact image upload, full-width controls and two-column submit actions; desktop-only notice, review-flow and success helper panels are omitted from the mobile flow;
- `/messages` compresses the three statistics into one horizontal summary row, reuses the shared shell search instead of repeating the inner search, presents compact conversation rows, and omits the desktop helper panel.

These changes are responsive composition rules only. They do not change route protection, page data sources, API contracts or desktop layouts.

Recommended homepage sections:

- `今日推荐`: mixed high-quality on-sale items.
- `最新上架`: newest approved items.
- `教材专区`: seasonal textbooks and course materials.
- `数码好物`: laptops, earphones, calculators, keyboards, and accessories.
- `宿舍补给`: lamps, storage, suitcase, bedding, and small appliances.
- `校园抽象闲置`: a restrained mix inside `今日推荐`/`最新上架`, using real network meme imagery for fictional second-hand listings such as odd dolls, meme drink bundles, stickers, desk ornaments, pillows, and keychains. Public-figure or brand references must be labeled as unofficial meme naming rather than endorsements or licensed collaborations; images must be localized and source-tracked.
- `求购动态`: demand cards loaded from `GET /demands`; “更多” uses `/orders/purchase/demand`, and each card links to `/orders/purchase/demand/:id/detail`. `/demands` remains only a legacy placeholder route.

Use compact section labels. Avoid long explanatory copy inside the application surface.

## Fixed Visual Direction

The user-side frontend should follow the provided reference style:

- hand-drawn campus marketplace feel;
- warm paper-like background;
- blue as the primary action color;
- red reserved for price, unread badges, destructive actions, and favorite emphasis;
- light ink borders and sketched dividers;
- campus illustration accents used sparingly in sidebars or empty states;
- dense but readable marketplace layout;
- product cards with real item imagery or realistic mock images, never abstract placeholders for primary cards.

This does not override the technical stack. Implement with React, TypeScript, Vite, React Router, TanStack Query, Zustand where needed, Tailwind CSS, Ant Design for admin-heavy surfaces, lucide-react icons, and Motion for React within the limits in `docs/frontend-stack.md`.

## Painted Animation Direction

User-side pages should extend the same hand-painted style through animation. The animation source of truth is `docs/frontend-animation/README.md`.

- Emphasize the drawing process: brush sweeps, sketched reveals, ink-line drawing, and soft paper texture motion.
- Use Motion for React for page, region, card, and interaction transitions.
- Use CSS keyframes for painted image reveals, brush overlays, paper wash, and pencil texture effects.
- Keep mock mode renderable without backend startup, including illustrated empty states and animated cards.
- Respect `prefers-reduced-motion` and keep animation secondary to browsing and transaction tasks.

## Favorites Page Reference

The provided reference is the content and visual target for `/favorites`.

- Use the full hand-drawn marketplace shell shown in the reference: sketched top search, left category/user rail, tabbed favorites area, item card grid, and right invalid-favorites panel.
- Keep `/favorites` authenticated in route metadata, but mock mode may render the page without a real backend session during frontend development.
- The current mock item card may show seller nickname, verification state, delivery mode, favorite count, and favorite time. The real `GET /users/me/favorites` response does not currently define those fields; real-mode support requires an API/DTO change first.
- The invalid-favorites panel currently relies on mock-only metadata and non-`ON_SALE` items. The real response has `status` but no `invalidReason` or `favoritedAt`.
- Cancellation should call the favorite API boundary, then refresh or update the query cache. Components should not mutate mock arrays directly.

## Mock-First Development

Frontend business UI should be able to run without the backend service.

- Keep mock data in frontend-owned mock modules, for example under `frontend/src/features/<feature>/mocks/` or a shared `frontend/src/api/mock/` folder when reused.
- Mock DTOs should match `docs/api-contract.md`, including `priceCent`, enum values and pagination shape. The existing item/favorite mocks currently contain extra card display fields; this known debt is documented in `docs/project-state.md`.
- Do not add further mock-only fields to DTOs used by API modules. If the UI needs seller nickname, delivery modes, or favorite state in a real list card, update the backend response and `docs/api-contract.md` before treating them as contract fields.
- API modules should remain the boundary for backend calls. Components should consume hooks or API abstractions, not hardcoded mock objects directly.
- Homepage demand highlights and category-specific product pages must use their API wrappers in real mode; do not restore page-local arrays that can diverge from backend data.
- Use an explicit local switch such as `VITE_USE_MOCKS=true` if mock and live API modes coexist.
- Mock images should be stable local assets or deterministic remote-safe placeholders only when no local asset exists.
- Do not block frontend implementation on missing backend endpoints if the API contract already defines the response shape.

Minimum homepage mock content:

- at least 12 on-sale item cards across the major categories;
- at least 6 categories;
- at least 3 price bands;
- both `SELF_PICKUP` and `DELIVER_TO_SCHOOL` delivery modes where the contract exposes delivery data;
- seller or verification states only when supported by the current API contract;
- empty states for no search result and no category result;
- loading and error states for list queries;
- mobile/H5 layout data parity with desktop.

Suggested mock item titles:

- "高等数学（第七版）上下册";
- "MacBook Air 2019 13 寸";
- "护眼台灯 可调光";
- "斯伯丁篮球 室内外 7 号球";
- "机械键盘 青轴";
- "20 寸行李箱 九成新";
- "AirPods 二代";
- "卡西欧计算器 fx-991CN X";
- "宿舍收纳箱 三件套";
- "羽毛球拍双拍";
- "考研英语真题";
- "小米显示器 24 寸".

## Acceptance Checklist

Before a frontend homepage change is considered done:

- `/` reads as a public marketplace homepage, not a personal center page.
- `/favorites` remains the home for favorite management content from the reference.
- Search, category, filter, item card, empty, loading, and error states are represented.
- Mock mode can render the complete page without backend startup.
- Layout works on desktop and H5 widths.
- Implementation follows `docs/frontend-stack.md` and API fields follow `docs/api-contract.md`.
