/*
 * Copyright 2024 Lei Cao
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {markedHighlight} = globalThis.markedHighlight;
let postprocessMarkdown = "";
let isScrollingFromScript = false;
let customCss = "";
let highlightCss = "";
// ------- marked.js默认配置开始 -------
// 处理frontMatter的函数
function preprocess(markdown) {
    const { attributes, body } = window.frontMatter(markdown);
    let head = "";
    if (attributes['title']) {
        head = "# " + attributes['title'] + "\n\n";
    }
    if (attributes['description']) {
        head += "> " + attributes['description'] + "\n\n";
    }
    postprocessMarkdown = head + body;
    return postprocessMarkdown;
}
marked.use({ hooks: { preprocess } }); // marked加载frontMatter函数
marked.use(markedHighlight({ // marked加载highlight函数
    langPrefix: "hljs language-",
    highlight: function(code, language) {
        language = hljs.getLanguage(language) ? language : "plaintext";
        return hljs.highlight(code, { language: language }).value;
    }
}));
// 自定义渲染器
const renderer = marked.Renderer;
const parser = marked.Parser;

// 重写渲染标题的方法（h1 ~ h6）
renderer.heading = function(heading) {
    const text = parser.parseInline(heading.tokens);
    const level = heading.depth;
    // 返回带有 span 包裹的自定义标题
    return `<h${level}><span>${text}</span></h${level}>\n`;
};
// 重写渲染paragraph的方法以更好的显示行间公式
renderer.paragraph = function(paragraph) {
    const text = paragraph.text;
    if (text.length > 4 && (/\$\$[\s\S]*?\$\$/g.test(text) || /\\\[[\s\S]*?\\\]/g.test(text))) {
        return `${text}\n`;
    } else {
        return `<p>${parser.parseInline(paragraph.tokens)}</p>\n`;
    }
};

// 配置 marked.js 使用自定义的 Renderer
marked.use({
    renderer: renderer
});
// ------- marked.js默认配置完毕 -------
function getScrollFrame() {
    const height = document.body.scrollHeight;
    const width = document.getElementById("wenyan").offsetWidth;
    const fullWidth = document.body.scrollWidth;
    return { width, height, fullWidth }
}
function setStylesheet(id, href) {
    const style = document.createElement("link");
    style.setAttribute("id", id);
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("href", href);
    document.head.appendChild(style);
}
function setContent(content) {
    document.getElementById("wenyan")?.remove();
    const container = document.createElement("section");
    container.innerHTML = marked.parse(content);
    container.setAttribute("id", "wenyan");
    container.setAttribute("class", "preview");
    document.body.appendChild(container);
    MathJax.typeset();
}
function setPreviewMode(mode) {
    document.getElementById("style")?.remove();
    setStylesheet("style", mode);
}
function setCustomTheme(css) {
    document.getElementById("theme")?.remove();
    const style = document.createElement("style");
    style.setAttribute("id", "theme");
    customCss = replaceCSSVariables(css);
    style.textContent = customCss;
    document.head.appendChild(style);
}
function setHighlight(css) {
    document.getElementById("hljs")?.remove();
    if (css) {
        const style = document.createElement("style");
        style.setAttribute("id", "hljs");
        highlightCss = css;
        style.textContent = css;
        document.head.appendChild(style);
    } else {
        css = "";
    }
}
function getContent() {
    const wenyan = document.getElementById("wenyan");
    const clonedWenyan = wenyan.cloneNode(true);
    const elements = clonedWenyan.querySelectorAll("mjx-container");
    elements.forEach(element => {
        const math = element.getAttribute("math");
        const parent = element.parentElement;
        element.remove();
        parent.innerHTML = math;
    });
    return clonedWenyan.outerHTML;
}
function getContentWithMathImg() {
    const wenyan = document.getElementById("wenyan");
    const clonedWenyan = wenyan.cloneNode(true);
    const elements = clonedWenyan.querySelectorAll("mjx-container");
    elements.forEach(element => {
        const math = element.getAttribute("math");
        const parent = element.parentElement;
        element.remove();
        let img = document.createElement("img");
        img.setAttribute("alt", math);
        img.setAttribute("data-eeimg", "true");
        img.setAttribute("style", "margin: 0 auto; width: auto; max-width: 100%;");
        parent.appendChild(img);
    });
    return clonedWenyan.outerHTML;
}
function getContentForGzh() {
    const wenyan = document.getElementById("wenyan");
    const clonedWenyan = wenyan.cloneNode(true);
    // 处理公式
    let elements = clonedWenyan.querySelectorAll("mjx-container");
    elements.forEach(element => {
        const svg = element.querySelector('svg');
        svg.style.width = svg.getAttribute("width");
        svg.style.height = svg.getAttribute("height");
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        const parent = element.parentElement;
        element.remove();
        parent.appendChild(svg);
        if (parent.classList.contains('block-equation')) {
            parent.setAttribute("style", "text-align: center; margin-bottom: 1rem;");
        }
    });
    // 读取主题css样式
    const stylesheets = document.styleSheets;
    let stylesMap = new Map();
    Array.from(stylesheets).forEach(sheet => {
        Array.from(sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSStyleRule) {
                if (rule.selectorText.startsWith("#wenyan")) {
                    let styleObject = new Map();
                    for (let i = 0; i < rule.style.length; i++) {
                        const property = rule.style[i];
                        styleObject.set(property, rule.style.getPropertyValue(property));
                    }
                    stylesMap.set(rule.selectorText, styleObject);
                }
            }
        });
    });
    // console.log(stylesMap);
    // 公众号不支持css伪元素，将伪元素样式提取出来拼接成一个span
    elements = clonedWenyan.querySelectorAll('h1, h2, h3, h4, h5, h6, blockquote');
    elements.forEach(element => {
        const afterRresults = Array.from(stylesMap)
            .filter(([key, value]) =>
                key.includes(element.tagName.toLowerCase() + "::after")
            )
            .map(([key, value]) => value).reduce((acc, map) => {
                map.forEach((value, key) => {
                    acc.set(key, value);
                });
                return acc;
            }, new Map());
        const beforeRresults = Array.from(stylesMap)
            .filter(([key]) =>
                key.includes(element.tagName.toLowerCase() + "::before")
            )
            .map(([key, value]) => value).reduce((acc, map) => {
                map.forEach((value, key) => {
                    acc.set(key, value);
                });
                return acc;
            }, new Map());
        if (afterRresults.size > 0) {
            element.appendChild(buildPseudoSpan(afterRresults));
        }
        if (beforeRresults.size > 0) {
            element.insertBefore(buildPseudoSpan(beforeRresults), element.firstChild);
        }
    });
    return `${clonedWenyan.outerHTML.replace(/class="mjx-solid"/g, 'fill="none" stroke-width="70"')}<style>${removeComments(customCss)}${removeComments(highlightCss)}</style>`;
}
function getContentForMedium() {
    const wenyan = document.getElementById("wenyan");
    const clonedWenyan = wenyan.cloneNode(true);
    // 处理blockquote，移除<p>标签
    clonedWenyan.querySelectorAll('blockquote p').forEach(p => {
        const span = document.createElement('span');
        span.innerText = p.innerText + "\n\n";
        p.replaceWith(span);
    });
    // 处理代码块
    clonedWenyan.querySelectorAll('pre').forEach(p => {
        const code = p.querySelector('code');
        p.setAttribute("data-code-block-lang", "none");
        if (code) {
            // 获取 class 属性
            const classAttribute = code.getAttribute('class');
            // 提取语言
            if (classAttribute) {
                const language = classAttribute.split(' ').find(cls => cls.startsWith('language-')).replace('language-', '');
                if (language) {
                    p.setAttribute("data-code-block-lang", language);
                }
            }
            // 获取所有子 span 元素
            const spans = code.querySelectorAll('span');

            // 遍历每个 span 元素，将它们替换为它们的文本内容
            spans.forEach(span => {
                span.replaceWith(...span.childNodes); // 只替换标签，保留内容
            });
            // 如果不删除多余的换行符，编辑器会把代码块分割，暂时未找到好的解决方法
            code.innerHTML = code.innerHTML.replace(/\n+/g, '\n');
        }
        p.setAttribute("data-code-block-mode", "2");
    });
    // 处理table，转成ascii格式
    clonedWenyan.querySelectorAll('table').forEach(t => {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.innerText = tableToAsciiArt(t);
        pre.appendChild(code);
        pre.setAttribute("data-code-block-lang", "none");
        pre.setAttribute("data-code-block-mode", "2");
        t.replaceWith(pre);
    });
    // 处理嵌套ul li
    clonedWenyan.querySelectorAll('ul ul').forEach(ul => {
        transformUl(ul);  // 处理每个 <ul>
    });
    // 原样输出公式
    clonedWenyan.querySelectorAll("mjx-container").forEach(element => {
        const math = element.getAttribute("math");
        const parent = element.parentElement;
        element.remove();
        parent.innerHTML = math;
    });
    return clonedWenyan.outerHTML;
}
function getPostprocessMarkdown() {
    return postprocessMarkdown;
}
function scroll(scrollFactor) {
    isScrollingFromScript = true;
    window.scrollTo(0, document.body.scrollHeight * scrollFactor);
    requestAnimationFrame(() => isScrollingFromScript = false);
}
function addFootnotes(listStyle) {
    let footnotes = [];
    let footnoteIndex = 0;
    const links = document.querySelectorAll('a[href]'); // 获取所有带有 href 的 a 元素
    links.forEach((linkElement) => {
        const title = linkElement.textContent || linkElement.innerText;
        const href = linkElement.getAttribute("href");
        
        // 添加脚注并获取脚注编号
        footnotes.push([++footnoteIndex, title, href]);
        
        // 在链接后插入脚注标记
        const footnoteMarker = document.createElement('sup');
        footnoteMarker.setAttribute("class", "footnote");
        footnoteMarker.innerHTML = `[${footnoteIndex}]`;
        linkElement.after(footnoteMarker);
    });
    if (footnoteIndex > 0) {
        if (!listStyle) {
            let footnoteArray = footnotes.map((x) => {
                if (x[1] === x[2]) {
                    return `<p><span class="footnote-num">[${x[0]}]</span><span class="footnote-txt"><i>${x[1]}</i></span></p>`;
                }
                return `<p><span class="footnote-num">[${x[0]}]</span><span class="footnote-txt">${x[1]}: <i>${x[2]}</i></span></p>`;
            });
            const footnotesHtml = `<h3>引用链接</h3><section id="footnotes">${footnoteArray.join("")}</section>`;
            document.getElementById("wenyan").innerHTML += footnotesHtml;
        } else {
            let footnoteArray = footnotes.map((x) => {
                if (x[1] === x[2]) {
                    return `<li id="#footnote-${x[0]}">[${x[0]}]: <i>${x[1]}</i></li>`;
                }
                return `<li id="#footnote-${x[0]}">[${x[0]}] ${x[1]}: <i>${x[2]}</i></li>`;
            });
            const footnotesHtml = `<h3>引用链接</h3><div id="footnotes"><ul>${footnoteArray.join("")}</ul></div>`;
            document.getElementById("wenyan").innerHTML += footnotesHtml;
        }
    }
}
function tableToAsciiArt(table) {
    const rows = Array.from(table.querySelectorAll('tr')).map(tr =>
        Array.from(tr.querySelectorAll('th, td')).map(td => td.innerText.trim())
    );

    if (rows.length === 0) return '';

    // 获取每列的最大宽度
    const columnWidths = rows[0].map((_, i) =>
        Math.max(...rows.map(row => row[i].length))
    );

    const horizontalLine = '+' + columnWidths.map(width => '-'.repeat(width + 2)).join('+') + '+\n';

    // 格式化行数据
    const formattedRows = rows.map(row =>
        '| ' + row.map((cell, i) => cell.padEnd(columnWidths[i])).join(' | ') + ' |\n'
    );

    // 构建最终的表格
    let asciiTable = horizontalLine;
    asciiTable += formattedRows[0];  // 表头
    asciiTable += horizontalLine;
    asciiTable += formattedRows.slice(1).join('');  // 表内容
    asciiTable += horizontalLine;

    return asciiTable;
}
// 递归处理所有嵌套的 <ul>，将其转换为 Medium 风格
function transformUl(ulElement) {
    // 先递归处理子 <ul>
    ulElement.querySelectorAll('ul').forEach(nestedUl => {
        transformUl(nestedUl);  // 递归调用处理嵌套 <ul>
    });

    // 把 <li> 转换成 Medium-friendly 格式
    let replaceString = Array.from(ulElement.children).map(item => item.outerHTML).join(' ');
    
    // 将 <li> 标签替换为 Medium 风格列表
    replaceString = replaceString.replace(/<li>/g, '<br>\n- ').replace(/<\/li>/g, '');

    // 将原来的 <ul> 替换为转换后的字符串
    ulElement.outerHTML = replaceString;
}

function replaceCSSVariables(css) {
    // 正则表达式用于匹配变量定义，例如 --sans-serif-font: ...
    const variablePattern = /--([a-zA-Z0-9\-]+):\s*([^;()]*\((?:[^()]*|\([^()]*\))*\)[^;()]*|[^;]+);/g;
    // 正则表达式用于匹配使用 var() 的地方
    const varPattern = /var\(--([a-zA-Z0-9\-]+)\)/g;

    const cssVariables = {};

    // 1. 提取变量定义并存入字典
    let match;
    while ((match = variablePattern.exec(css)) !== null) {
        const variableName = match[1];
        const variableValue = match[2].trim().replaceAll("\n", "");

        // 将变量存入字典
        cssVariables[variableName] = variableValue;
    }

    // 2. 递归解析 var() 引用为字典中对应的值
    function resolveVariable(value, variables, resolved = new Set()) {
        // 如果已经解析过这个值，则返回原始值以避免死循环
        if (resolved.has(value)) return value;

        resolved.add(value);
        let resolvedValue = value;

        // 解析变量
        let match;
        while ((match = varPattern.exec(resolvedValue)) !== null) {
            const varName = match[1];

            // 查找对应的变量值，如果变量引用另一个变量，递归解析
            if (variables[varName]) {
                const resolvedVar = resolveVariable(variables[varName], variables, resolved);
                resolvedValue = resolvedValue.replace(match[0], resolvedVar);
            }
        }
        return resolvedValue;
    }

    // 3. 替换所有变量引用
    for (const key in cssVariables) {
        const resolvedValue = resolveVariable(cssVariables[key], cssVariables);
        cssVariables[key] = resolvedValue;
    }

    // 4. 替换 CSS 中的 var() 引用
    let modifiedCSS = css;
    while ((match = varPattern.exec(css)) !== null) {
        const varName = match[1];

        // 查找对应的变量值
        if (cssVariables[varName]) {
            modifiedCSS = modifiedCSS.replace(match[0], cssVariables[varName]);
        }
    }

    return modifiedCSS.replace(/:root\s*\{[^}]*\}/g, '');
}

function buildPseudoSpan(beforeRresults) {
    // 创建一个新的 <span> 元素
    const span = document.createElement('section');
    // 将伪类的内容和样式应用到 <span> 标签
    if (beforeRresults.get("content")) {
        span.textContent = beforeRresults.get("content").replace(/['"]/g, '');
        beforeRresults.delete("content");
    }
    for (const [k, v] of beforeRresults) {
        if (v.includes("url(")) {
            const svgMatch = v.match(/data:image\/svg\+xml;utf8,(.*<\/svg>)/);
            if (svgMatch) {
                const svgCode = decodeURIComponent(svgMatch[1]);
                span.innerHTML = svgCode;
            }
            beforeRresults.delete(k);
        }
    }
    const entries = Array.from(beforeRresults.entries());
    const cssString = entries.map(([key, value]) => `${key}: ${value}`).join('; ');
    span.style.cssText = cssString;
    return span;
}
function removeComments(input) {
    // 正则表达式：匹配单行和多行注释
    const pattern = /\/\*[\s\S]*?\*\//gm;

    // 使用正则表达式替换匹配的注释部分为空字符串
    const output = input.replace(pattern, '');

    // 返回去除了注释的字符串
    return output;
}

//// 非通用方法
window.onscroll = function() {
    if (!isScrollingFromScript) {
        window.webkit.messageHandlers.scrollHandler.postMessage({ y0: window.scrollY / document.body.scrollHeight });
    }
};
document.addEventListener('click', function(event) {
    window.webkit.messageHandlers.clickHandler.postMessage(null);
});
window.webkit.messageHandlers.loadHandler.postMessage(null);
