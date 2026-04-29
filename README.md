# INOX Smart UI Demo

This project is a front-end-only React demo for reviewing INOX Smart SaaS UI v1.0 and preparing future UI v2.0 / v3.0 iterations. It does not connect to a backend yet; all data, permissions, relationships and interactions are mocked locally.

本项目是一个纯前端 React demo，用于评审 INOX Smart SaaS UI v1.0，并为后续 UI v2.0 / v3.0 迭代预留架构。当前暂不连接后端，所有数据、权限、关系和交互都在本地 mock。

## 1. Quick Start / 快速启动

```bash
npm install
npm run dev
```

Local URL / 本地地址:

```text
http://localhost:5173/
```

Build / 构建:

```bash
npm run build
```

Preview production build / 预览生产构建:

```bash
npm run preview
```

Netlify settings / Netlify 配置:

- Build command / 构建命令: `npm run build`
- Publish directory / 发布目录: `dist`
- SPA redirect / 单页应用回退: `/* -> /index.html`

## 2. Project Purpose / 项目目的

- Reproduce the current SaaS UI v1.0 hierarchy, interaction patterns, and responsive layout.
- Provide a realistic reference for Login, Dashboard, Properties, Units, Devices, Users, Calendar, Access, Occupancy, Security, Move-In, and Grant Access.
- Keep data model, routing, layout, and UI components extensible for future design versions.
- Make handoff easier for engineering teams through bilingual comments and this bilingual guide.

- 复刻当前 SaaS UI v1.0 的层级、交互和响应式布局。
- 为 Login、Dashboard、Properties、Units、Devices、Users、Calendar、Access、Occupancy、Security、Move-In、Grant Access 提供真实感参考。
- 保持数据模型、路由、布局和 UI 组件可扩展，便于未来设计版本迭代。
- 通过中英双语代码注释和本文档降低研发交接成本。

## 3. Main Concept / 核心层级概念

The product hierarchy follows this rule:

产品层级遵循这个规则：

```text
Property sidebar > Top module navigation > Page tabs / details / workflows
物业侧栏 > 顶部模块导航 > 页面 tab / 详情页 / 操作流程
```

- The top navigation separates functional modules: Dashboard, Properties, Units, Devices, Users, Calendar, Access, Occupancy, Security.
- The left property sidebar controls the active property context.
- Most module data is property-scoped. Different properties can have different units, devices, licenses, users, and credentials.
- Property, Unit, Device each has a stable unique ID.
- Users dedupe by email but also have their own unique ID.
- RFID, fingerprint and face credentials dedupe by `cardId`.
- Passcodes dedupe by passcode name within a property.

- 顶部导航用于区分核心功能模块：Dashboard、Properties、Units、Devices、Users、Calendar、Access、Occupancy、Security。
- 左侧物业侧栏用于切换当前物业上下文。
- 大多数模块数据都和当前物业相关，不同物业可以拥有不同的 Unit、Device、License、User、Credential。
- Property、Unit、Device 都有稳定唯一 ID。
- User 以 email 去重，同时也拥有自己的 unique ID。
- RFID、指纹、面容类凭证通过 `cardId` 去重。
- Passcode 在同一物业内通过 passcode name 去重。

## 4. Folder Structure / 目录结构

```text
inox-smart-ui-demo/
  public/reference-assets/      Static images used by login and header logos
                                登录页和导航 logo 使用的静态素材
  src/
    app/                        App route map and product shell controller
                                应用路由表与产品外壳控制
    components/                 Shared UI primitives
                                通用 UI 基础组件
    config/                     Navigation, table, filter and tab schemas
                                导航、表格、筛选、tab 配置
    demo/                       Demo-only global state and control bar
                                Demo 专用全局状态与测试控制条
    domain/                     Mock data, selectors, dedupe and permissions
                                mock 数据、选择器、去重规则、权限规则
    features/                   Product feature pages and workflows
                                产品功能页与操作流程
    i18n/                       Language dictionaries and translation hook
                                多语言字典与翻译 hook
    styles/                     Global tokens, layout and component CSS
                                全局变量、布局样式、组件样式
    ui-versions/                Version registry and v1/v2/v3 shells
                                UI 版本注册表与 v1/v2/v3 外壳
  netlify.toml                  Netlify build and SPA redirect settings
                                Netlify 构建与单页应用回退配置
  vite.config.js                Vite configuration
                                Vite 配置
```

## 5. Routing / 路由结构

Routes are defined in `src/app/App.jsx`.

