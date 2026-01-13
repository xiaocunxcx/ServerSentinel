# Spec-Driven 开发说明

本目录用于存放功能规格（Spec）文档，作为“需求 -> 设计 -> 任务 -> 实现 -> 测试”的中心事实来源。

## 使用方式

1. 新功能或重大改动先创建 Spec（参考 `docs/specs/TEMPLATE.md`）。
2. Spec 评审通过后，更新 `docs/design.md` 与 `docs/task.md` 中对应内容。
3. 代码实现与测试必须覆盖 Spec 中的验收标准与边界条件。

## 文件组织建议

- `docs/specs/NNNN-short-title.md`
  - NNNN 取自需求/功能编号（如 FR-RES-01 对应 0101）。
  - short-title 用英文短名（如 `reservation-conflict.md`）。

## 最小交付标准

- 关键流程与错误码明确。
- 数据模型与状态机清晰。
- 边界条件与时区/时间语义写清。
- 测试计划可直接落地到测试用例。
