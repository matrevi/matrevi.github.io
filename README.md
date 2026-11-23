# 元子矩阵 · matrevi

元子矩阵为企业定制 AI 工作流与业务软件。我们从一项具体操作入手，用真实样本验证效果，再把数据输入、模型处理、人工复核和结果回写接入现有系统。

[访问官网](https://matrevi.com/) · [查看业务宣传册（PDF）](https://github.com/matrevi/matrevi-brochure/blob/main/main.pdf) · [联系团队](https://matrevi.com/#contact)

[![元子矩阵官网首页，展示企业 AI 工作流定制与实施服务](.github/homepage.jpg)](https://matrevi.com/)

## 三个项目，三种工作流

| 项目 | 谁在用，怎样用 |
| --- | --- |
| 麦伙计 | 门店运营人员准备货盘和话术，安排直播班次。工作台按排期上麦、回应弹幕，店员可随时接管。 |
| 舞承智学 | 民族舞学员跟随示范分段练习，通过姿态比对查看关节角度和节奏偏差，再回看练习记录。 |
| dramai | 短剧创作者把剧本拆为集、场和镜头，确认角色与场景后生成分镜。修改单个镜头时可以局部重算。 |

[浏览案例与产品截图](https://matrevi.com/#cases) · [查看 dramai 源码](https://github.com/hyyyyyyz/dramai)

## 项目如何交付

双方先确定优先处理的环节和预期产出，再用日常及异常样本试跑。业务人员确认结果后，团队开发功能、对接数据与权限，最后沿真实流程验收，移交配置与操作手册。官网以单据字段提取为例，说明如何核对准确率、处理耗时和人工接管流程。

[交付流程](https://matrevi.com/#delivery) · [验收与报价](https://matrevi.com/#acceptance) · [核心团队](https://matrevi.com/#team)

## 本地预览与维护

网站使用 HTML、CSS 和原生 JavaScript。在仓库根目录运行以下命令，即可在浏览器打开本地预览。

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

[打开本地预览](http://127.0.0.1:8000/)

| 修改内容 | 对应文件 |
| --- | --- |
| 业务文案、案例、团队与联系方式 | [index.html](index.html) |
| 品牌配色和移动端排版 | [site.css](site.css) |
| 首屏矩阵插画、目录滚动高亮 | [matrix.js](matrix.js)、[navigation.js](navigation.js) |
| 品牌标识、产品截图和团队照片 | [assets/](assets/) |

GitHub Pages 从 `main` 分支根目录发布，正式域名由 [CNAME](CNAME) 指定。宣传册 PDF 和 LaTeX 源码在[宣传册仓库](https://github.com/matrevi/matrevi-brochure)维护。