路由定义在 `src/app/App.jsx`。

Main route pattern / 主路由形态:

```text
/demo/:uiVersion/property/:propertyId/:module
```

Examples / 示例:

```text
/demo/v1/property/p-1/dashboard
/demo/v1/property/p-1/units
/demo/v1/property/p-1/units/u-1
/demo/v1/property/p-1/access/grant
/demo/v1/property/p-1/occupancy/move-in
```

How to add a new route / 新增路由方式:

1. Add the page component under `src/features/`.
2. Add a `<Route>` entry in `src/app/App.jsx`.
3. If it should appear in the top nav, update `src/config/navigation.config.js`.
4. If it needs mock data, update `src/domain/mockData.js` and selectors in `src/domain/selectors.js`.

1. 在 `src/features/` 下新增页面组件。
2. 在 `src/app/App.jsx` 增加 `<Route>`。
3. 如果需要出现在顶部导航，更新 `src/config/navigation.config.js`。
4. 如果需要 mock 数据，更新 `src/domain/mockData.js` 和 `src/domain/selectors.js`。

## 6. UI Version Architecture / UI 版本架构

UI versions are selected by URL and demo controls.

UI 版本通过 URL 和 Demo Controls 进行切换。

Key files / 关键文件:

- `src/ui-versions/registry.js`: maps version IDs to shell components.
- `src/ui-versions/v1/V1Shell.jsx`: current v1.0 shell and navigation.
- `src/ui-versions/v2/V2Shell.jsx`: placeholder that currently reuses v1.
- `src/ui-versions/v3/V3Shell.jsx`: placeholder that currently reuses v1.

- `src/ui-versions/registry.js`：注册版本 ID 与外壳组件。
- `src/ui-versions/v1/V1Shell.jsx`：当前 v1.0 外壳与导航。
- `src/ui-versions/v2/V2Shell.jsx`：当前复用 v1 的占位版本。
- `src/ui-versions/v3/V3Shell.jsx`：当前复用 v1 的占位版本。

Recommended future approach / 后续推荐做法:

- Keep one shared data/domain layer.
- Build separate v2/v3 shells only when the global layout changes.
- Reuse feature pages when business structure is unchanged.
- Override visual design first through CSS variables in `src/styles/tokens.css`.

- 保持一套共享数据与 domain 层。
- 只有全局布局变化时才新增 v2/v3 shell。
- 业务结构不变时尽量复用 feature 页面。
- 视觉差异优先通过 `src/styles/tokens.css` 的 CSS 变量覆盖。

## 7. Global State / 全局状态

Global demo state lives in `src/demo/demoStore.js` and uses Zustand.

全局 demo 状态位于 `src/demo/demoStore.js`，使用 Zustand。

State fields / 状态字段:

- `uiVersion`: selected UI version, such as `v1`, `v2`, `v3`.
- `propertyId`: active property scope.
- `role`: demo permission role.
- `dataMode`: normal / empty / stress test mode placeholder.
- `authStatus`: `loggedIn` or `loggedOut`.
- `language`: active UI language, persisted to `localStorage`.
- `demoBarCollapsed`: whether Demo Controls is collapsed.

- `uiVersion`：当前 UI 版本，例如 `v1`、`v2`、`v3`。
- `propertyId`：当前物业上下文。
- `role`：demo 权限角色。
- `dataMode`：normal / empty / stress 等数据模式占位。
- `authStatus`：`loggedIn` 或 `loggedOut`。
- `language`：当前 UI 语言，持久化到 `localStorage`。
- `demoBarCollapsed`：Demo Controls 是否折叠。

## 8. Data Model / 数据模型

Mock data is stored in `src/domain/mockData.js`.

Mock 数据存放在 `src/domain/mockData.js`。

Main entities / 核心实体:

- `properties`: property cards, property sidebar, property details.
- `units`: unit list, unit details, Move-In unit picker.
- `devices`: device list, device details, Grant Access assignment.
- `users`: users list, user details, Move-In and Grant Access user selection.
- `credentials`: passcodes, RFIDs, fingerprints, Face ID records.
- `occupancyTransactions`: Move-In / Move-Out / Occupancy log rows.
- `securityAlerts`: Security Alert rows.
- `auditEvents`: Audit Trail rows.

- `properties`：物业卡片、物业侧栏、物业详情。
- `units`：Unit 列表、Unit 详情、Move-In Unit 选择器。
- `devices`：设备列表、设备详情、Grant Access 设备分配。
- `users`：用户列表、用户详情、Move-In 和 Grant Access 用户选择。
- `credentials`：Passcode、RFID、Fingerprint、Face ID 记录。
- `occupancyTransactions`：Move-In / Move-Out / Occupancy log 行。
- `securityAlerts`：Security Alert 行。
- `auditEvents`：Audit Trail 行。

Selector functions are in `src/domain/selectors.js`. They filter module rows by `propertyId`, tab, and module type.

选择器函数位于 `src/domain/selectors.js`，用于按 `propertyId`、tab 和模块类型过滤行数据。

Dedupe rules are centralized in `src/domain/dedupe.js`.

去重规则集中在 `src/domain/dedupe.js`。

## 9. Config-Driven UI / 配置驱动 UI

Most list pages are schema-driven.

多数列表页通过配置驱动。

Key file / 关键文件:

```text
src/config/schemas.js
```

Important exports / 重要导出:

- `filterSchemas`: Quick Search fields for each module.
- `tableSchemas`: DataTable columns for each module.
- `tabSchemas`: Tabs for Devices, Access, Occupancy, Security, and Unit Detail.

- `filterSchemas`：各模块 Quick Search 字段。
- `tableSchemas`：各模块 DataTable 列定义。
- `tabSchemas`：Devices、Access、Occupancy、Security、Unit Detail 的 tab 定义。

To add a new table column / 新增表格列:

1. Add a column object to the related `tableSchemas[module]`.
2. Ensure each row in mock data has the matching key.
3. If a new cell type is needed, update `renderCell()` in `src/components/ui.jsx`.

1. 在对应的 `tableSchemas[module]` 中增加列配置。
2. 确保 mock 数据中的每一行都有对应 key。
3. 如果需要新的单元格类型，更新 `src/components/ui.jsx` 里的 `renderCell()`。

## 10. Shared Components / 通用组件

Shared components are in `src/components/ui.jsx`.

通用组件位于 `src/components/ui.jsx`。

- `Button`: shared button style and behavior.
- `PageHeader`: page title, property label, export/action/filter buttons, property image.
- `SearchPanel`: schema-driven quick search form.
- `Tabs`: reusable horizontal tab component.
- `DataTable`: schema-driven table with edit/delete and optional row click.
- `Modal`: shared modal shell.
- `FormGrid`: read-only detail field grid.

- `Button`：共享按钮样式与行为。
- `PageHeader`：页面标题、物业标签、导出/操作/筛选按钮、物业图片。
- `SearchPanel`：配置驱动的快速搜索表单。
- `Tabs`：可复用横向 tab。
- `DataTable`：配置驱动表格，支持编辑/删除和可选整行点击。
- `Modal`：通用弹窗外壳。
- `FormGrid`：详情页只读字段网格。

Language menu is separated in `src/components/LanguageMenu.jsx`.

语言菜单独立在 `src/components/LanguageMenu.jsx`。

## 11. Feature Pages / 功能页面

Feature pages are in `src/features/`.

功能页面位于 `src/features/`。

- `LoginPage.jsx`: responsive login page with demo validation.
- `DashboardPage.jsx`: dashboard shortcuts, property overview, quick search, calendar, quick add.
- `EntityListPage.jsx`: generic list page for Properties, Units, Devices, Users, Access, Occupancy, Security.
- `EntityDetailPage.jsx`: Property Detail, Unit Detail, Device Detail, User Detail.
- `CalendarPage.jsx`: calendar module.
- `GrantAccessPage.jsx`: Grant Access credential assignment workflow.
- `MoveInPage.jsx`: Batch Move-In workflow.

- `LoginPage.jsx`：响应式登录页与 demo 校验。
- `DashboardPage.jsx`：仪表盘快捷入口、物业概览、快速搜索、日历、快速添加。
- `EntityListPage.jsx`：Properties、Units、Devices、Users、Access、Occupancy、Security 的通用列表页。
- `EntityDetailPage.jsx`：Property Detail、Unit Detail、Device Detail、User Detail。
- `CalendarPage.jsx`：日历模块。
- `GrantAccessPage.jsx`：Grant Access 凭证授权流程。
- `MoveInPage.jsx`：Batch Move-In 流程。

## 12. Move-In Workflow / Move-In 流程

File / 文件:

```text
src/features/MoveInPage.jsx
```

Flow / 流程:

1. Configure Move-In / Move-Out date and time.
2. Choose access methods: Mobile Access, E-Key, Passcode.
3. Choose role: Admin, Member, Guest.
4. Configure permissions and privacy.
5. Configure optional recurring schedule.
6. Select users.
7. Select units.
8. Review generated user-unit-device assignments.
9. Confirm and show a processing table.

1. 配置 Move-In / Move-Out 日期时间。
2. 选择访问方式：Mobile Access、E-Key、Passcode。
3. 选择角色：Admin、Member、Guest。
4. 配置权限与隐私。
5. 配置可选循环计划。
6. 选择用户。
7. 选择 Unit。
8. 复核生成的 user-unit-device 授权关系。
9. 确认后展示处理结果表。

Important internal state / 重要内部状态:

- `selectedUserIds`: selected users.
- `selectedUnitIds`: selected units.
- `selectedUnitDevices`: unit-to-device map.
- `groupedAssignments`: grouped summary by user.
- `resultRows`: flattened transaction rows after confirmation.

- `selectedUserIds`：已选用户。
- `selectedUnitIds`：已选 Unit。
- `selectedUnitDevices`：Unit 到 Device 的映射。
- `groupedAssignments`：按用户分组的授权摘要。
- `resultRows`：确认后的交易记录行。

## 13. Grant Access Workflow / Grant Access 流程

File / 文件:

```text
src/features/GrantAccessPage.jsx
```

Flow / 流程:

1. Select credential tab: Passcodes, RFIDs, Fingerprint, Face ID.
2. Select user and unit.
3. Configure credential-specific fields.
4. Configure date, permanent access, and recurring schedule.
5. Select assigned devices.
6. Submit and show an assignment confirmation.

1. 选择凭证 tab：Passcodes、RFIDs、Fingerprint、Face ID。
2. 选择用户和 Unit。
3. 配置该凭证类型的专属字段。
4. 配置日期、永久访问、循环计划。
5. 选择授权设备。
6. 提交并展示授权结果。

## 14. CSS Structure / CSS 结构

CSS files are intentionally split by responsibility.

CSS 按职责拆分。

- `src/styles/tokens.css`: colors, spacing, shell sizes, theme variables.
- `src/styles/layout.css`: product shell, top nav, property sidebar, mobile overlay.
- `src/styles/components.css`: shared components and feature page styles.
- `src/styles/index.css`: import order and global reset.

- `src/styles/tokens.css`：颜色、间距、外壳尺寸、主题变量。
- `src/styles/layout.css`：产品外壳、顶部导航、物业侧栏、移动端 overlay。
- `src/styles/components.css`：通用组件与功能页样式。
- `src/styles/index.css`：导入顺序与全局 reset。

Recommended style update order / 推荐样式调整顺序:

1. Try CSS variables in `tokens.css`.
2. If layout changes, update `layout.css`.
3. If a component or page changes, update `components.css`.
4. Keep responsive rules near the related component/page section when possible.

1. 优先尝试修改 `tokens.css` 的 CSS 变量。
2. 如果是全局布局变化，修改 `layout.css`。
3. 如果是组件或页面变化，修改 `components.css`。
4. 响应式规则尽量放在相关组件/页面样式附近。

## 15. Responsive Strategy / 响应式策略

Desktop / 桌面端:

- Top navigation stays visible.
- Property sidebar is expanded by default and manually collapsible.
- Main content shifts based on sidebar width.

- 顶部导航常驻显示。
- 物业侧栏默认展开，可手动折叠。
- 主内容根据侧栏宽度自动移动。

Mobile / 移动端:

- Top navigation collapses into a burger menu.
- Property sidebar becomes a 75% overlay drawer.
- A small property bar appears under the top nav to show and switch the current property.
- Tables should remain scrollable or become stacked cards when needed.

- 顶部导航折叠为 burger 菜单。
- 物业侧栏变为 75% 宽度 overlay 抽屉。
- 顶部导航下方显示当前物业的小副导航栏，用于打开物业切换。
- 表格在必要时保持横向滚动或转为堆叠卡片。

## 16. Internationalization / 多语言

Files / 文件:

```text
src/i18n/languages.js
src/i18n/useI18n.js
```

Rules / 规则:

- English UI text is the canonical key.
- Spanish and Chinese values are stored in `uiText`.
- User-generated data, such as property names, unit names, user names and device names, should not be translated.
- The active language is stored in browser `localStorage`, so refreshes and new tabs keep the latest selected language.

- 英文 UI 文案是稳定 key。
- 西语与中文显示值存放在 `uiText`。
- 用户自定义数据，例如物业名称、Unit 名称、用户名、设备名，不应翻译。
- 当前语言会存入浏览器 `localStorage`，刷新和新标签页会保留最新选择语言。

To add new UI text / 新增 UI 文案:

```js
'New Label': { es: 'Spanish Label', zh: '中文文案' },
```

Then use / 然后使用:

```jsx
const { t } = useI18n();
return <span>{t('New Label')}</span>;
```

## 17. How to Extend / 如何扩展

Add a new module / 新增模块:

1. Add module metadata in `src/config/navigation.config.js`.
2. Add filter/table/tab schemas in `src/config/schemas.js`.
3. Add mock data in `src/domain/mockData.js`.
4. Add selector logic in `src/domain/selectors.js`.
5. Add route in `src/app/App.jsx`.

1. 在 `src/config/navigation.config.js` 新增模块元信息。
2. 在 `src/config/schemas.js` 新增筛选/表格/tab 配置。
3. 在 `src/domain/mockData.js` 新增 mock 数据。
4. 在 `src/domain/selectors.js` 新增选择器逻辑。
5. 在 `src/app/App.jsx` 新增路由。

Add a new UI version / 新增 UI 版本:

1. Create `src/ui-versions/v4/V4Shell.jsx`.
2. Register it in `src/ui-versions/registry.js`.
3. Add visual overrides in `src/styles/tokens.css` or dedicated CSS.
4. Reuse existing feature pages unless interaction structure changes.

1. 创建 `src/ui-versions/v4/V4Shell.jsx`。
2. 在 `src/ui-versions/registry.js` 注册。
3. 在 `src/styles/tokens.css` 或独立 CSS 中添加视觉覆盖。
4. 除非交互结构变化，否则尽量复用现有 feature 页面。

Connect real APIs later / 后续接入真实 API:

1. Keep UI components unchanged as much as possible.
2. Replace mock arrays in `src/domain/mockData.js` with API adapters.
3. Keep selectors as the normalization layer.
4. Keep IDs stable and preserve dedupe rules.
5. Add loading, empty, error and permission-denied states per module.

1. 尽量不改 UI 组件。
2. 用 API adapter 替换 `src/domain/mockData.js` 中的 mock 数组。
3. 保留 selectors 作为数据归一化层。
4. 保持 ID 稳定，并保留去重规则。
5. 为各模块补充 loading、empty、error、permission-denied 状态。

## 18. Engineering Notes / 研发注意事项

- This is a UI/interaction reference, not a secure auth implementation.
- Login validation is local demo logic only.
- `dist` is currently present because Netlify can publish static output, but source files under `src/` are the real source of truth.
- Do not commit `node_modules`.
- Keep business logic out of `src/components/ui.jsx`; page-level behavior should live in `src/features/`.
- Keep entity IDs stable when changing mock data, because routes and relationships depend on them.
- When editing responsive layout, test desktop width, tablet width, and mobile width.

- 这是 UI/交互参考，不是安全认证实现。
- 登录校验只是本地 demo 逻辑。
- 当前包含 `dist` 是因为 Netlify 可以发布静态输出，但真正源代码以 `src/` 为准。
- 不要提交 `node_modules`。
- 不要把业务逻辑写进 `src/components/ui.jsx`，页面行为应放在 `src/features/`。
- 修改 mock 数据时保持实体 ID 稳定，因为路由和关系依赖这些 ID。
- 调整响应式布局时，请同时测试桌面、平板和移动端宽度。

## 19. Handoff Checklist / 交接检查清单

Before handoff or deployment / 交接或部署前:

```bash
npm run build
```

Check these screens / 建议检查页面:

- Login logged-out state.
- Dashboard.
- Properties grid and list.
- Unit list row click to Unit Detail.
- Unit Detail Move-In button.
- Occupancy Move-In workflow.
- Access Grant Access workflow.
- Language switch persistence after opening a new page.
- Desktop sidebar collapse and mobile property overlay.

- 未登录状态登录页。
- Dashboard。
- Properties 宫格与列表。
- Unit 列表整行点击到 Unit Detail。
- Unit Detail 的 Move-In 按钮。
- Occupancy 的 Move-In 流程。
- Access 的 Grant Access 流程。
- 切换语言后打开新页面是否保持语言。
- 桌面侧栏折叠和移动端物业 overlay。


## Quick Start / 快速启动

```bash
npm install
npm run dev
```

## Build / 构建

```bash
npm run build
```
